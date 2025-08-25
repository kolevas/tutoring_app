import { defineStore } from 'pinia'
import { sessionService } from '../services'

export const useSessionStore = defineStore('sessions', {
  state: () => ({
    sessions: [],
    currentSession: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      tutor: '',
      student: '',
      date: '',
      subject: ''
    }
  }),

  getters: {
    availableSessions: (state) => state.sessions.filter(s => s.status === 'available'),

    bookedSessions: (state) => state.sessions.filter(s => s.status === 'booked'),

    mySessions: (state) => (userId, role) => {
      if (role === 'tutor') return state.sessions.filter(s => s.tutor._id === userId)
      if (role === 'student') return state.sessions.filter(s => s.student?._id === userId)
      return []
    },

    filteredSessions: (state) => {
      let filtered = [...state.sessions]
      if (state.filters.status) filtered = filtered.filter(s => s.status === state.filters.status)
      if (state.filters.tutor) filtered = filtered.filter(s => s.tutor._id === state.filters.tutor)
      if (state.filters.student) filtered = filtered.filter(s => s.student?._id === state.filters.student)
      if (state.filters.subject) filtered = filtered.filter(s => s.subject.toLowerCase().includes(state.filters.subject.toLowerCase()))
      if (state.filters.date) {
        filtered = filtered.filter(s => new Date(s.date).toDateString() === new Date(state.filters.date).toDateString())
      }
      return filtered
    },

    upcomingSessions: (state) => {
      const now = new Date()
      return state.sessions
        .filter(s => new Date(s.date) >= now && s.status === 'booked')
        .sort((a,b) => new Date(a.date) - new Date(b.date))
    }
  },

  actions: {
    async fetchSessions(params = {}) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.getSessions(params)
        if (response.success) this.sessions = response.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to fetch sessions'
        console.error('Fetch sessions error:', e)
      } finally { this.loading = false }
    },
    async fetchAvailableSessions(params = {}) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.getAvailableSessions(params)
        if (response.success) this.sessions = response.data
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to fetch available sessions'
        console.error('Fetch available sessions error:', e)
      } finally { this.loading = false }
    },
    async fetchSession(id) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.getSession(id)
        if (response.success) { this.currentSession = response.data; return response.data }
      } catch (e) {
        this.error = e.response?.data?.message || 'Failed to fetch session'
        console.error('Fetch session error:', e)
      } finally { this.loading = false }
    },
    async createSession(sessionData) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.createSession(sessionData)
        if (response.success) { this.sessions.push(response.data); return { success:true, data:response.data } }
      } catch (e) { this.error = e.response?.data?.message || 'Failed to create session'; return { success:false, error:this.error } }
      finally { this.loading = false }
    },
    async updateSession(id, sessionData) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.updateSession(id, sessionData)
        if (response.success) {
          const i = this.sessions.findIndex(s => s._id === id)
          if (i !== -1) this.sessions[i] = response.data
          return { success:true, data:response.data }
        }
      } catch (e) { this.error = e.response?.data?.message || 'Failed to update session'; return { success:false, error:this.error } }
      finally { this.loading = false }
    },
    async deleteSession(id) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.deleteSession(id)
        if (response.success) { this.sessions = this.sessions.filter(s => s._id !== id); return { success:true } }
      } catch (e) { this.error = e.response?.data?.message || 'Failed to delete session'; return { success:false, error:this.error } }
      finally { this.loading = false }
    },
    async bookSession(id) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.bookSession(id)
        if (response.success) {
          const i = this.sessions.findIndex(s => s._id === id)
          if (i !== -1) this.sessions[i] = response.data
          return { success:true, data:response.data }
        }
      } catch (e) { this.error = e.response?.data?.message || 'Failed to book session'; return { success:false, error:this.error } }
      finally { this.loading = false }
    },
    async cancelBooking(id) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.cancelBooking(id)
        if (response.success) {
          const i = this.sessions.findIndex(s => s._id === id)
            ;if (i !== -1) this.sessions[i] = response.data
          return { success:true, data:response.data }
        }
      } catch (e) { this.error = e.response?.data?.message || 'Failed to cancel booking'; return { success:false, error:this.error } }
      finally { this.loading = false }
    },
    async cancelSession(id) {
      this.loading = true; this.error = null
      try {
        const response = await sessionService.cancelSession(id)
        if (response.success) {
          const i = this.sessions.findIndex(s => s._id === id)
          if (i !== -1) this.sessions[i] = response.data
          return { success:true, data:response.data }
        }
      } catch (e) { this.error = e.response?.data?.message || 'Failed to cancel session'; return { success:false, error:this.error } }
      finally { this.loading = false }
    },
    setFilters(filters) { this.filters = { ...this.filters, ...filters } },
    clearFilters() { this.filters = { status:'', tutor:'', student:'', date:'', subject:'' } },
    clearError() { this.error = null }
  }
})
