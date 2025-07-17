/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./node_modules/flowbite/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        // Retro terminal colors
        'retro-green': '#00ff00',
        'retro-amber': '#ffbf00',
        'retro-dark': '#0a0a0a',
        'retro-gray': '#333333',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
      gridTemplateColumns: {
        // 添加自定义网格列配置
        '13': 'repeat(13, minmax(0, 1fr))',
      }
    },
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/typography'),
  ],
}