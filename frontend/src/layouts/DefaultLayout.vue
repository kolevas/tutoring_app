<template>
  <div class="default-layout">
    <!-- Navigation Drawer / Rail -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :rail="isRail"
      :permanent="!isMobile"
      :temporary="isMobile"
      width="280"
      class="navigation-drawer"
    >
    <!-- User Profile Header -->
    <div class="nav-header" :class="{ 'rail-collapsed': isRail }">
      <div class="user-profile">
        <v-avatar size="48" class="user-avatar">
          <v-icon size="24" color="white">mdi-account</v-icon>
        </v-avatar>
        <div v-if="!isRail" class="user-info">
          <div class="user-name">{{ authStore.userName }}</div>
          <v-chip size="x-small" :color="roleColor" variant="elevated" class="user-role">
            {{ authStore.userRole }}
          </v-chip>
        </div>
      </div>
    </div>
    
    <v-divider class="nav-divider" />

    <!-- Navigation Menu -->
    <v-list density="comfortable" nav class="nav-menu">
      <v-list-item
        v-for="(item, index) in menuItems"
        :key="item.title"
        :to="item.to"
        router
        exact
        class="nav-item"
        active-class="nav-item--active"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <template #prepend>
          <v-icon size="20" class="nav-icon">{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title v-if="!isRail" class="nav-title">
          {{ item.title }}
        </v-list-item-title>
        <div class="nav-indicator" />
      </v-list-item>
    </v-list>

    <!-- Navigation Footer -->
    <div class="nav-footer">
      <v-divider class="nav-divider" />
      <div class="nav-actions">
        <v-btn
          variant="text"
          color="error"
          :block="!isRail"
          class="nav-btn logout-btn"
          @click="logout"
        >
          <v-icon :start="!isRail">mdi-logout</v-icon>
          <span v-if="!isRail">Logout</span>
        </v-btn>
        <v-btn
          variant="text"
          :block="!isMobile"
          class="nav-btn collapse-btn"
          @click="toggleRail"
        >
          <v-icon :start="!isRail">
            {{ isRail ? 'mdi-arrow-expand-right' : 'mdi-arrow-collapse-left' }}
          </v-icon>
          <span v-if="!isRail">{{ isRail ? 'Expand' : 'Collapse' }}</span>
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>

  <!-- Top App Bar -->
  <v-app-bar app flat class="app-header" height="72">
    <v-btn
      icon
      variant="text"
      class="mobile-menu-btn d-sm-none"
      @click="drawer = !drawer"
      aria-label="Menu"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    
    <v-toolbar-title class="app-brand">
      <div class="brand-content">
        <v-icon size="32" color="primary" class="brand-icon">mdi-school</v-icon>
        <span class="brand-text gradient-text">FINKI Tutor</span>
      </div>
    </v-toolbar-title>
    
    <v-spacer />
    
    <!-- Header Actions -->
    <div class="header-actions">
      <v-btn
        icon
        variant="text"
        class="header-btn"
        aria-label="Toggle Theme"
        @click="toggleTheme"
      >
        <v-icon>{{ darkMode ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      
      <!-- Notification Bell -->
      <NotificationComponent />
      
      <v-btn
        icon
        variant="text"
        class="header-btn"
        aria-label="Profile"
        :to="'/profile'"
      >
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </div>
  </v-app-bar>

  <!-- Main Content Area -->
  <v-main class="main-content">
    <div class="content-wrapper" :class="{ 'content-entered': animateIn }">
      <router-view />
    </div>
  </v-main>

  <!-- Bottom Navigation (Mobile) -->
  <v-bottom-navigation
    v-if="isMobile"
    grow
    class="bottom-navigation"
    height="64"
    mode="shift"
    bg-color="surface"
  >
    <v-btn
      v-for="item in bottomNav"
      :key="item.label"
      :to="item.to"
      :value="item.to"
      class="bottom-nav-btn"
    >
      <v-icon size="22">{{ item.icon }}</v-icon>
      <span class="bottom-nav-label">{{ item.label }}</span>
    </v-btn>
  </v-bottom-navigation>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useTheme } from 'vuetify'
import NotificationComponent from '../components/NotificationComponent.vue'

export default {
  name: 'DefaultLayout',
  components: { NotificationComponent },
  setup() {
    return {
      authStore: useAuthStore(),
      theme: useTheme()
    }
  },
  data() {
    return {
      drawer: true,
      rail: false,
      animateIn: false,
      darkMode: false
    }
  },
  computed: {
    isMobile() {
      return window.innerWidth < 960
    },
    isRail() {
      return this.rail && !this.isMobile
    },
    roleColor() {
      switch(this.authStore.userRole) {
        case 'student': return 'primary'
        case 'tutor': return 'success'
        case 'admin': return 'secondary'
        default: return 'grey'
      }
    },
    menuItems() {
      const items = [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' }
      ]
      
      if (this.authStore.isStudent) {
        items.push(
          { title: 'Browse Sessions', icon: 'mdi-calendar-search', to: '/sessions' },
          { title: 'My Bookings', icon: 'mdi-calendar-check', to: '/my-sessions' },
          { title: 'Profile', icon: 'mdi-account-circle', to: '/profile' }
        )
      }
      
      if (this.authStore.isTutor) {
        items.push(
          { title: 'My Sessions', icon: 'mdi-calendar', to: '/tutor-sessions' },
          { title: 'Create Session', icon: 'mdi-calendar-plus', to: '/sessions/create' },
          { title: 'Availability', icon: 'mdi-calendar-clock', to: '/availability' },
          { title: 'Students', icon: 'mdi-account-group', to: '/students' }
        )
      }
      
      if (this.authStore.isAdmin) {
        items.push(
          { title: 'Manage Users', icon: 'mdi-account-multiple', to: '/admin/users' },
          { title: 'All Sessions', icon: 'mdi-calendar-multiple', to: '/admin/sessions' }
        )
      }
      
      return items
    },
    bottomNav() {
      const base = [
        { label: 'Home', icon: 'mdi-view-dashboard', to: '/dashboard' }
      ]
      
      if (this.authStore.isStudent) {
        base.push(
          { label: 'Sessions', icon: 'mdi-calendar-search', to: '/sessions' },
          { label: 'My Sessions', icon: 'mdi-calendar-check', to: '/my-sessions' }
        )
      }
      
      if (this.authStore.isTutor) {
        base.push(
          { label: 'My Sessions', icon: 'mdi-calendar', to: '/tutor-sessions' },
          { label: 'Create', icon: 'mdi-calendar-plus', to: '/sessions/create' }
        )
      }
      
      base.push({ label: 'Profile', icon: 'mdi-account-circle', to: '/profile' })
      return base
    }
  },
  methods: {
    async logout() {
      try {
        await this.authStore.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    },
    toggleRail() {
      this.rail = !this.rail
    },
    handleResize() {
      if (this.isMobile) {
        this.drawer = false
        this.rail = false
      }
    },
    toggleTheme() {
      this.darkMode = !this.darkMode
      this.theme.global.name.value = this.darkMode ? 'dark' : 'light'
      localStorage.setItem('theme-preference', this.theme.global.name.value)
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme-preference')
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark'
      this.theme.global.name.value = savedTheme
    }
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
      this.animateIn = true
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style scoped>
/* Layout wrapper */
.default-layout {
  min-height: 100vh;
  position: relative;
}

/* Navigation Drawer */
.navigation-drawer {
  background: var(--color-surface-glass) !important;
  backdrop-filter: blur(20px) !important;
  border-right: 1px solid var(--color-border) !important;
}

.nav-header {
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid var(--color-border-light);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar {
  background: var(--color-gradient) !important;
  box-shadow: var(--shadow-md);
  border: 2px solid rgba(255,255,255,0.2);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: var(--font-weight-semibold);
  font-size: 0.95rem;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-weight: var(--font-weight-medium) !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-divider {
  margin: 0 var(--space-4);
  opacity: 0.6;
}

.nav-menu {
  padding: var(--space-4) var(--space-3);
  flex: 1;
}

.nav-item {
  position: relative;
  border-radius: var(--radius-lg) !important;
  margin-bottom: var(--space-2) !important;
  transition: all var(--transition-fast) !important;
  animation: fadeInLeft 0.4s var(--transition-normal) both;
}

.nav-item:hover {
  background: var(--color-gradient-soft) !important;
  transform: translateX(4px);
}

.nav-item--active {
  background: var(--color-gradient-soft) !important;
  color: var(--color-primary) !important;
  font-weight: var(--font-weight-medium) !important;
}

.nav-item--active .nav-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.nav-indicator {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%) scaleY(0.3);
  width: 4px;
  height: 24px;
  background: var(--color-gradient);
  border-radius: var(--radius-full);
  opacity: 0;
  transition: all var(--transition-normal);
}

.nav-icon {
  color: inherit;
  margin-right: var(--space-3);
}

.nav-title {
  font-weight: var(--font-weight-medium);
  font-size: 0.9rem;
}

.nav-footer {
  margin-top: auto;
  padding: var(--space-4);
}

.nav-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-btn {
  justify-content: flex-start !important;
  font-weight: var(--font-weight-medium) !important;
  border-radius: var(--radius-md) !important;
  transition: all var(--transition-fast) !important;
}

.nav-btn:hover {
  background: rgba(0,0,0,0.04) !important;
}

.logout-btn {
  color: var(--color-error) !important;
}

/* App Header */
.app-header {
  background: var(--color-surface-glass) !important;
  backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid var(--color-border-light) !important;
  box-shadow: var(--shadow-sm) !important;
}

.mobile-menu-btn {
  color: var(--color-text-primary) !important;
  margin-right: var(--space-2);
}

.app-brand {
  font-weight: var(--font-weight-bold) !important;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brand-icon {
  filter: drop-shadow(0 2px 4px rgba(52,134,235,0.3));
}

.brand-text {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-btn {
  color: var(--color-text-secondary) !important;
  transition: all var(--transition-fast) !important;
}

.header-btn:hover {
  color: var(--color-primary) !important;
  background: var(--color-gradient-soft) !important;
}

/* Main Content */
.main-content {
  background: transparent !important;
  padding-top: 72px;
  padding-bottom: 0;
}

.content-wrapper {
  opacity: 0;
  transform: translateY(12px);
  transition: all var(--transition-normal);
  min-height: calc(100vh - 72px);
}

.content-wrapper.content-entered {
  opacity: 1;
  transform: translateY(0);
}

/* Bottom Navigation */
.bottom-navigation {
  position: fixed !important;
  bottom: 0;
  left: 0;
  right: 0;
  backdrop-filter: blur(20px) !important;
  background: var(--color-surface-glass) !important;
  border-top: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-lg) !important;
  z-index: var(--z-fixed);
}

.bottom-nav-btn {
  flex-direction: column !important;
  font-weight: var(--font-weight-medium) !important;
  color: var(--color-text-secondary) !important;
  transition: all var(--transition-fast) !important;
}

.bottom-nav-btn:hover,
.bottom-nav-btn.v-btn--active {
  color: var(--color-primary) !important;
  background: var(--color-gradient-soft) !important;
}

.bottom-nav-label {
  font-size: 0.75rem;
  margin-top: var(--space-1);
}

/* Animations */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Rail mode adjustments */
.nav-header.rail-collapsed {
  padding: var(--space-5) var(--space-3);
}

.nav-header.rail-collapsed .user-profile {
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 960px) {
  .main-content {
    padding-bottom: 64px;
  }
  
  .content-wrapper {
    min-height: calc(100vh - 136px);
  }
}

@media (max-width: 600px) {
  .brand-text {
    font-size: 1.25rem;
  }
  
  .header-actions {
    gap: var(--space-1);
  }
}

/* Accessibility & Motion */
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .content-wrapper,
  .nav-btn,
  .header-btn {
    transition: none !important;
    animation: none !important;
  }
  
  .nav-item:hover {
    transform: none !important;
  }
}

/* Focus states */
.nav-item:focus-visible,
.nav-btn:focus-visible,
.header-btn:focus-visible {
  box-shadow: var(--focus-ring) !important;
}
</style>
