// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/cloudinary',
    '@nuxt/content',
    '@nuxt/image',
  ],
  devtools: { enabled: true },
  app: {
    pageTransition: { mode: 'out-in', name: 'page' },
    head: { htmlAttrs: { lang: 'en' } },
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-04-03',
  cloudinary: {
    apiKey: '0_8uJdmVY7tvkKR_iEUhMOJb6Gw',
    cloudName: 'dt1ribmno',
  },
  eslint: { config: { stylistic: true } },
})
