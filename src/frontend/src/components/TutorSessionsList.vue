<template>
  <div>
    <v-row v-if="sessions.length === 0" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-icon size="48" color="grey">mdi-calendar-remove</v-icon>
        <p class="grey--text mt-2">No {{ status }} sessions found</p>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col 
        v-for="session in sessions" 
        :key="session._id"
        cols="12" 
        md="6" 
        lg="4"
      >
        
        <v-card class="session-card" elevation="2">
          <v-card-title class="pb-2">
            <!-- Course Name -->
            <div class="w-100 mb-3">
              <h3 class="session-title text-truncate" :title="session.subject || session.title || 'Session'">
                {{ session.subject || session.title || 'Session' }}
              </h3>
            </div>
            
            <!-- Status and Actions Row -->
            <div class="d-flex justify-space-between align-center w-100">
              <v-chip 
                :color="getStatusColor(session.status)" 
                small 
                text-color="white"
                class="text-capitalize"
              >
                {{ session.status }}
              </v-chip>
              
              <div class="d-flex gap-1">
                <v-btn 
                  v-if="canEditSession(session)" 
                  small 
                  color="primary" 
                  variant="outlined"
                  @click="$emit('edit-session', session._id)"
                  size="small"
                >
                  <v-icon size="16">mdi-pencil</v-icon>
                </v-btn>
                <v-btn 
                  v-if="canDeleteSession(session)" 
                  small 
                  color="error" 
                  variant="outlined"
                  @click="$emit('delete-session', session._id)"
                  size="small"
                >
                  <v-icon size="16">mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card-title>
          
          <v-card-text class="pt-0">
            <div class="mb-2">
              <v-icon small class="mr-2" color="primary">mdi-calendar</v-icon>
              <span class="text-body-2">{{ formatDate(session.date) }}</span>
            </div>
            
            <div class="mb-2">
              <v-icon small class="mr-2" color="primary">mdi-clock</v-icon>
              <span class="text-body-2">{{ session.startTime }} - {{ session.endTime }}</span>
            </div>
            
            <div class="mb-2">
              <v-icon small class="mr-2" color="primary">mdi-timelapse</v-icon>
              <span class="text-body-2">{{ session.duration }} minutes</span>
            </div>
            
            <div v-if="session.student" class="mb-2">
              <v-icon small class="mr-2" color="success">mdi-account-school</v-icon>
              <span class="text-body-2">{{ session.student.name }}</span>
            </div>
            <div v-else class="mb-2">
              <v-icon small class="mr-2" color="orange">mdi-account-question</v-icon>
              <span class="text-body-2 text--secondary">No student booked</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'TutorSessionsList',
  props: {
    sessions: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: 'all'
    },
    showRatings: {
      type: Boolean,
      default: false
    },
    showQuickActions: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    canEdit() {
      // Allow editing for available and booked sessions
      return ['available', 'booked', 'all'].includes(this.status)
    },
    
    canDelete() {
      // Allow deleting for available sessions only (not booked)
      return ['available', 'all'].includes(this.status)
    }
  },

  mounted() {
    // Component successfully mounted
  },

  methods: {
    canEditSession(session) {
      const now = new Date()
      const sessionDate = new Date(session.date)
      return sessionDate >= now && ['available', 'booked'].includes(session.status)
    },
    
    canDeleteSession(session) {
      return session.status === 'available'
    },
    
    viewSessionDetails(session) {
      console.log('Viewing session details:', session)
      // For now, just log the session details
      alert(`Session: ${session.title}\nStatus: ${session.status}\nDate: ${new Date(session.date).toLocaleDateString()}`)
    },
    
    canComplete() {
      return ['booked', 'all'].includes(this.status)
    },
    
    canCancel() {
      return ['booked', 'all'].includes(this.status)
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    getStatusColor(status) {
      const colors = {
        available: 'success',
        booked: 'primary',
        passed: 'grey'
      }
      return colors[status] || 'grey'
    },

    isPastSession(session) {
      const sessionDate = new Date(`${session.date}T${session.endTime}`)
      return sessionDate <= new Date()
    }
  }
}
</script>

<style scoped>
.session-card {
  height: 100%;
  transition: box-shadow 0.3s, transform 0.2s;
  background-color: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 10px 0 0 0;
  display: flex;
  flex-direction: column;
}

.session-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 12px 24px rgba(0,0,0,0.13);
}

.v-chip {
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.v-card-title {
  line-height: 1.2 !important;
  padding-bottom: 0.5rem !important;
  font-weight: 600;
}

.session-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-title:hover {
  color: #1976d2;
  cursor: default;
}

.v-btn.v-btn--size-small {
  min-width: 32px;
  padding: 0 8px;
}

.gap-1 {
  gap: 4px;
}

.v-card-text {
  padding-bottom: 0.5rem !important;
  padding-top: 0.5rem !important;
}

.v-card-text .mb-2 {
  min-height: 24px;
  margin-bottom: 2px;
}

.text-body-2 {
  color: #607d8b;
}

.text-decoration-none {
  text-decoration: none;
  color: #1976d2;
}

.v-icon {
  vertical-align: middle;
}

@media (max-width: 600px) {
  .session-card {
    min-height: 220px;
    padding: 8px 0 0 0;
  }
  .v-card-title, .v-card-text {
    font-size: 1rem;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}
</style>
