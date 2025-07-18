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
  
  // Runtime configuration to expose environment variables to client
  runtimeConfig: {
    // Private keys (only available on server-side)
    doubaoApiKey: process.env.DOUBAO_API_KEY,
    doubaoModelEndpoint: process.env.DOUBAO_MODEL_ENDPOINT,
    
    // Public keys (exposed to client-side)
    public: {
      // Add any public environment variables here if needed
    }
  },
  
  // Build configuration
  build: {
    transpile: ['flowbite']
  }
})
