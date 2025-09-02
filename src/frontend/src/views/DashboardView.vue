<template>
  <div class="dashboard-page">
    <v-container fluid class="dashboard-container">
      <!-- Loading State -->
      <v-alert v-if="authInitializing" type="info" variant="tonal" class="mb-6 fade-in-up">
        <v-icon start>mdi-loading mdi-spin</v-icon>
        Loading your dashboard...
      </v-alert>
      
      <v-alert v-else-if="!authStore.userRole" type="warning" variant="tonal" class="mb-6 fade-in-up">
        <v-icon start>mdi-alert</v-icon>
        No role detected. Please log in again.
        <template v-slot:actions>
          <v-btn size="small" color="warning" variant="elevated" @click="$router.push('/login')">
            Login
          </v-btn>
        </template>
      </v-alert>

      <!-- Main Dashboard Content -->
      <div v-else class="dashboard-content">
        <!-- Debug Info (temporary) -->
        <v-card v-if="false" class="mb-4" color="info" variant="tonal">
          <v-card-text>
            <h4>Debug Info:</h4>
            <p>User Role: {{ authStore.userRole }}</p>
            <p>Is Admin: {{ authStore.isAdmin }}</p>
            <p>Is Student: {{ authStore.isStudent }}</p>
            <p>Is Tutor: {{ authStore.isTutor }}</p>
            <p>Quick Actions Length: {{ quickActions.length }}</p>
            <p>Quick Actions: {{ JSON.stringify(quickActions.map(a => a.title)) }}</p>
            <p>Session Stats: {{ JSON.stringify(sessionStats) }}</p>
            <p>User Stats: {{ JSON.stringify(userStats) }}</p>
          </v-card-text>
        </v-card>
        <!-- Welcome Hero Section -->
        <v-row class="mb-8">
          <v-col cols="12">
            <v-card class="welcome-hero surface-elevated" elevation="0">
              <div class="hero-background"></div>
              <v-card-text class="hero-content">
                <div class="hero-grid">
                  <div class="hero-text">
                    <div class="hero-greeting fade-in-up">
                      <h1 class="hero-title">
                        Welcome back, 
                        <span class="gradient-text">{{ authStore.userName }}</span>
                        <span class="wave">👋</span>
                      </h1>
                      <div class="hero-meta">
                        <v-chip 
                          size="small" 
                          :color="roleColor" 
                          variant="elevated" 
                          class="role-chip"
                        >
                          <v-icon start size="16">{{ roleIcon }}</v-icon>
                          {{ authStore.userRole }}
                        </v-chip>
                        <span class="role-description">{{ roleDescription }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="hero-visual fade-in-up">
                    <div class="hero-icon-container">
                      <v-icon size="80" class="hero-icon">{{ roleIcon }}</v-icon>
                      <div class="hero-icon-glow"></div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick Actions -->
        <v-row class="mb-8">
          <v-col cols="12">
            <h2 class="section-title mb-4">Quick Actions</h2>
            <v-row dense class="stagger">
              <v-col 
                v-for="(action, index) in quickActions" 
                :key="action.title" 
                cols="12" 
                sm="6" 
                lg="3"
              >
                <ActionCard 
                  :icon="action.icon" 
                  :title="action.title" 
                  :description="action.description"
                  :animation="'fade-up'"
                  :animation-delay="index * 100"
                  @click="$router.push(action.route)"
                  class="hover-lift"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Statistics for Admin -->
        <template v-if="authStore.isAdmin">
          <v-row class="mb-8">
            <v-col cols="12">
              <h2 class="section-title mb-4">Platform Overview</h2>
              <v-row dense class="stagger">
                <v-col cols="12" sm="6" md="3">
                  <StatCard 
                    icon="mdi-calendar-multiple" 
                    label="Total Sessions" 
                    :value="sessionStats.total" 
                    variant="primary"
                    :trend="sessionStats.totalTrend"
                    :animation="'fade-up'"
                    :animation-delay="0"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <StatCard 
                    icon="mdi-calendar-check" 
                    label="Active Bookings" 
                    :value="sessionStats.booked" 
                    variant="success"
                    :trend="sessionStats.bookedTrend"
                    :animation="'fade-up'"
                    :animation-delay="100"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <StatCard 
                    icon="mdi-account-group" 
                    label="Active Tutors" 
                    :value="userStats.tutors" 
                    variant="info"
                    :trend="userStats.tutorsTrend"
                    :animation="'fade-up'"
                    :animation-delay="200"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <StatCard 
                    icon="mdi-account-school" 
                    label="Active Students" 
                    :value="userStats.students" 
                    variant="secondary"
                    :trend="userStats.studentsTrend"
                    :animation="'fade-up'"
                    :animation-delay="300"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </template>

        <!-- Recent Sessions for Students -->
        <template v-if="authStore.isStudent && myBookings.length">
          <v-row class="mb-8">
            <v-col cols="12">
              <div class="section-header mb-4">
                <h2 class="section-title">Your Upcoming Sessions</h2>
                <v-btn variant="text" color="primary" :to="'/my-sessions'">
                  View All
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
              </div>
              <v-row dense>
                <v-col 
                  v-for="(session, index) in myBookings.slice(0, 3)" 
                  :key="session._id" 
                  cols="12" 
                  md="4"
                >
                  <SessionCard 
                    :session="session" 
                    :user-role="authStore.userRole"
                    :animation="'fade-up'"
                    :animation-delay="index * 100"
                    class="hover-lift" 
                    @select="handleSessionSelect"
                    @book="handleSessionBook"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </template>

        <!-- Tutor Sessions Overview -->
        <template v-if="authStore.isTutor && mySessions.length">
          <v-row class="mb-8">
            <v-col cols="12">
              <div class="section-header mb-4">
                <h2 class="section-title">Your Recent Sessions</h2>
                <v-btn variant="text" color="primary" :to="'/tutor-sessions'">
                  Manage All
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
              </div>
              <v-row dense>
                <v-col 
                  v-for="(session, index) in mySessions.slice(0, 3)" 
                  :key="session._id" 
                  cols="12" 
                  md="4"
                >
                  <SessionCard 
                    :session="session" 
                    :user-role="authStore.userRole"
                    :animation="'fade-up'"
                    :animation-delay="index * 100"
                    class="hover-lift" 
                    @select="handleSessionSelect"
                    @edit="handleSessionEdit"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </template>

        <!-- Empty State for New Users -->
        <template v-if="!authStore.isAdmin && (!mySessions?.length && !myBookings?.length)">
          <v-row class="mt-12">
            <v-col cols="12">
              <v-card class="empty-state-card surface-elevated text-center" elevation="0">
                <v-card-text class="pa-12">
                  <div class="empty-state-content fade-in-up">
                    <div class="empty-state-icon mb-6">
                      <v-icon size="120" color="primary" class="mb-4">
                        {{ authStore.isStudent ? 'mdi-calendar-search' : 'mdi-calendar-plus' }}
                      </v-icon>
                    </div>
                    <h2 class="empty-state-title mb-4">
                      {{ authStore.isStudent ? 'Ready to Start Learning?' : 'Ready to Start Teaching?' }}
                    </h2>
                    <p class="empty-state-description mb-8">
                      {{ authStore.isStudent 
                        ? 'Browse available tutoring sessions and book with experienced tutors to accelerate your learning journey.' 
                        : 'Create your first session and start helping students achieve their academic goals.' }}
                    </p>
                    <v-btn 
                      color="primary" 
                      size="x-large" 
                      variant="elevated"
                      :to="authStore.isStudent ? '/sessions' : '/sessions/create'"
                      class="cta-button"
                    >
                      <v-icon start size="20">{{ authStore.isStudent ? 'mdi-magnify' : 'mdi-plus' }}</v-icon>
                      {{ authStore.isStudent ? 'Explore Sessions' : 'Create First Session' }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </div>
    </v-container>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useSessionStore } from '../stores/sessions'
import { useUserStore } from '../stores/users'
import StatCard from '../components/StatCard.vue'
import ActionCard from '../components/ActionCard.vue'
import SessionCard from '../components/SessionCard.vue'

export default {
  name: 'DashboardView',
  components: { StatCard, ActionCard, SessionCard },
  setup() {
    return {
      authStore: useAuthStore(),
      sessionStore: useSessionStore(),
      userStore: useUserStore()
    }
  },
  data() {
    return {
      myBookings: [],
      mySessions: [],
      authInitializing: true,
      loading: false
    }
  },
  computed: {
    roleColor() {
      switch(this.authStore.userRole) {
        case 'student': return 'primary'
        case 'tutor': return 'success'
        case 'admin': return 'secondary'
        default: return 'grey'
      }
    },
    roleIcon() {
      switch(this.authStore.userRole) {
        case 'student': return 'mdi-account-school'
        case 'tutor': return 'mdi-account-tie'
        case 'admin': return 'mdi-shield-account'
        default: return 'mdi-account'
      }
    },
    roleDescription() {
      switch(this.authStore.userRole) {
        case 'student': return 'Explore available tutoring sessions and book with your favorite tutors'
        case 'tutor': return 'Manage your tutoring sessions and help students learn'
        case 'admin': return 'Oversee the platform and manage users and sessions'
        default: return 'Welcome to FINKI Tutor Site'
      }
    },
    quickActions() {
      const actions = []
      
      if (this.authStore.isStudent) {
        actions.push(
          { title: 'Browse Sessions', description: 'Find available tutoring sessions', icon: 'mdi-calendar-search', route: '/sessions' },
          { title: 'My Bookings', description: 'View your booked sessions', icon: 'mdi-calendar-check', route: '/my-sessions' },
          { title: 'Profile Settings', description: 'Update your profile', icon: 'mdi-account-cog', route: '/profile' }
        )
      }
      if (this.authStore.isTutor) {
        actions.push(
          { title: 'Create Session', description: 'Add new tutoring session', icon: 'mdi-calendar-plus', route: '/sessions/create' },
          { title: 'My Sessions', description: 'Manage your sessions', icon: 'mdi-calendar', route: '/tutor-sessions' },
          { title: 'Set Availability', description: 'Configure your schedule', icon: 'mdi-calendar-clock', route: '/availability' },
          { title: 'My Students', description: 'View your students', icon: 'mdi-account-group', route: '/students' }
        )
      }
      if (this.authStore.isAdmin) {
        actions.push(
          { title: 'User Management', description: 'Manage platform users', icon: 'mdi-account-multiple', route: '/admin/users' },
          { title: 'Session Overview', description: 'Monitor all sessions', icon: 'mdi-calendar-multiple', route: '/admin/sessions' }
        )
      }
      
      return actions
    },
    sessionStats() {
      const sessions = this.sessionStore.sessions || []
      const total = sessions.length
      const booked = sessions.filter(s => s.status === 'booked').length
      const available = sessions.filter(s => s.status === 'available').length
      const completed = sessions.filter(s => s.status === 'completed').length

      // Calculate trends (mock data for now - in real app, you'd compare with previous period)
      const totalTrend = total > 0 ? { type: 'up', value: '+12%' } : null
      const bookedTrend = booked > 0 ? { type: 'up', value: `+${Math.round((booked/total) * 100)}%` } : null

      return {
        total,
        booked,
        available,
        completed,
        totalTrend,
        bookedTrend
      }
    },
    userStats() {
      const users = this.userStore.users || []
      const total = users.length
      const tutors = users.filter(u => u.role === 'tutor').length
      const students = users.filter(u => u.role === 'student').length
      const activeTutors = users.filter(u => u.role === 'tutor' && u.isActive !== false).length
      const activeStudents = users.filter(u => u.role === 'student' && u.isActive !== false).length

      // Calculate trends based on percentages
      const tutorsTrend = tutors > 0 ? { 
        type: 'up', 
        value: `+${Math.round((activeTutors/total) * 100)}%` 
      } : null
      
      const studentsTrend = students > 0 ? { 
        type: 'up', 
        value: `+${Math.round((activeStudents/total) * 100)}%` 
      } : null

      return {
        tutors: activeTutors,
        students: activeStudents,
        total,
        tutorsTrend,
        studentsTrend
      }
    }
  },
  watch: {
    'authStore.userRole': {
      immediate: true,
      async handler(role) {
        if (role) {
          this.authInitializing = false
          await this.loadDashboardData()
        }
      }
    }
  },
  methods: {
    async loadDashboardData() {
      if (!this.authStore.userRole) return
      
      try {
        this.loading = true
        
        if (this.authStore.isStudent) {
          await this.sessionStore.fetchSessions({ student: this.authStore.user._id })
          this.myBookings = this.sessionStore.sessions.filter(s => s.status === 'booked').slice(0, 5)
        }
        
        if (this.authStore.isTutor) {
          await this.sessionStore.fetchSessions({ tutor: this.authStore.user._id })
          this.mySessions = this.sessionStore.sessions.slice(0, 5)
        }
        
        if (this.authStore.isAdmin) {
          await Promise.all([
            this.userStore.fetchUsers(),
            this.sessionStore.fetchSessions()
          ])
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        this.loading = false
      }
    },
    
    handleSessionSelect(session) {
      // Navigate to session details or appropriate view
      if (this.authStore.isStudent) {
        this.$router.push('/my-sessions')
      } else if (this.authStore.isTutor) {
        this.$router.push('/tutor-sessions')
      }
    },
    
    async handleSessionBook(session) {
      try {
        await this.sessionStore.bookSession(session._id)
        await this.loadDashboardData() // Refresh data
      } catch (error) {
        console.error('Error booking session:', error)
      }
    },
    
    handleSessionEdit(session) {
      this.$router.push(`/sessions/edit/${session._id}`)
    }
  },
  async mounted() {
    // Initialize auth if needed
    if (!this.authStore.user && !this.authStore.userRole) {
      this.authStore.initializeAuth()
    }
    
    if (!this.authStore.userRole) {
      setTimeout(() => {
        if (!this.authStore.userRole) {
          this.authInitializing = false
        }
      }, 800)
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
}

.dashboard-container {
  padding: 24px 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-content {
  position: relative;
}

/* Welcome Hero Section */
.welcome-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px !important;
  background: linear-gradient(135deg, #2c1a87 0%, #3486eb 70%, #5ba3ff 100%) !important;
  color: white;
  border: none !important;
}

.hero-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 85% 20%, rgba(255,255,255,0.2), transparent 60%),
    radial-gradient(circle at 15% 80%, rgba(255,255,255,0.1), transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 48px 32px !important;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  align-items: center;
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.wave {
  animation: wave 2s ease-in-out infinite;
  display: inline-block;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.role-chip {
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-description {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.hero-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  background: rgba(255,255,255,0.15);
  border-radius: 32px;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255,255,255,0.2);
}

.hero-icon {
  position: relative;
  z-index: 2;
  color: white;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.hero-icon-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Section Headers */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Empty State */
.empty-state-card {
  border-radius: 24px !important;
  background: linear-gradient(135deg, #ffffff, #f2f7fc) !important;
  border: 2px dashed rgba(52,134,235,0.12) !important;
}

.empty-state-content {
  max-width: 600px;
  margin: 0 auto;
}

.empty-state-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.empty-state-description {
  font-size: 1.125rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.cta-button {
  border-radius: 12px !important;
  font-weight: 600 !important;
  padding: 16px 32px !important;
  font-size: 1.125rem !important;
  box-shadow: 0 8px 40px -4px rgba(44,26,135,0.28) !important;
}

.cta-button:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
  }
  
  .hero-content {
    padding: 40px 24px !important;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 16px 12px;
  }
  
  .hero-content {
    padding: 32px 20px !important;
  }
  
  .hero-icon-container {
    width: 120px;
    height: 120px;
  }
  
  .hero-icon {
    font-size: 60px !important;
  }
  
  .empty-state-card .v-card-text {
    padding: 32px 16px !important;
  }
  
  .empty-state-title {
    font-size: 1.5rem;
  }
  
  .empty-state-description {
    font-size: 1rem;
  }
}

/* Animation utilities */
.stagger > * {
  animation: fadeInUp 0.6s ease-out forwards;
}

.stagger > *:nth-child(1) { animation-delay: 0.1s; }
.stagger > *:nth-child(2) { animation-delay: 0.2s; }
.stagger > *:nth-child(3) { animation-delay: 0.3s; }
.stagger > *:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Disable animations on reduced motion */
@media (prefers-reduced-motion: reduce) {
  .wave,
  .hero-icon-glow,
  .stagger > * {
    animation: none !important;
  }
  
  .cta-button:hover {
    transform: none !important;
  }
}
</style>