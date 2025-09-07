<template>
  <div class="notification-container">
    <!-- Custom Toast Notifications -->
    <div class="notification-toasts">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in visibleNotifications"
          :key="notification.id"
          :class="[
            'notification-toast',
            `notification-toast--${notification.type}`
          ]"
          :style="{ 'z-index': 10000 + notification.id }"
        >
          <div class="notification-content">
            <div class="d-flex align-center">
              <v-icon class="mr-3" :color="getTypeColor(notification.type)">
                {{ getIcon(notification.type) }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="notification-title">{{ notification.title }}</div>
                <div v-if="notification.message" class="notification-message">
                  {{ notification.message }}
                </div>
              </div>
              <v-btn
                variant="text"
                size="small"
                icon
                @click="dismissNotification(notification.id)"
                class="notification-close"
              >
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Notification Bell Icon -->
    <v-menu
      v-model="showNotificationMenu"
      offset-y
      :close-on-content-click="false"
      max-width="400"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          class="notification-bell header-btn"
          variant="text"
          aria-label="Notifications"
        >
          <v-badge
            :content="unreadCount"
            :model-value="unreadCount > 0"
            color="error"
            overlap
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="py-2">
          <span>Notifications</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            small
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
          >
            <v-icon small>mdi-check-all</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="showNotificationMenu = false"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-list
          v-if="allNotifications.length > 0"
          density="compact"
          max-height="300"
          style="overflow-y: auto;"
        >
          <v-list-item
            v-for="notification in allNotifications"
            :key="notification.id"
            :class="{ 'notification-unread': !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <template v-slot:prepend>
              <v-icon :color="notification.type">
                {{ getIcon(notification.type) }}
              </v-icon>
            </template>
            
            <v-list-item-title class="text-wrap">
              {{ notification.title }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="notification.message" class="text-wrap">
              {{ notification.message }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              {{ formatTime(notification.createdAt) }}
            </v-list-item-subtitle>
            
            <template v-slot:append v-if="!notification.read">
              <v-chip size="x-small" color="primary">New</v-chip>
            </template>
          </v-list-item>
        </v-list>
        
        <v-card-text v-else class="text-center text-grey">
          <v-icon size="large">mdi-bell-off</v-icon>
          <p class="mt-2">No notifications</p>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { useNotificationStore } from '../stores/notifications'

export default {
  name: 'NotificationComponent',
  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },
  
  data() {
    return {
      showNotificationMenu: false,
      notificationInterval: null
    }
  },
  
  computed: {
    allNotifications() {
      return this.notificationStore.notifications
    },
    
    visibleNotifications() {
      return this.notificationStore.visibleNotifications
    },
    
    unreadCount() {
      return this.notificationStore.unreadCount
    }
  },
  
  methods: {
    getIcon(type) {
      const icons = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information',
        booking: 'mdi-calendar-check',
        cancellation: 'mdi-calendar-remove',
        reminder: 'mdi-bell-ring'
      }
      return icons[type] || 'mdi-information'
    },
    
    getTypeColor(type) {
      const colors = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
      }
      return colors[type] || 'info'
    },
    
    formatTime(timestamp) {
      if (!timestamp) return 'Invalid Date'
      
      const now = new Date()
      const time = new Date(timestamp)
      
      // Check if the date is valid
      if (isNaN(time.getTime())) {
        return 'Invalid Date'
      }
      
      const diffInHours = (now - time) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - time) / (1000 * 60))
        return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`
      } else {
        return time.toLocaleDateString()
      }
    },
    
    dismissNotification(id) {
      this.notificationStore.dismissNotification(id)
    },
    
    markAsRead(id) {
      this.notificationStore.markAsRead(id)
    },
    
    markAllAsRead() {
      this.notificationStore.markAllAsRead()
    }
  },
  
  mounted() {
    // Fetch notifications from backend but don't show as toasts on page load
    this.notificationStore.fetchNotifications()
    
    // Auto-dismiss notifications after timeout
    this.$watch('visibleNotifications', (newNotifications) => {
      newNotifications.forEach(notification => {
        if (notification.show && notification.timeout > 0) {
          setTimeout(() => {
            this.dismissNotification(notification.id || notification._id)
          }, notification.timeout)
        }
      })
    }, { immediate: true, deep: true })
    
    // Periodically check for new notifications (every 30 seconds)
    this.notificationInterval = setInterval(() => {
      this.notificationStore.fetchUnreadCount()
    }, 30000)
  },
  
  beforeUnmount() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval)
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: relative;
}

.notification-toasts {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
  max-width: 400px;
}

.notification-toast {
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  overflow: hidden;
  max-width: 400px;
  min-width: 320px;
}

.notification-toast--success {
  border-left: 4px solid #4CAF50;
}

.notification-toast--error {
  border-left: 4px solid #F44336;
}

.notification-toast--warning {
  border-left: 4px solid #FF9800;
}

.notification-toast--info {
  border-left: 4px solid #2196F3;
}

.notification-content {
  padding: 16px;
}

.notification-title {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.3;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 0.85rem;
  opacity: 0.8;
  line-height: 1.3;
}

.notification-close {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

.navbar-dropdown-menu {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  background: #fff;
}

.v-card {
  border-radius: 16px !important;
}

.v-card-title {
  font-weight: 600;
  font-size: 1.15rem;
  padding-bottom: 0.5rem !important;
}

.v-chip {
  border-radius: 8px;
  font-size: 0.90rem;
  font-weight: 500;
}

.notification-unread {
  background-color: rgba(25, 118, 210, 0.07);
  border-left: 3px solid #1976D2;
}

:deep(.v-list-item__content) {
  overflow: visible;
}

:deep(.v-list-item__title) {
  white-space: normal;
  line-height: 1.3;
}

:deep(.v-list-item__subtitle) {
  white-space: normal;
  line-height: 1.2;
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
}

.v-icon {
  vertical-align: middle;
}

@media (max-width: 600px) {
  .navbar-dropdown-menu {
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }
  .v-card-title {
    font-size: 1rem;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}
</style>
