import { Client, ClientOptions, Exchange, createClient, dedupExchange, errorExchange, fetchExchange, ssrExchange } from '@urql/core'
import { ref } from 'vue'
import { devtoolsExchange } from '@urql/devtools'
import * as Session from 'supertokens-web-js/recipe/session'
import { authExchange } from '@urql/exchange-auth'
import { relayPagination } from '@urql/exchange-graphcache/extras'

import { offlineExchange } from '@urql/exchange-graphcache'
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage'
import { provideClient } from '@urql/vue'
import { defineNuxtPlugin } from '#app'
import { makeAsyncStorage } from '~/utils/makeAsyncStorage'

import { GraphCacheConfig } from '~/graphql/schema'
import introspection from '~/graphql/introspection'

const ssrKey = '__URQL_DATA__'

export default defineNuxtPlugin((nuxtApp) => {
    const env = useRuntimeConfig()

    const ssr = ssrExchange({
        isClient: process.client,
    })

    // when app is created in browser, restore SSR state from nuxt payload
    if (process.client) {
        nuxtApp.hook('app:created', () => {
            ssr.restoreData(nuxtApp.payload[ssrKey])
        })
    }

    // send SSR status to client when application is created on server
    if (process.server) {
        nuxtApp.hook('app:rendered', () => {
            if (nuxtApp.payload.data)
                nuxtApp.payload[ssrKey] = ssr.extractData()
        })
    }

    // Restore SSR payload once app is created on the client
    if (process.client) {
        nuxtApp.hook('app:created', () => {
            if (nuxtApp.payload?.data)
                ssr.restoreData(nuxtApp.payload.data[ssrKey])
        })
    }

    const storage = makeDefaultStorage({
        idbName: 'graphcache-v3', // The name of the IndexedDB database
        maxAge: 7, // The maximum age of the persisted data in days
    })

    const storageMobile = makeAsyncStorage({
        dataKey: 'graphcache-data', // The AsyncStorage key used for the data (defaults to graphcache-data)
        metadataKey: 'graphcache-metadata', // The AsyncStorage key used for the metadata (defaults to graphcache-metadata)
        maxAge: 7, // How long to persist the data in storage (defaults to 7 days)
    })

    const schema = introspection as GraphCacheConfig['schema']

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const cache = offlineExchange<GraphCacheConfig>({
        schema,
        storage: env.public.mobile ? storageMobile : storage,
        updates: {
            /* ... */
            Mutation: {
                
            },
        },
        optimistic: {
            /* ... */
        },
        resolvers: {
            /* ... */
        },
        keys: {
            /* ... */
        },
    })

    const exchanges = [
        cache,
        dedupExchange,
        ssr, // Add `ssr`
        fetchExchange,
        errorExchange({
            onError(error) {
                if (error.response?.status === 401)
                    window.location.href = '/logout'
            },
        }),
        authExchange<{ token: string }>({
            getAuth: async ({ authState }) => {
                if (!authState) {
                    const token = await Session.getAccessToken() || ''
                    return { token }
                }
                return authState
            },
            addAuthToOperation: ({ authState, operation }) => {
                const isMobile = env.public.mobile

                if (!authState || !authState.token || !isMobile)
                    return operation

                const fetchOptions
                    = typeof operation.context.fetchOptions === 'function'
                        ? operation.context.fetchOptions()
                        : (operation.context.fetchOptions || {})
                return {
                    ...operation,
                    context: {
                        ...operation.context,
                        fetchOptions: {
                            ...fetchOptions,
                            headers: {
                                ...fetchOptions.headers,
                                Authorization: `Bearer ${authState.token}`,
                            },
                        },
                    },
                }
            },
        }),
    ] as Exchange[]

    const isDev = process.env.NODE_ENV === 'development'

    // Devtools exchange
    if (isDev)
        exchanges.unshift(devtoolsExchange)

    const options: ClientOptions = {
        url: env.public.graphql,
        exchanges,
        fetchOptions: () => {
            const env = useRuntimeConfig()
            const isMobile = env.public.mobile
            const lang = 'en'
            const header = isMobile
                ? {
                    'X-language': lang || 'en',
                    'X-Client': isMobile ? 'mobile' : 'web',
                } as HeadersInit
                : {
                    'X-language': lang || 'en',
                    'X-Client': isMobile ? 'mobile' : 'web',
                } as HeadersInit
            return process.client
                ? {
                    headers: header as HeadersInit,
                }
                : {}
        },
    }

    const client = ref(createClient(options))

    function urqlReset() {
        client.value = createClient(options)
    }

    nuxtApp.hook('vue:setup', () => {
        const { $urql } = useNuxtApp()
        provideClient($urql)
    })

    return {
        provide: {
            urql: client,
            urqlReset,
        },
    }
})

declare module '#app' {
    interface NuxtApp {
        $urql: Ref<Client>
        urqlReset: () => undefined
    }
}

declare module 'nuxt/dist/app/nuxt' {
    interface NuxtApp {
        $urql: Ref<Client>
        urqlReset: () => undefined
    }
}
