<template>
  <v-app>
    <router-view v-slot="{ Component }">
      <transition name="route-fade" mode="out-in">
        <component :is="Component" v-if="authReady" />
      </transition>
    </router-view>
    
    <!-- Global Notification System -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
      variant="filled"
      class="notification-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
        <span class="font-medium">{{ snackbar.text }}</span>
      </div>
      <template v-slot:actions>
        <v-btn
          variant="text"
          size="small"
          @click="snackbar.show = false"
          class="text-white"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { ref, provide, onMounted } from 'vue'
import { eventBus } from './utils/eventBus'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const authReady = ref(false)

    onMounted(() => {
      requestAnimationFrame(() => { authReady.value = true })
    })

    const showNotification = (text, color = 'success', icon = 'mdi-check-circle') => {
      // Debug: Notification triggered
    }
    
    provide('showNotification', showNotification)
    
    return { authStore, authReady }
  },

  data() {
    return {
      snackbar: {
        show: false,
        text: '',
        color: 'success',
        icon: 'mdi-check-circle',
        timeout: 4000
      }
    }
  },

  methods: {
    showSnackbar(text, color = 'success', icon = 'mdi-check-circle') {
      this.snackbar = {
        show: true,
        text,
        color,
        icon,
        timeout: 4000
      }
    }
  },

  mounted() {
    console.log('FINKI Tutor App loaded successfully!')
    eventBus.on('showSnackbar', this.showSnackbar)
    
    window.addEventListener('show-notification', (event) => {
      this.showSnackbar(event.detail.text, event.detail.color, event.detail.icon)
    })
  },

  beforeUnmount() {
    eventBus.off('showSnackbar', this.showSnackbar)
    window.removeEventListener('show-notification', () => {})
  }
}
</script>

<style>
@import './design/tokens.css';

/* Route transitions */
.route-fade-enter-active,
.route-fade-leave-active {
  transition: all 0.3s ease;
}

.route-fade-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}

.route-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(1.02);
}

/* Enhanced notification styling */
.notification-snackbar .v-snackbar__content {
  background: transparent !important;
}

.notification-snackbar {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

/* Disable animations on reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .route-fade-enter-active,
  .route-fade-leave-active {
    transition: none;
  }
  
  .route-fade-enter-from,
  .route-fade-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
