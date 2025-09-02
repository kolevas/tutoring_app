<template>
  <div class="default-layout">
    <!-- Navigation Drawer / Rail -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :rail="isRail"
      :permanent="!isMobile"
      :temporary="isMobile"
      :width="isRail ? 80 : 280"
      rail-width="80"
      class="navigation-drawer"
    >
    <!-- User Profile Header -->
    <div class="nav-header" :class="{ 'rail-collapsed': isRail }">
      <div class="user-profile">
        <v-avatar size="48" class="user-avatar">
          <v-icon size="28" color="white" style="text-shadow: 0 1px 2px rgba(0,0,0,0.2);">mdi-account-circle</v-icon>
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
    <v-list density="comfortable" nav class="nav-menu" :class="{ 'nav-menu--rail': isRail }">
      <v-tooltip
        v-for="(item, index) in menuItems"
        :key="item.title"
        :text="item.title"
        location="end"
        :disabled="!isRail"
        open-delay="200"
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="isRail ? props : {}"
            :to="item.to"
            router
            exact
            class="nav-item"
            :class="{ 'nav-item--rail': isRail }"
            active-class="nav-item--active"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <template #prepend>
              <v-icon size="20" class="nav-icon" :class="{ 'nav-icon--rail': isRail }">{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title v-if="!isRail" class="nav-title">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-tooltip>
    </v-list>

    <!-- Navigation Footer -->
    <div class="nav-footer" :class="{ 'nav-footer--rail': isRail }">
      <v-divider class="nav-divider" />
      <div class="nav-actions" :class="{ 'nav-actions--rail': isRail }">
        <v-tooltip
          text="Logout"
          location="end"
          :disabled="!isRail"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="isRail ? props : {}"
              variant="text"
              color="error"
              :block="!isRail"
              :icon="isRail"
              class="nav-btn logout-btn"
              :class="{ 'nav-btn--rail': isRail }"
              @click="logout"
            >
              <v-icon :start="!isRail">mdi-logout</v-icon>
              <span v-if="!isRail">Logout</span>
            </v-btn>
          </template>
        </v-tooltip>
        
        <v-tooltip
          :text="isRail ? 'Expand' : 'Collapse'"
          location="end"
          :disabled="!isRail"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="isRail ? props : {}"
              variant="text"
              :block="!isMobile && !isRail"
              :icon="isRail"
              class="nav-btn collapse-btn"
              :class="{ 'nav-btn--rail': isRail }"
              @click="toggleRail"
            >
              <v-icon :start="!isRail">
                {{ isRail ? 'mdi-arrow-expand-right' : 'mdi-arrow-collapse-left' }}
              </v-icon>
              <span v-if="!isRail">{{ isRail ? 'Expand' : 'Collapse' }}</span>
            </v-btn>
          </template>
        </v-tooltip>
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
      animateIn: false
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
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    
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
/* Layout wrapper - simplified styling */
.default-layout {
  min-height: 100vh;
  position: relative;
}

/* Navigation Drawer */
.navigation-drawer {
  backdrop-filter: blur(20px) !important;
}

/* Rail mode specific styling */
.navigation-drawer.v-navigation-drawer--rail {
  overflow-x: hidden !important;
}

.navigation-drawer.v-navigation-drawer--rail .v-navigation-drawer__content {
  width: 80px !important;
  padding: 0 !important;
}

.nav-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #3486eb 0%, #2563eb 100%) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255,255,255,0.2);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-weight: 500 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-divider {
  margin: 0 16px;
  opacity: 0.6;
}

.nav-menu {
  padding: 16px 12px;
  flex: 1;
}

.nav-menu--rail {
  padding: 16px 8px;
}

.nav-item {
  position: relative;
  border-radius: 12px !important;
  margin: 4px 0 !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  animation: slideInLeft 0.4s ease-out;
  animation-fill-mode: both;
}

.nav-item--rail {
  margin: 8px auto !important;
  width: 48px !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.nav-item--rail .v-list-item__prepend {
  width: 100% !important;
  text-align: center !important;
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.nav-icon {
  transition: all 0.3s ease !important;
}

.nav-icon--rail {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.nav-title {
  font-weight: 500;
  font-size: 0.9rem;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.nav-item:hover .nav-title {
  opacity: 1;
}

.nav-item--active {
  background: rgba(52, 134, 235, 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.nav-item--active .nav-icon {
  color: rgb(var(--v-theme-primary)) !important;
}

/* Nav Footer */
.nav-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.nav-footer--rail {
  padding: 16px 8px;
}

.nav-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-actions--rail {
  align-items: center;
}

.nav-btn {
  transition: all 0.3s ease !important;
  border-radius: 8px !important;
}

.nav-btn--rail {
  width: 48px !important;
  height: 48px !important;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.1) !important;
}

.collapse-btn:hover {
  background: rgba(52, 134, 235, 0.1) !important;
}

/* App Header */
.app-header {
  backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.mobile-menu-btn {
  margin-right: 8px;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  animation: pulse 2s infinite;
}

.brand-text {
  font-weight: 700;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3486eb 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-btn {
  transition: all 0.3s ease !important;
  border-radius: 8px !important;
}

.header-btn:hover {
  background: rgba(52, 134, 235, 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

/* Main Content */
.main-content {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.content-wrapper {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.content-entered {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Bottom Navigation */
.bottom-navigation {
  backdrop-filter: blur(20px) !important;
  border-top: 1px solid rgba(255,255,255,0.1) !important;
}

.bottom-nav-btn {
  transition: all 0.3s ease !important;
}

.bottom-nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 4px;
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Rail Mode Specific Fix */
.nav-header.rail-collapsed {
  padding: 16px 8px;
  text-align: center;
}

.nav-header.rail-collapsed .user-profile {
  justify-content: center;
}

.nav-header.rail-collapsed .user-info {
  display: none;
}

/* Mobile Responsive */
@media (max-width: 959px) {
  .nav-header {
    padding: 20px 16px;
  }
  
  .nav-menu {
    padding: 16px;
  }
  
  .brand-text {
    font-size: 1.25rem;
  }
  
  .header-actions {
    gap: 2px;
  }
}

/* Dark mode specific adjustments */
.v-theme--dark .nav-header {
  border-bottom-color: rgba(51, 65, 85, 0.8);
}

.v-theme--dark .nav-divider {
  border-color: rgba(51, 65, 85, 0.8);
}

.v-theme--dark .nav-footer {
  border-top-color: rgba(51, 65, 85, 0.8);
}

.v-theme--dark .app-header {
  border-bottom-color: rgba(51, 65, 85, 0.8) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.v-theme--dark .bottom-navigation {
  border-top-color: rgba(51, 65, 85, 0.8) !important;
}
</style>
  margin-bottom: var(--space-2) !important;
  transition: all var(--transition-fast) !important;
  animation: fadeInLeft 0.4s var(--transition-normal) both;
}

.nav-item--rail {
  justify-content: center !important;
  padding: var(--space-3) !important;
  min-height: 48px !important;
}

.nav-item:hover {
  background: var(--color-gradient-soft) !important;
  transform: translateX(4px);
}

.nav-item--rail:hover {
  transform: translateX(0) scale(1.05);
}

.nav-item--active {
  background: var(--color-gradient-soft) !important;
  color: var(--color-primary) !important;
  font-weight: var(--font-weight-medium) !important;
}

.nav-icon {
  color: inherit;
  margin-right: var(--space-3);
}

.nav-icon--rail {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

.nav-title {
  font-weight: var(--font-weight-medium);
  font-size: 0.9rem;
}

.nav-footer {
  margin-top: auto;
  padding: var(--space-4);
}

.nav-footer--rail {
  padding: var(--space-4) var(--space-2);
}

.nav-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-actions--rail {
  align-items: center;
}

.nav-btn {
  justify-content: flex-start !important;
  font-weight: var(--font-weight-medium) !important;
  border-radius: var(--radius-md) !important;
  transition: all var(--transition-fast) !important;
}

.nav-btn--rail {
  justify-content: center !important;
  min-width: 44px !important;
  width: 44px !important;
  height: 44px !important;
  padding: 0 !important;
}

.nav-btn:hover {
  background: rgba(0,0,0,0.04) !important;
}

.logout-btn {
  color: var(--color-error) !important;
}

/* App Header */
.app-header {
  background: var(--app-glass-bg) !important;
  backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid var(--app-border-light) !important;
  box-shadow: 0 2px 8px var(--app-shadow) !important;
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
  margin-right: var(--space-4);
}

.header-btn {
  color: var(--app-text-secondary) !important;
  transition: all 0.3s ease !important;
}

.header-btn:hover {
  color: var(--v-theme-primary) !important;
  background: var(--app-gradient-soft) !important;
}

/* Main Content */
.main-content {
  background: var(--app-background) !important;
  padding-top: 72px;
  padding-bottom: 0;
  min-height: 100vh;
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
  background: var(--app-glass-bg) !important;
  border-top: 1px solid var(--app-border) !important;
  box-shadow: 0 -2px 8px var(--app-shadow) !important;
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
  padding: var(--space-4);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.nav-header.rail-collapsed .user-profile {
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.nav-header.rail-collapsed .user-avatar {
  margin: 0 auto;
}

.nav-header.rail-collapsed .user-info {
  display: none;
}

/* Rail mode divider adjustments */
.nav-menu--rail + .nav-footer .nav-divider,
.nav-header.rail-collapsed + .nav-divider {
  margin: var(--space-2) var(--space-3);
  opacity: 0.4;
}

/* Ensure proper centering for all rail elements */
.navigation-drawer .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}

/* Rail mode list item content centering */
.nav-item--rail {
  justify-content: center !important;
  padding: var(--space-3) var(--space-2) !important;
  min-height: 48px !important;
  margin: var(--space-1) var(--space-2) !important;
  width: calc(100% - var(--space-4)) !important;
}

.nav-item--rail .v-list-item__content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: none !important;
}

.nav-item--rail .v-list-item__prepend {
  margin-inline-end: 0 !important;
  margin-inline-start: 0 !important;
  align-self: center;
}

/* Alternative approach: use absolute positioning to center icons perfectly */
.nav-item--rail {
  position: relative !important;
}

.nav-item--rail .nav-icon--rail {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
}

/* Rail mode navigation menu adjustments */
.nav-menu--rail {
  padding: var(--space-3) 0;
  align-items: center;
}

/* Rail mode footer adjustments */
.nav-footer--rail {
  padding: var(--space-3) var(--space-2);
}

.nav-actions--rail {
  align-items: center;
  width: 100%;
}

.nav-btn--rail {
  justify-content: center !important;
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
  padding: 0 !important;
  margin: var(--space-1) 0 !important;
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
