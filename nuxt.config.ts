// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxt/fonts',
  ],
  devtools: { enabled: true },
  app: {
    pageTransition: { mode: 'out-in', name: 'page' },
    head: { htmlAttrs: { lang: 'en' } },
  },
  compatibilityDate: '2024-04-03',
  eslint: { config: { stylistic: true } },
})
