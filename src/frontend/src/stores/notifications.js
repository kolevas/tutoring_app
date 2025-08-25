import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0
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
    // Add a new notification
    addNotification(notification) {
      const newNotification = {
        id: Date.now(),
        show: true,
        timeout: 5000,
        ...notification,
        read: false,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
      
      this.notifications.unshift(newNotification)
      this.updateUnreadCount()
      
      return newNotification
    },

    // Dismiss a notification (hide the toast)
    dismissNotification(id) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.show = false
      }
    },

    // Mark notification as read
    markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
        this.updateUnreadCount()
      }
    },

    // Mark all notifications as read
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
      this.updateUnreadCount()
    },

    // Remove notification
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
      this.updateUnreadCount()
    },

    // Clear all notifications
    clearAll() {
      this.notifications = []
      this.unreadCount = 0
    },

    // Update unread count
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    // Session booking notification
    sessionBooked(session, student) {
      return this.addNotification({
        type: 'session_booked',
        title: 'Session Booked',
        message: `${student.name} has booked your session "${session.title}"`,
        icon: 'mdi-calendar-check',
        color: 'success',
        action: {
          text: 'View Session',
          route: `/tutor-sessions`
        },
        data: { sessionId: session._id, studentId: student._id }
      })
    },

    // Session cancelled notification
    sessionCancelled(session, cancelledBy) {
      return this.addNotification({
        type: 'session_cancelled',
        title: 'Session Cancelled',
        message: `Session "${session.title}" has been cancelled by ${cancelledBy.name}`,
        icon: 'mdi-calendar-remove',
        color: 'warning',
        action: {
          text: 'View Details',
          route: '/my-sessions'
        },
        data: { sessionId: session._id }
      })
    },

    // Session reminder notification
    sessionReminder(session) {
      return this.addNotification({
        type: 'session_reminder',
        title: 'Session Reminder',
        message: `Your session "${session.title}" starts in 1 hour`,
        icon: 'mdi-clock-alert',
        color: 'info',
        action: {
          text: 'Join Session',
          route: session.meetingLink || '/my-sessions'
        },
        data: { sessionId: session._id }
      })
    },

    // New session available notification
    newSessionAvailable(session) {
      return this.addNotification({
        type: 'new_session',
        title: 'New Session Available',
        message: `New ${session.subject} session: "${session.title}" by ${session.tutor.name}`,
        icon: 'mdi-calendar-plus',
        color: 'primary',
        action: {
          text: 'View Session',
          route: '/sessions'
        },
        data: { sessionId: session._id }
      })
    },

    // System notification
    systemNotification(title, message, type = 'info') {
      return this.addNotification({
        type: 'system',
        title,
        message,
        icon: 'mdi-information',
        color: type,
        data: {}
      })
    }
  }
})
