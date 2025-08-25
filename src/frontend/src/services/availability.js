import api from './api'

export const availabilityService = {
  // Get all availability for a tutor
  getAvailability: async (tutorId = null) => {
    try {
      const url = tutorId ? `/availability/${tutorId}` : '/availability'
      const response = await api.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get current tutor's availability
  getMyAvailability: async () => {
    try {
      const response = await api.get('/availability/my/slots')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create availability slot
  createAvailability: async (availabilityData) => {
    try {
      const response = await api.post('/availability', availabilityData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update availability slot
  updateAvailability: async (id, availabilityData) => {
    try {
      const response = await api.put(`/availability/${id}`, availabilityData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete availability slot
  deleteAvailability: async (id) => {
    try {
      const response = await api.delete(`/availability/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get available slots for a specific date and tutor
  getDateAvailability: async (tutorId, date) => {
    try {
      const response = await api.get(`/availability/${tutorId}/date/${date}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}
