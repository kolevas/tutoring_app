<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">
          <v-icon large class="mr-3">mdi-account-search</v-icon>
          Find Tutors
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">
          Discover experienced tutors and book sessions that fit your schedule
        </p>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="sessionStore.loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Loading sessions...</p>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="sessionStore.error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ sessionStore.error }}
          <template v-slot:append>
            <v-btn @click="loadSessions" size="small" variant="text">Retry</v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Sessions Grid -->
    <v-row v-else-if="availableSessions.length > 0">
      <v-col 
        v-for="session in availableSessions" 
        :key="session._id"
        cols="12" 
        sm="6" 
        md="4" 
        lg="3"
      >
        <v-card class="session-card" elevation="2">
          <v-card-title>
            <div>
              <h3>{{ session.subject }}</h3>
              <v-chip size="small" color="primary">{{ session.level }}</v-chip>
            </div>
          </v-card-title>
          
          <v-card-text>
            <div class="mb-2">
              <v-icon small class="mr-1">mdi-account</v-icon>
              <strong>{{ session.tutor.name }}</strong>
            </div>
            <div class="mb-2">
              <v-icon small class="mr-1">mdi-currency-usd</v-icon>
              ${{ session.price }}/hour
            </div>
            <div class="mb-2">
              <v-icon small class="mr-1">mdi-calendar</v-icon>
              {{ formatDate(session.date) }}
            </div>
            <div class="mb-2">
              <v-icon small class="mr-1">mdi-clock</v-icon>
              {{ session.startTime }} - {{ session.endTime }}
            </div>
            <div class="mb-2">
              <v-icon small class="mr-1">mdi-timelapse</v-icon>
              {{ session.duration }} minutes
            </div>
            <p class="text-body-2 mt-2">{{ session.description || 'No description available' }}</p>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="primary"
              :loading="sessionStore.loading"
              @click="bookSession(session._id)"
            >
              Book Session
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- No sessions message -->
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">mdi-calendar-blank</v-icon>
        <h3 class="text-medium-emphasis mt-4">No available sessions found</h3>
        <p class="text-medium-emphasis">Check back later for new sessions.</p>
        <v-btn @click="loadSessions" color="primary" class="mt-4">
          <v-icon left>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          Booking Successful!
        </v-card-title>
        <v-card-text>
          Your session has been booked successfully.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="successDialog = false">
            OK
          </v-btn>
          <v-btn color="secondary" to="/my-sessions">
            View My Bookings
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useSessionStore } from '../stores/sessions'
import { useUserStore } from '../stores/users'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

export default {
  name: 'SessionsView',
  
  setup() {
    const sessionStore = useSessionStore()
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    
    return {
      sessionStore,
      userStore,
      authStore,
      notificationStore
    }
  },

  data() {
    return {
      successDialog: false
    }
  },

  computed: {
    availableSessions() {
      return this.sessionStore.availableSessions || []
    }
  },

  methods: {
    async loadSessions() {
      try {
        await this.sessionStore.fetchAvailableSessions()
      } catch (error) {
        console.error('Error loading sessions:', error)
        this.notificationStore.addNotification({
          title: 'Error',
          message: 'Failed to load sessions',
          type: 'error'
        })
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    async bookSession(sessionId) {
      try {
        const success = await this.sessionStore.bookSession(sessionId)
        if (success) {
          this.successDialog = true
          this.notificationStore.addNotification({
            title: 'Success',
            message: 'Session booked successfully!',
            type: 'success'
          })
          // Refresh available sessions
          await this.loadSessions()
        }
      } catch (error) {
        console.error('Error booking session:', error)
        this.notificationStore.addNotification({
          title: 'Booking Failed',
          message: error.message || 'Failed to book session',
          type: 'error'
        })
      }
    }
  },

  async mounted() {
    await this.loadSessions()
  }
}
</script>

<style scoped>
.session-card {
  transition: all 0.3s ease;
  height: 100%;
}

.session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.v-chip {
  margin-left: auto;
}
</style>
