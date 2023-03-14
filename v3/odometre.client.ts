// @ts-ignore
import Vue3Odometer from 'vue3-odometer'
import 'odometer/themes/odometer-theme-default.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Odometer', Vue3Odometer)
})
