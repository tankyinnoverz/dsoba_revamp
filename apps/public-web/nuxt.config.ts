export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  dir: { public: '../../public' },
  runtimeConfig: { public: { apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1' } },
  app: { head: { titleTemplate: '%s · DSOBA', title: 'Editorial Heritage' } },
})
