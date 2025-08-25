import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { eventBus } from './utils/eventBus'
import { useAuthStore } from './stores/auth'

// Import custom CSS after Vuetify
import './assets/main.css'

// Create the app instance
const app = createApp(App)

// Install Pinia first
const pinia = createPinia()
app.use(pinia)

// Initialize auth from persisted cookies BEFORE router mounts components
const authStore = useAuthStore()
authStore.initializeAuth()

// Add error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err, info)
}

// Provide global event bus
app.config.globalProperties.$eventBus = eventBus

// Install remaining plugins
app.use(router)
app.use(vuetify)

// Mount the app
app.mount('#app')
