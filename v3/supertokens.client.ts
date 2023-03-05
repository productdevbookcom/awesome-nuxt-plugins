import SuperTokens from 'supertokens-web-js/index.js'
import Session from 'supertokens-web-js/recipe/session/index.js'
import ThirdPartyEmailPassword from 'supertokens-web-js/recipe/thirdpartyemailpassword/index.js'
import EmailVerification from 'supertokens-web-js/recipe/emailverification'

export default defineNuxtPlugin((_nuxtApp) => {
  const env = useRuntimeConfig()
  const app = SuperTokens.init({
    appInfo: {
      apiDomain: env.public.api,
      apiBasePath: '/auth',
      appName: 'appname',
    },
    recipeList: [
      EmailVerification.init(),
      Session.init({
        tokenTransferMethod: env.public.mobile ? 'header' : 'cookie',
      }),
      ThirdPartyEmailPassword.init(),
    ],
  })

  return {
    provide: {
      authApp: app,
    },
  }
})
