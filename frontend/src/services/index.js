import api from './api'
export { availabilityService } from './availability'

export const authService = {
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout user
  logout() {
    // Clear cookies and redirect will be handled by api interceptor
    return api.post('/auth/logout').catch(() => {
      // Even if the request fails, clear local storage
      window.location.href = '/login'
    })
  }
}

export const userService = {
  // Get all users (admin only)
  async getUsers(params = {}) {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Create new user (admin only)
  async createUser(userData) {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Get user by ID
  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Update user profile
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Delete user (admin only)
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Get all tutors
  async getTutors() {
    const response = await api.get('/users/tutors')
    return response.data
  },

  // Update user role (admin only)
  async updateUserRole(userId, role) {
    const response = await api.put(`/users/${userId}/role`, { role })
    return response.data
  },

  // Bulk update user roles (admin only)
  async bulkUpdateUserRoles(updates) {
    const response = await api.put('/users/roles/bulk', { updates })
    return response.data
  }
}

export const sessionService = {
  // Get all sessions
  async getSessions(params = {}) {
    const response = await api.get('/sessions', { params })
    return response.data
  },

  // Get available sessions for browsing
  async getAvailableSessions(params = {}) {
    const response = await api.get('/sessions/available', { params })
    return response.data
  },

  // Get session by ID
  async getSession(id) {
    const response = await api.get(`/sessions/${id}`)
    return response.data
  },

  // Create new session (tutor only)
  async createSession(sessionData) {
    const response = await api.post('/sessions', sessionData)
    return response.data
  },

  // Update session
  async updateSession(id, sessionData) {
    const response = await api.put(`/sessions/${id}`, sessionData)
    return response.data
  },

  // Delete session
  async deleteSession(id) {
    const response = await api.delete(`/sessions/${id}`)
    return response.data
  },

  // Book a session (student only)
  async bookSession(id) {
    const response = await api.put(`/sessions/${id}/book`)
    return response.data
  },

  // Cancel booking
  async cancelBooking(id) {
    const response = await api.put(`/sessions/${id}/cancel`)
    return response.data
  },

  // Cancel session (tutor only)
  async cancelSession(id) {
    const response = await api.put(`/sessions/${id}/cancel`)
    return response.data
  }
}
