import { defineStore } from 'pinia'
import { availabilityService } from '../services'

export const useAvailabilityStore = defineStore('availability', {
  state: () => ({
    availability: [],
    currentSlot: null,
    loading: false,
    error: null
  }),

  getters: {
    // Get availability for a specific tutor
    getTutorAvailability: (state) => (tutorId) => {
      return state.availability.filter(slot => slot.tutor._id === tutorId)
    },

    // Get availability by day of week
    getAvailabilityByDay: (state) => (dayOfWeek) => {
      return state.availability.filter(slot => slot.dayOfWeek === dayOfWeek)
    },

    // Get available time slots for a specific day and tutor
    getAvailableSlots: (state) => (tutorId, dayOfWeek) => {
      return state.availability.filter(slot => 
        slot.tutor._id === tutorId && 
        slot.dayOfWeek === dayOfWeek && 
        slot.isAvailable
      )
    },

    // Check if a specific time slot is available
    isSlotAvailable: (state) => (tutorId, dayOfWeek, startTime, endTime) => {
      return state.availability.some(slot =>
        slot.tutor._id === tutorId &&
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime <= startTime &&
        slot.endTime >= endTime &&
        slot.isAvailable
      )
    }
  },

  actions: {
    // Fetch all availability (optionally for a specific tutor)
    async fetchAvailability(tutorId = null) {
      this.loading = true
      this.error = null

      try {
        const response = await availabilityService.getAvailability(tutorId)
        if (response.success) {
          this.availability = response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch availability'
        console.error('Fetch availability error:', error)
      } finally {
        this.loading = false
      }
    },

    // Fetch current tutor's availability
    async fetchMyAvailability() {
      this.loading = true
      this.error = null

      try {
        const response = await availabilityService.getMyAvailability()
        if (response.success) {
          this.availability = response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch your availability'
        console.error('Fetch my availability error:', error)
      } finally {
        this.loading = false
      }
    },

    // Create availability slot
    async createAvailabilitySlot(slotData) {
      this.loading = true
      this.error = null

      try {
        const response = await availabilityService.createAvailability(slotData)
        if (response.success) {
          this.availability.push(response.data)
          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create availability slot'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Update availability slot
    async updateAvailabilitySlot(id, slotData) {
      this.loading = true
      this.error = null

      try {
        const response = await availabilityService.updateAvailability(id, slotData)
        if (response.success) {
          const index = this.availability.findIndex(slot => slot._id === id)
          if (index !== -1) {
            this.availability[index] = response.data
          }
          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update availability slot'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Delete availability slot
    async deleteAvailabilitySlot(id) {
      this.loading = true
      this.error = null

      try {
        const response = await availabilityService.deleteAvailability(id)
        if (response.success) {
          this.availability = this.availability.filter(slot => slot._id !== id)
          return { success: true }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete availability slot'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Get availability for a specific date and tutor
    async fetchDateAvailability(tutorId, date) {
      this.loading = true
      this.error = null

      try {
        const response = await availabilityService.getDateAvailability(tutorId, date)
        if (response.success) {
          return response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch date availability'
        console.error('Fetch date availability error:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})
