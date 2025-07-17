// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false
  },
  
  // CSS configuration
  css: ['~/assets/css/main.css'],
  
  // PostCSS configuration (proper Nuxt way)
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
  // Build configuration
  build: {
    transpile: ['flowbite']
  }
})
