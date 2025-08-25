import { defineStore } from 'pinia'
import { authService } from '../services'
import Cookies from 'js-cookie'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isStudent: (state) => state.user?.role === 'student',
    isTutor: (state) => state.user?.role === 'tutor',
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.name || '',
    userRole: (state) => state.user?.role || ''
  },

  actions: {
    // Initialize auth state from cookies
    initializeAuth() {
      const token = Cookies.get('token')
      const user = Cookies.get('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    },

    // Register new user
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authService.register(userData)
        
        if (response.success) {
          this.setAuthData(response.data)
          return { success: true }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Login user
    async login(identifier, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authService.login({ identifier, password })
        
        if (response.success) {
          this.setAuthData(response.data)
          return { success: true, user: response.data }
        } else {
          this.error = response.message || 'Login failed'
          return { success: false, error: this.error }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Logout user
    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuthData()
      }
    },

    // Set authentication data
    setAuthData(data) {
      this.user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        studentIndex: data.studentIndex,
        role: data.role,
        bio: data.bio,
        subjects: data.subjects
      }
      this.token = data.token
      this.isAuthenticated = true
      
      // Store in cookies
      Cookies.set('token', data.token, { expires: 7 })
      Cookies.set('user', JSON.stringify(this.user), { expires: 7 })
    },

    // Clear authentication data
    clearAuthData() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      
      // Clear cookies
      Cookies.remove('token')
      Cookies.remove('user')
    },

    // Update user profile
    updateUser(userData) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
        Cookies.set('user', JSON.stringify(this.user), { expires: 7 })
      }
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})
