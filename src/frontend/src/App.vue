<template>
  <v-app>
    <div class="app-background">
      <div class="bg-gradient-primary"></div>
      <div class="bg-pattern"></div>
      <div class="bg-overlay"></div>
    </div>
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
      variant="elevated"
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

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const authReady = ref(false)

    onMounted(() => {
      // Auth already initialized in main.js; just mark ready next tick
      requestAnimationFrame(() => { authReady.value = true })
    })

    // Provide global notification method
    const showNotification = (text, color = 'success', icon = 'mdi-check-circle') => {
      // This will be handled by the notification store or component
      console.log('Notification:', text, color)
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
    
    // Add global event listener for notifications
    this.$root.$on('showSnackbar', this.showSnackbar)
    
    window.addEventListener('show-notification', (event) => {
      this.showSnackbar(event.detail.text, event.detail.color, event.detail.icon)
    })
  },

  beforeUnmount() {
    this.$root.$off('showSnackbar', this.showSnackbar)
    window.removeEventListener('show-notification', () => {})
  }
}
</script>

<style>
@import './design/tokens.css';

/* Global app styles */
html, body {
  background-color: var(--color-bg) !important;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.v-application {
  background: transparent !important;
  font-family: var(--font-stack) !important;
}

/* Enhanced background system */
.app-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-gradient-primary {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--color-bg) 0%,
    var(--color-bg-secondary) 25%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 75%,
    var(--color-bg) 100%
  );
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(52,134,235,0.08) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(44,26,135,0.06) 0%, transparent 50%),
    radial-gradient(circle at 50% 0%, rgba(52,134,235,0.04) 0%, transparent 50%),
    radial-gradient(circle at 0% 50%, rgba(44,26,135,0.04) 0%, transparent 50%);
  background-size: 800px 800px, 600px 600px, 1000px 1000px, 700px 700px;
  background-position: 0% 0%, 100% 100%, 50% 0%, 0% 50%;
  animation: float 20s ease-in-out infinite;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(248,251,255,0.4) 50%,
    rgba(248,251,255,0.8) 100%
  );
}

@keyframes float {
  0%, 100% {
    transform: translate(0px, 0px) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(1deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(-1deg);
  }
}

/* Route transitions */
.route-fade-enter-active,
.route-fade-leave-active {
  transition: all var(--transition-normal);
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
.notification-snackbar {
  backdrop-filter: blur(16px) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-xl) !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gradient);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--color-accent-dark), var(--color-primary-dark));
}

::-webkit-scrollbar-corner {
  background: var(--color-bg-secondary);
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--color-bg-secondary);
}

/* Selection styling */
::selection {
  background: rgba(52,134,235,0.2);
  color: var(--color-text-primary);
}

::-moz-selection {
  background: rgba(52,134,235,0.2);
  color: var(--color-text-primary);
}

/* Disable animations on reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .bg-pattern {
    animation: none;
  }
  
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
