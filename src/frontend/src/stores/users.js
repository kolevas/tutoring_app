import { defineStore } from 'pinia'
import { userService } from '../services'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    tutors: [],
    currentUser: null,
    loading: false,
    error: null
  }),

  getters: {
    students: (state) => {
      return state.users.filter(user => user.role === 'student')
    },

    activeTutors: (state) => {
      return state.tutors.filter(tutor => tutor.isActive)
    },

    tutorsBySubject: (state) => (subject) => {
      return state.tutors.filter(tutor => 
        tutor.subjects && tutor.subjects.includes(subject)
      )
    }
  },

  actions: {
    // Fetch all users (admin only)
    async fetchUsers(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await userService.getUsers(params)
        if (response.success) {
          this.users = response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch users'
        console.error('Fetch users error:', error)
      } finally {
        this.loading = false
      }
    },

    // Create new user (admin only)
    async createUser(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await userService.createUser(userData)
        if (response.success) {
          // Add new user to the users array
          this.users.push(response.data)
          
          // If it's a tutor, add to tutors array too
          if (response.data.role === 'tutor') {
            this.tutors.push(response.data)
          }
          
          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Fetch all tutors
    async fetchTutors() {
      this.loading = true
      this.error = null

      try {
        const response = await userService.getTutors()
        if (response.success) {
          this.tutors = response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch tutors'
        console.error('Fetch tutors error:', error)
      } finally {
        this.loading = false
      }
    },

    // Fetch single user
    async fetchUser(id) {
      this.loading = true
      this.error = null

      try {
        const response = await userService.getUser(id)
        if (response.success) {
          this.currentUser = response.data
          return response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch user'
        console.error('Fetch user error:', error)
      } finally {
        this.loading = false
      }
    },

    // Update user
    async updateUser(id, userData) {
      this.loading = true
      this.error = null

      try {
        const response = await userService.updateUser(id, userData)
        if (response.success) {
          // Update in users array if it exists
          const userIndex = this.users.findIndex(user => user._id === id)
          if (userIndex !== -1) {
            this.users[userIndex] = response.data
          }

          // Update in tutors array if it's a tutor
          const tutorIndex = this.tutors.findIndex(tutor => tutor._id === id)
          if (tutorIndex !== -1) {
            this.tutors[tutorIndex] = response.data
          }

          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Delete user (admin only)
    async deleteUser(id) {
      this.loading = true
      this.error = null

      try {
        const response = await userService.deleteUser(id)
        if (response.success) {
          this.users = this.users.filter(user => user._id !== id)
          this.tutors = this.tutors.filter(tutor => tutor._id !== id)
          return { success: true }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Update user role (admin only)
    async updateUserRole(userId, role) {
      this.loading = true
      this.error = null

      try {
        const response = await userService.updateUserRole(userId, role)
        if (response.success) {
          // Update in users array
          const userIndex = this.users.findIndex(user => user._id === userId)
          if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], role }
          }

          // Update tutors array based on new role
          if (role === 'tutor') {
            // Add to tutors if not already there
            const tutorExists = this.tutors.find(tutor => tutor._id === userId)
            if (!tutorExists && userIndex !== -1) {
              this.tutors.push(this.users[userIndex])
            }
          } else {
            // Remove from tutors if role changed away from tutor
            this.tutors = this.tutors.filter(tutor => tutor._id !== userId)
          }

          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Bulk update user roles (admin only)
    async bulkUpdateUserRoles(updates) {
      this.loading = true
      this.error = null

      try {
        const response = await userService.bulkUpdateUserRoles(updates)
        if (response.success) {
          // Update users array with new roles
          response.data.updated.forEach(updatedUser => {
            const userIndex = this.users.findIndex(user => user._id === updatedUser.userId)
            if (userIndex !== -1) {
              this.users[userIndex] = { ...this.users[userIndex], role: updatedUser.newRole }
            }
          })

          // Refresh tutors array to reflect role changes
          await this.fetchTutors()

          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to bulk update user roles'
        return { success: false, error: this.error }
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
