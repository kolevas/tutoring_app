<template>
  <div>
    <v-row v-if="sessions.length === 0" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-icon size="48" color="grey">mdi-calendar-remove</v-icon>
        <p class="grey--text mt-2">No sessions found</p>
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
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <div>
                <h3>{{ session.title || session.subject }}</h3>
                <v-chip 
                  :color="getStatusColor(session.status)" 
                  small 
                  text-color="white"
                >
                  {{ session.status }}
                </v-chip>
              </div>
              <v-menu offset-y v-if="canModifySession(session)">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item v-if="canEditSession(session)" @click="$emit('edit-session', session._id)">
                    <v-list-item-icon>
                      <v-icon>mdi-pencil</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Edit Session</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="canDeleteSession(session)" @click="$emit('delete-session', session._id)">
                    <v-list-item-icon>
                      <v-icon>mdi-delete</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Delete Session</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="canCancelSession(session)" @click="$emit('cancel-session', session._id)">
                    <v-list-item-icon>
                      <v-icon>mdi-cancel</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Cancel Session</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="canCompleteSession(session)" @click="$emit('complete-session', session._id)">
                    <v-list-item-icon>
                      <v-icon>mdi-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Mark Complete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-title>
          
          <v-card-text>
            <div class="mb-2">
              <v-icon small class="mr-1">mdi-account</v-icon>
              <template v-if="userRole === 'student'">
                Tutor: {{ session.tutor?.name || 'Unknown Tutor' }}
              </template>
              <template v-else-if="userRole === 'tutor'">
                Student: {{ session.student?.name || 'No student yet' }}
              </template>
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
            
            <div v-if="session.meetingLink" class="mb-2">
              <v-icon small class="mr-1">mdi-video</v-icon>
              <a :href="session.meetingLink" target="_blank" class="text-decoration-none">
                Join Meeting
              </a>
            </div>
            
            <p v-if="session.description" class="text-body-2 mt-2">
              {{ session.description }}
            </p>
            
            <p v-if="session.notes" class="text-body-2 mt-2 font-italic">
              Notes: {{ session.notes }}
            </p>
          </v-card-text>
          
          <v-card-actions v-if="showRatings && session.status === 'passed'">
            <v-spacer></v-spacer>
            <v-btn color="primary" small>
              <v-icon left>mdi-star</v-icon>
              Rate Session
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'SessionsList',
  props: {
    sessions: {
      type: Array,
      default: () => []
    },
    userRole: {
      type: String,
      default: 'student'
    },
    currentUserId: {
      type: String,
      required: false
    },
    showRatings: {
      type: Boolean,
      default: false
    }
  },

  mounted() {
    console.log('SessionsList mounted with:', {
      sessionsCount: this.sessions?.length || 0,
      currentUserId: this.currentUserId,
      userRole: this.userRole,
      sessions: this.sessions
    })
  },

  methods: {
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

    canModifySession(session) {
      const tutorId = session.tutor?._id || session.tutor
      const isOwner = tutorId === this.currentUserId
      
      // Simple debug for the first session only
      if (session === this.sessions[0]) {
        console.log('First session check:', { tutorId, currentUserId: this.currentUserId, isOwner, userRole: this.userRole })
      }
      
      // Only show menu for sessions owned by current user (tutors) or for admins
      return (this.userRole === 'tutor' && isOwner) || this.userRole === 'admin'
    },

    canEditSession(session) {
      // Only tutors can edit their own sessions that are available or booked and in the future
      const now = new Date()
      const sessionDate = new Date(session.date)
      const tutorId = session.tutor?._id || session.tutor
      const isOwner = tutorId === this.currentUserId
      return this.userRole === 'tutor' && isOwner && sessionDate >= now && ['available', 'booked'].includes(session.status)
    },

    canDeleteSession(session) {
      // Only tutors can delete their own sessions that are available (not booked), or admins can delete any
      const tutorId = session.tutor?._id || session.tutor
      const isOwner = tutorId === this.currentUserId
      if (this.userRole === 'admin') return true
      return this.userRole === 'tutor' && isOwner && session.status === 'available'
    },

    canCancelSession(session) {
      return ['available', 'booked'].includes(session.status)
    },

    canCompleteSession(session) {
      const now = new Date()
      const sessionDate = new Date(session.date)
      return session.status === 'booked' && sessionDate <= now && this.userRole === 'tutor'
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
