// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
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
    aiProvider: process.env.AI_PROVIDER,
    doubaoApiKey: process.env.DOUBAO_API_KEY,
    doubaoModelEndpoint: process.env.DOUBAO_MODEL_ENDPOINT,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekModel: process.env.DEEPSEEK_MODEL,
    zenmuxApiKey: process.env.ZENMUX_API_KEY,
    zenmuxModel: process.env.ZENMUX_MODEL,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
    ollamaModel: process.env.OLLAMA_MODEL,

    // Public keys (exposed to client-side)
    public: {
      // Add any public environment variables here if needed
    }
  },

  // Build configuration
  build: {
    transpile: ['flowbite']
  },

  // Nitro configuration for production
  nitro: {
    compressPublicAssets: true,
  },

  // App configuration for proper asset handling
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        }
      ]
    }
  },

  // Vite configuration for better asset handling
  vite: {
    css: {
      preprocessorOptions: {
        css: { charset: false }
      }
    }
  }
})
