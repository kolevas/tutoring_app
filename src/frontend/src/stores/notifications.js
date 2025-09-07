import { defineStore } from 'pinia'
import api from '../services/api'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  }),

  getters: {
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.read)
    },

    recentNotifications: (state) => {
      return state.notifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    },

    visibleNotifications: (state) => {
      return state.notifications.filter(n => n.show)
    }
  },

  actions: {
    // Fetch notifications from backend
    async fetchNotifications(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/notifications', { params })
        if (response.data.success) {
          this.notifications = response.data.data.map(notification => ({
            ...notification,
            id: notification._id, // Ensure we have id for compatibility
            show: false // Don't auto-show notifications loaded from backend
          }))
          this.unreadCount = response.data.unreadCount
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch notifications'
        console.error('Fetch notifications error:', error)
      } finally {
        this.loading = false
      }
    },

    // Fetch and show recent unread notifications as toasts
    async fetchAndShowRecentNotifications() {
      try {
        const response = await api.get('/notifications', { 
          params: { 
            read: false, 
            limit: 5,
            sort: '-createdAt'
          } 
        })
        
        if (response.data.success) {
          // Show recent unread notifications as toasts
          response.data.data.forEach(notification => {
            const existingNotification = this.notifications.find(n => 
              n._id === notification._id || n.id === notification._id
            )
            
            if (!existingNotification) {
              // Add new notification and show as toast
              this.notifications.unshift({
                ...notification,
                id: notification._id,
                show: true,
                timeout: 8000 // Show for 8 seconds
              })
            } else {
              // Update existing notification and show as toast if not read
              Object.assign(existingNotification, notification)
              if (!existingNotification.read) {
                existingNotification.show = true
                existingNotification.timeout = 8000
              }
            }
          })
          this.updateUnreadCount()
        }
      } catch (error) {
        console.error('Fetch recent notifications error:', error)
      }
    },

    // Fetch unread count
    async fetchUnreadCount() {
      try {
        const response = await api.get('/notifications/unread-count')
        if (response.data.success) {
          this.unreadCount = response.data.unreadCount
        }
      } catch (error) {
        console.error('Fetch unread count error:', error)
      }
    },

    // Add a new notification (for real-time notifications)
    addNotification(notification) {
      const now = new Date().toISOString()
      const newNotification = {
        id: Date.now(),
        show: true,
        timeout: 5000,
        ...notification,
        read: false,
        createdAt: now
      }
      
      this.notifications.unshift(newNotification)
      this.updateUnreadCount()
      
      return newNotification
    },

    // Dismiss a notification (hide the toast)
    dismissNotification(id) {
      const notification = this.notifications.find(n => 
        n.id === id || n._id === id || n._id === String(id) || n.id === String(id)
      )
      if (notification) {
        notification.show = false
      }
    },

    // Mark notification as read
    async markAsRead(id) {
      try {
        // Use the _id for backend calls, but support both id formats
        const notificationId = typeof id === 'object' ? id._id || id.id : id
        const response = await api.put(`/notifications/${notificationId}/read`)
        if (response.data.success) {
          const notification = this.notifications.find(n => 
            n._id === notificationId || n.id === notificationId ||
            n._id === String(notificationId) || n.id === String(notificationId)
          )
          if (notification) {
            notification.read = true
            notification.readAt = new Date().toISOString()
            this.updateUnreadCount()
          }
        }
      } catch (error) {
        console.error('Mark as read error:', error)
      }
    },

    // Mark all notifications as read
    async markAllAsRead() {
      try {
        const response = await api.put('/notifications/mark-all-read')
        if (response.data.success) {
          this.notifications.forEach(n => {
            n.read = true
            n.readAt = new Date().toISOString()
          })
          this.unreadCount = 0
        }
      } catch (error) {
        console.error('Mark all as read error:', error)
      }
    },

    // Remove notification
    async removeNotification(id) {
      try {
        const response = await api.delete(`/notifications/${id}`)
        if (response.data.success) {
          this.notifications = this.notifications.filter(n => n._id !== id)
          this.updateUnreadCount()
        }
      } catch (error) {
        console.error('Remove notification error:', error)
      }
    },

    // Clear all notifications
    clearAll() {
      this.notifications = []
      this.unreadCount = 0
    },

    // Update unread count (local)
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    // Legacy methods for compatibility (now create backend notifications)
    async sessionBooked(session, student) {
      // This would now be handled by the backend when a session is booked
      return this.addNotification({
        type: 'session_booked',
        title: 'Session Booked',
        message: `${student.name} has booked your session "${session.title}"`,
        data: { sessionId: session._id, studentId: student._id }
      })
    },

    async sessionCancelled(session, cancelledBy) {
      return this.addNotification({
        type: 'session_cancelled',
        title: 'Session Cancelled',
        message: `Session "${session.title}" has been cancelled by ${cancelledBy.name}`,
        data: { sessionId: session._id }
      })
    },

    async sessionReminder(session) {
      return this.addNotification({
        type: 'session_reminder',
        title: 'Session Reminder',
        message: `Your session "${session.title}" starts in 1 hour`,
        data: { sessionId: session._id }
      })
    },

    async newSessionAvailable(session) {
      return this.addNotification({
        type: 'new_session',
        title: 'New Session Available',
        message: `New ${session.subject} session: "${session.title}" by ${session.tutor.name}`,
        data: { sessionId: session._id }
      })
    },

    async systemNotification(title, message, type = 'info') {
      return this.addNotification({
        type: 'system',
        title,
        message,
        data: {}
      })
    }
  }
})
