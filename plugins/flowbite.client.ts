import { initFlowbite } from 'flowbite'

export default defineNuxtPlugin(() => {
  if (process.client) {
    initFlowbite()
  }
})