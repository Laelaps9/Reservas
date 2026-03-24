// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    typeCheck: false,
  },
  css: ['./app/assets/main.css'],
  modules: ['@nuxt/eslint']
})
