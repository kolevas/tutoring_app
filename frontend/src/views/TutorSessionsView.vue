<template>
  <v-container fluid style="margin-top: 80px;">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">
          <v-icon large class="mr-3">mdi-school</v-icon>
          Manage My Sessions
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">
          View and manage all your tutoring sessions
        </p>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="activeTab" background-color="transparent" color="primary">
          <v-tab value="available">
            <v-icon class="mr-2">mdi-calendar-check</v-icon>
            Available ({{ availableSessions.length }})
          </v-tab>
          <v-tab value="booked">
            <v-icon class="mr-2">mdi-calendar-account</v-icon>
            Booked ({{ bookedSessions.length }})
          </v-tab>
          <v-tab value="completed">
            <v-icon class="mr-2">mdi-check-circle</v-icon>
            Completed ({{ completedSessions.length }})
          </v-tab>
          <v-tab value="all">
            <v-icon class="mr-2">mdi-calendar-multiple</v-icon>
            All Sessions
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!-- Session Content -->
    <v-row>
      <v-col cols="12">
        <TutorSessionsList 
          :sessions="filteredSessions" 
          :status="activeTab"
          @edit-session="editSession"
          @delete-session="deleteSession"
          @duplicate-session="duplicateSession"
          @complete-session="completeSession"
          @cancel-session="cancelSession"
          @contact-student="contactStudent"
          :show-ratings="activeTab === 'completed'"
        />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-if="!sessionStore.loading && allMySessions.length === 0">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">mdi-calendar-blank</v-icon>
        <h3 class="text-medium-emphasis mt-4">No sessions found</h3>
        <p class="text-medium-emphasis mb-4">
          Create your first session to start tutoring students.
        </p>
        <v-btn color="primary" @click="$router.push('/sessions/create')">
          <v-icon left>mdi-plus</v-icon>
          Create Your First Session
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useSessionStore } from '../stores/sessions'
import { useAuthStore } from '../stores/auth'
import TutorSessionsList from '../components/TutorSessionsList.vue'

export default {
  name: 'TutorSessionsView',
  components: {
    TutorSessionsList
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
      activeTab: 'available'
    }
  },

  computed: {
    allMySessions() {
      if (!this.authStore.user) return []
      return this.sessionStore.sessions.filter(session => 
        session.tutor._id === this.authStore.user._id
      )
    },
    availableSessions() {
      return this.allMySessions.filter(session => session.status === 'available')
    },
    bookedSessions() {
      return this.allMySessions.filter(session => session.status === 'booked')
    },
    completedSessions() {
      return this.allMySessions.filter(session => session.status === 'completed')
    },
    filteredSessions() {
      if (this.activeTab === 'available') return this.availableSessions
      if (this.activeTab === 'booked') return this.bookedSessions
      if (this.activeTab === 'completed') return this.completedSessions
      return this.allMySessions
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

    editSession(sessionId) {
      // For now, redirect to create session with session data for editing
      this.$router.push({ 
        path: '/sessions/create', 
        query: { edit: sessionId } 
      })
    },

    async deleteSession(sessionId) {
      if (confirm('Are you sure you want to delete this session?')) {
        const result = await this.sessionStore.deleteSession(sessionId)
        if (result.success) {
          console.log('Session deleted successfully')
        } else {
          console.error('Failed to delete session:', result.error)
        }
      }
    },

    async completeSession(sessionId) {
      const result = await this.sessionStore.updateSession(sessionId, { status: 'completed' })
      if (result.success) {
        console.log('Session marked as completed')
      } else {
        console.error('Failed to update session:', result.error)
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

    duplicateSession(session) {
      // Navigate to create session with pre-filled data
      this.$router.push({
        path: '/sessions/create',
        query: {
          duplicate: session._id,
          title: session.title,
          subject: session.subject,
          description: session.description,
          duration: session.duration
        }
      })
    },

    contactStudent(session) {
      if (session.student?.email) {
        window.location.href = `mailto:${session.student.email}?subject=Regarding your tutoring session - ${session.title}`
      }
    }
  },

  async mounted() {
    await this.loadMySessions()
  }
}
</script>

<style scoped>
.v-tabs {
  margin-bottom: 20px;
}
</style>
