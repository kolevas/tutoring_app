<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">
          <v-icon large class="mr-3">mdi-calendar-account</v-icon>
          My Sessions
        </h1>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="activeTab" background-color="transparent" color="primary">
          <v-tab value="upcoming">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            Upcoming
          </v-tab>
          <v-tab value="past">
            <v-icon class="mr-2">mdi-history</v-icon>
            Past Sessions
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="sessionStore.loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Loading your sessions...</p>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="sessionStore.error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ sessionStore.error }}
          <template v-slot:append>
            <v-btn @click="loadMySessions" size="small" variant="text">Retry</v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Session Content -->
    <v-row v-else>
      <v-col cols="12">
        <v-tabs-window v-model="activeTab">
          <!-- Upcoming Sessions -->
          <v-tabs-window-item value="upcoming">
            <SessionsList 
              :sessions="upcomingSessions" 
              :user-role="authStore.user?.role"
              @cancel-session="cancelSession"
              @complete-session="completeSession"
            />
          </v-tabs-window-item>

          <!-- Past Sessions -->
          <v-tabs-window-item value="past">
            <SessionsList 
              :sessions="pastSessions" 
              :user-role="authStore.user?.role"
              show-ratings
            />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-if="!sessionStore.loading && currentTabSessions.length === 0 && allMySessions.length > 0">
      <v-col cols="12" class="text-center py-8">
        <v-icon size="64" color="grey">
          {{ activeTab === 'upcoming' ? 'mdi-calendar-plus-outline' : 'mdi-calendar-minus-outline' }}
        </v-icon>
        <h3 class="text-medium-emphasis mt-4">
          {{ activeTab === 'upcoming' ? 'No Upcoming Sessions' : 'No Past Sessions' }}
        </h3>
        <p class="text-medium-emphasis mb-4">
          {{ activeTab === 'upcoming' 
            ? (authStore.user?.role === 'tutor' 
              ? 'You don\'t have any upcoming sessions. Create a new session to start tutoring.' 
              : 'You don\'t have any upcoming sessions. Book a session to start learning.') 
            : 'You haven\'t attended any sessions yet.' 
          }}
        </p>
        <v-btn 
          v-if="activeTab === 'upcoming'"
          color="primary" 
          :to="authStore.user?.role === 'tutor' ? '/sessions/create' : '/sessions'"
        >
          <v-icon left>{{ authStore.user?.role === 'tutor' ? 'mdi-plus' : 'mdi-magnify' }}</v-icon>
          {{ authStore.user?.role === 'tutor' ? 'Create Session' : 'Find Sessions' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- No sessions at all -->
    <v-row v-if="!sessionStore.loading && allMySessions.length === 0">
      <v-col cols="12" class="text-center py-8">
        <v-icon size="64" color="grey">mdi-calendar-blank</v-icon>
        <h3 class="text-medium-emphasis mt-4">No sessions found</h3>
        <p class="text-medium-emphasis mb-4">
          {{ authStore.user?.role === 'tutor' 
            ? 'Create your first session to start tutoring students.' 
            : 'Book your first session to start learning.' 
          }}
        </p>
        <v-btn 
          color="primary" 
          :to="authStore.user?.role === 'tutor' ? '/sessions/create' : '/sessions'"
        >
          <v-icon left>{{ authStore.user?.role === 'tutor' ? 'mdi-plus' : 'mdi-magnify' }}</v-icon>
          {{ authStore.user?.role === 'tutor' ? 'Create Session' : 'Find Sessions' }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useSessionStore } from '../stores/sessions'
import { useAuthStore } from '../stores/auth'
import SessionsList from '../components/SessionsList.vue'

export default {
  name: 'MySessionsView',
  components: {
    SessionsList
  },
  
  setup() {
    const sessionStore = useSessionStore()
    const authStore = useAuthStore()
    
    return {
      sessionStore,
      authStore
    }
  },

  data() {
    return {
      activeTab: 'upcoming'
    }
  },

  computed: {
    allMySessions() {
      if (!this.authStore.user) return []
      
      return this.sessionStore.mySessions(this.authStore.user._id, this.authStore.user.role)
    },

    upcomingSessions() {
      const now = new Date()
      return this.allMySessions.filter(session => {
        const sessionDate = new Date(session.date)
        return sessionDate >= now && ['available', 'booked'].includes(session.status)
      }).sort((a, b) => new Date(a.date) - new Date(b.date))
    },

    pastSessions() {
      const now = new Date()
      return this.allMySessions.filter(session => {
        const sessionDate = new Date(session.date)
        return sessionDate < now || ['completed', 'cancelled'].includes(session.status)
      }).sort((a, b) => new Date(b.date) - new Date(a.date))
    },

    currentTabSessions() {
      return this.activeTab === 'upcoming' ? this.upcomingSessions : this.pastSessions
    }
  },

  methods: {
    async loadMySessions() {
      try {
        await this.sessionStore.fetchSessions()
      } catch (error) {
        console.error('Error loading sessions:', error)
      }
    },

    async cancelSession(sessionId) {
      const result = await this.sessionStore.cancelBooking(sessionId)
      if (result.success) {
        console.log('Session cancelled successfully')
      } else {
        console.error('Failed to cancel session:', result.error)
      }
    },

    async completeSession(sessionId) {
      const result = await this.sessionStore.updateSession(sessionId, { status: 'completed' })
      if (result.success) {
        console.log('Session marked as completed')
      } else {
        console.error('Failed to update session:', result.error)
      }
    }
  },

  async mounted() {
    await this.loadMySessions()
  }
}
</script>

<style scoped>
.v-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.v-tabs {
  margin-bottom: 20px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  background: #fff;
}

.v-tabs-window {
  background-color: transparent;
}

.v-tabs-window-item {
  padding-top: 1rem;
}

.v-alert {
  border-radius: 12px;
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.text-medium-emphasis {
  color: #607d8b;
}

.v-icon {
  vertical-align: middle;
}

@media (max-width: 600px) {
  .v-tabs {
    font-size: 0.95rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .v-btn {
    font-size: 0.95rem;
    padding: 0.5rem 1rem;
  }
}
</style>
