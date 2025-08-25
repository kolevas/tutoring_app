<template>
  <div class="notification-container">
    <!-- Toast Notifications -->
    <v-snackbar
      v-for="notification in visibleNotifications"
      :key="notification.id"
      v-model="notification.show"
      :color="notification.type"
      :timeout="notification.timeout"
      location="top right"
      multi-line
      vertical
      class="notification-snackbar"
      :style="{ 'z-index': 10000 + notification.id }"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">{{ getIcon(notification.type) }}</v-icon>
        <div class="flex-grow-1">
          <div class="font-weight-medium">{{ notification.title }}</div>
          <div v-if="notification.message" class="text-caption">
            {{ notification.message }}
          </div>
        </div>
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          size="small"
          @click="dismissNotification(notification.id)"
        >
          <v-icon size="small">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

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
          class="notification-bell"
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
              {{ formatTime(notification.timestamp) }}
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
      showNotificationMenu: false
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
    
    formatTime(timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInHours = (now - time) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - time) / (1000 * 60))
        return `${diffInMinutes}m ago`
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
  }
}
</script>

<style scoped>
.notification-container {
  position: relative;
}

.notification-snackbar {
  margin-top: 60px;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  background: #fff;
}

.notification-bell {
  background: transparent !important;
  box-shadow: none !important;
}

.notification-bell .v-icon {
  color: rgba(var(--v-theme-on-surface), 0.7);
  transition: color 0.2s;
}

.notification-bell:hover {
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
}

.notification-bell:hover .v-icon {
  color: rgba(var(--v-theme-on-surface), 1) !important;
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
