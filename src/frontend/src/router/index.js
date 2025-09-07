import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Cookies from 'js-cookie'

// Layouts
import DefaultLayout from '../layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes (no layout)
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register', 
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    
    // Protected routes (with layout)
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          redirect: '/dashboard'
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('../views/ProfileView.vue')
        },
        
        // Student routes
        {
          path: '/sessions',
          name: 'Sessions',
          component: () => import('../views/SessionsView.vue'),
          meta: { roles: ['student'] }
        },
        {
          path: '/my-sessions',
          name: 'MyBookings',
          component: () => import('../views/MySessionsView.vue'),
          meta: { roles: ['student'] }
        },
        
        // Tutor routes
        {
          path: '/tutor-sessions',
          name: 'TutorSessions',
          component: () => import('../views/TutorSessionsView.vue'),
          meta: { roles: ['tutor'] }
        },
        {
          path: '/sessions/create',
          name: 'CreateSession',
          component: () => import('../views/CreateSessionView.vue'),
          meta: { roles: ['tutor', 'admin'] }
        },
        {
          path: '/sessions/edit/:id',
          name: 'EditSession',
          component: () => import('../views/CreateSessionView.vue'),
          meta: { roles: ['tutor', 'admin'] }
        },
        {
          path: '/availability',
          name: 'Availability',
          component: () => import('../views/AvailabilityView.vue'),
          meta: { roles: ['tutor'] }
        },
        
        // Admin routes
        {
          path: '/admin/users',
          name: 'ManageUsers',
          component: () => import('../views/admin/UsersView.vue'),
          meta: { roles: ['admin'] }
        },
        {
          path: '/admin/sessions',
          name: 'AllSessions',
          component: () => import('../views/admin/SessionsView.vue'),
          meta: { roles: ['admin'] }
        }
      ]
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiredRoles = to.meta.roles
  
  if (requiresAuth && !token) {
    next('/login')
  } else if (requiresGuest && token) {
    next('/dashboard')
  } else if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
