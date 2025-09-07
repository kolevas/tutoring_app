<template>
  <v-container fluid class="create-session-container">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="4">
          <v-card-title class="primary white--text">
            <v-icon class="mr-2">{{ $route.params.id ? 'mdi-pencil' : 'mdi-calendar-plus' }}</v-icon>
            {{ $route.params.id ? 'Edit Tutoring Session' : 'Create New Tutoring Session' }}
          </v-card-title>
          <v-card-subtitle>
            {{ $route.params.id ? 'Update session details' : 'Set up a new session for students to book' }}
          </v-card-subtitle>

          <v-card-text class="pt-6">
            <v-form @submit.prevent="createSession" ref="sessionForm">
              <!-- Session Title -->
              <v-text-field
                v-model="form.title"
                label="Session Title"
                :rules="titleRules"
                required
                outlined
                prepend-icon="mdi-format-title"
                placeholder="e.g., Algebra Basics, JavaScript Fundamentals"
              ></v-text-field>

              <!-- Subject Selection -->
              <v-select
                v-model="form.subject"
                :items="subjects"
                label="Subject"
                :rules="subjectRules"
                required
                outlined
                prepend-icon="mdi-book-open-variant"
              ></v-select>

              <!-- Description -->
              <v-textarea
                v-model="form.description"
                label="Session Description"
                :rules="descriptionRules"
                required
                outlined
                rows="4"
                prepend-icon="mdi-text"
                placeholder="Describe what students will learn in this session..."
              ></v-textarea>

              <!-- No Availability Warning -->
              <v-alert 
                v-if="availabilityLoaded && upcomingAvailableSlots.length === 0"
                type="warning" 
                variant="tonal" 
                class="mb-4"
              >
                <v-icon start>mdi-calendar-alert</v-icon>
                <strong>No availability set!</strong> Please 
                <router-link to="/availability" class="text-decoration-none">
                  set your availability
                </router-link> first to create sessions.
              </v-alert>

              <!-- Date and Time Selection -->
              <v-row class="mb-4">
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.date"
                    :items="availableDates"
                    label="Available Dates"
                    :rules="dateRules"
                    required
                    outlined
                    prepend-icon="mdi-calendar"
                    @update:model-value="checkAvailabilityForDate"
                    hint="Only dates with availability shown"
                    persistent-hint
                  ></v-select>
                </v-col>
                <v-col cols="6" md="4">
                  <v-select
                    v-model="form.startTime"
                    :items="availableStartTimes"
                    label="Start Time"
                    :rules="timeRules"
                    required
                    outlined
                    prepend-icon="mdi-clock-start"
                    :disabled="!form.date"
                    hint="Available time slots based on your availability"
                    persistent-hint
                  ></v-select>
                </v-col>
                <v-col cols="6" md="4">
                  <v-select
                    v-model="form.endTime"
                    :items="availableEndTimes"
                    label="End Time"
                    :rules="endTimeRules"
                    required
                    outlined
                    prepend-icon="mdi-clock-end"
                    :disabled="!form.startTime"
                  ></v-select>
                </v-col>
              </v-row>

              <!-- Availability Warning -->
              <v-alert
                v-if="availabilityWarning"
                type="warning"
                outlined
                class="mb-4"
              >
                {{ availabilityWarning }}
              </v-alert>

              <!-- Duration (calculated) -->
              <v-text-field
                :value="calculatedDuration"
                label="Duration"
                readonly
                outlined
                prepend-icon="mdi-timer"
                suffix="minutes"
              ></v-text-field>

              <!-- Meeting Link -->
              <v-text-field
                v-model="form.meetingLink"
                label="Meeting Link (optional)"
                :rules="meetingLinkRules"
                outlined
                prepend-icon="mdi-video"
                placeholder="https://zoom.us/j/... or Google Meet link"
              ></v-text-field>

              <!-- Additional Notes -->
              <v-textarea
                v-model="form.notes"
                label="Additional Notes (optional)"
                :rules="notesRules"
                outlined
                rows="3"
                prepend-icon="mdi-note-text"
                placeholder="Any special requirements or preparation needed..."
              ></v-textarea>

              <!-- Error Display -->
              <v-alert
                v-if="error"
                type="error"
                dismissible
                @input="error = null"
                class="mb-4"
              >
                {{ error }}
              </v-alert>

              <!-- Action Buttons -->
              <v-row class="mt-4">
                <v-col>
                  <v-btn
                    text
                    large
                    @click="$router.go(-1)"
                  >
                    Cancel
                  </v-btn>
                </v-col>
                <v-col class="text-right">
                  <v-btn
                    color="primary"
                    large
                    type="submit"
                    :loading="loading"
                    :disabled="!isFormValid"
                  >
                    <v-icon class="mr-2">{{ $route.params.id ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
                    {{ $route.params.id ? 'Update Session' : 'Create Session' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 success--text">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          {{ $route.params.id ? 'Session Updated!' : 'Session Created!' }}
        </v-card-title>
        <v-card-text>
          {{ $route.params.id 
            ? 'Your tutoring session has been updated successfully.' 
            : 'Your tutoring session has been created successfully. Students can now find and book it.' 
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="goToDashboard">
            {{ $route.params.id ? 'Back to My Sessions' : 'Go to Dashboard' }}
          </v-btn>
          <v-btn v-if="!$route.params.id" color="secondary" @click="createAnother">
            Create Another
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useSessionStore } from '../stores/sessions'
import { useAuthStore } from '../stores/auth'
import { useAvailabilityStore } from '../stores/availability'
import { FINKI_SUBJECTS } from '../config/subjects'

export default {
  name: 'CreateSessionView',
  
  setup() {
    const sessionStore = useSessionStore()
    const authStore = useAuthStore()
    const availabilityStore = useAvailabilityStore()
    
    return {
      sessionStore,
      authStore,
      availabilityStore
    }
  },

  data() {
    return {
      form: {
        title: '',
        subject: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
        notes: ''
      },
      loading: false,
      error: null,
      successDialog: false,
      availabilityWarning: '',
      dateAvailability: [],
      subjects: FINKI_SUBJECTS,
      availabilityLoaded: false,
      titleRules: [
        v => !!v || 'Title is required',
        v => v.length >= 5 || 'Title must be at least 5 characters',
        v => v.length <= 100 || 'Title must be less than 100 characters'
      ],
      subjectRules: [
        v => !!v || 'Subject is required'
      ],
      descriptionRules: [
        v => !!v || 'Description is required',
        v => v.length >= 20 || 'Description must be at least 20 characters',
        v => v.length <= 1000 || 'Description must be less than 1000 characters'
      ],
      dateRules: [
        v => !!v || 'Date is required'
      ],
      timeRules: [
        v => !!v || 'Time is required'
      ],
      meetingLinkRules: [
        v => !v || v.length <= 500 || 'Meeting link must be less than 500 characters',
        v => !v || /^https?:\/\/.+/.test(v) || 'Meeting link must be a valid URL starting with http:// or https://'
      ],
      notesRules: [
        v => !v || v.length <= 1000 || 'Notes must be less than 1000 characters'
      ]
    }
  },

  computed: {
    today() {
      return new Date().toISOString().split('T')[0]
    },

    calculatedDuration() {
      if (this.form.startTime && this.form.endTime) {
        const start = new Date(`2000-01-01T${this.form.startTime}:00`)
        const end = new Date(`2000-01-01T${this.form.endTime}:00`)
        const diffMs = end - start
        const diffMins = Math.floor(diffMs / 60000)
        return diffMins > 0 ? diffMins : 0
      }
      return 0
    },

    availableStartTimes() {
      if (!this.dateAvailability.length) {
        this.availabilityWarning = 'No availability set for this date. Please set your availability first.'
        return []
      }

      this.availabilityWarning = ''
      const times = []
      
      this.dateAvailability.forEach(slot => {
        const startTime = slot.startTime
        const endTime = slot.endTime
        
        // Add the exact start time of the availability slot
        if (!times.includes(startTime)) {
          times.push(startTime)
        }
        
        // Also generate 30-minute intervals within the slot for flexibility
        let current = this.timeStringToMinutes(startTime) + 30
        const end = this.timeStringToMinutes(endTime)
        
        while (current < end) {
          const timeStr = this.minutesToTimeString(current)
          if (!times.includes(timeStr)) {
            times.push(timeStr)
          }
          current += 30 // 30-minute intervals
        }
      })
      
      return times.sort()
    },

    availableEndTimes() {
      if (!this.form.startTime || !this.dateAvailability.length) {
        return []
      }

      const times = []
      const startMinutes = this.timeStringToMinutes(this.form.startTime)
      
      this.dateAvailability.forEach(slot => {
        const slotStart = this.timeStringToMinutes(slot.startTime)
        const slotEnd = this.timeStringToMinutes(slot.endTime)
        
        // If the selected start time is within this slot
        if (startMinutes >= slotStart && startMinutes < slotEnd) {
          // Generate end times from start time + 30 minutes to slot end
          let current = startMinutes + 30 // Minimum 30 minutes session
          
          while (current <= slotEnd) {
            const timeStr = this.minutesToTimeString(current)
            if (!times.includes(timeStr)) {
              times.push(timeStr)
            }
            current += 30
          }
        }
      })
      
      return times.sort()
    },

    endTimeRules() {
      return [
        v => !!v || 'End time is required',
        v => {
          if (this.form.startTime && v) {
            return v > this.form.startTime || 'End time must be after start time'
          }
          return true
        }
      ]
    },

    isFormValid() {
      return this.form.title && 
             this.form.subject && 
             this.form.description && 
             this.form.date && 
             this.form.startTime && 
             this.form.endTime &&
             this.form.endTime > this.form.startTime &&
             this.dateAvailability.length > 0
    },

    upcomingAvailableSlots() {
      if (!this.availabilityStore.availability) return []

      const today = new Date()
      const nextFourWeeks = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000)
      const slots = []

      // Get all availability slots
      this.availabilityStore.availability.forEach(slot => {
        if (slot.isRecurring) {
          // For recurring slots, generate dates for the next four weeks
          for (let d = new Date(today); d <= nextFourWeeks; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()]
            if (slot.dayOfWeek === dayOfWeek && d >= today) {
              slots.push({
                date: new Date(d).toISOString().split('T')[0],
                startTime: slot.startTime,
                endTime: slot.endTime,
                isRecurring: true,
                availabilityId: slot._id
              })
            }
          }
        } else if (slot.specificDate) {
          // For specific date slots
          const slotDate = new Date(slot.specificDate)
          if (slotDate >= today && slotDate <= nextFourWeeks) {
            slots.push({
              date: new Date(slotDate).toISOString().split('T')[0],
              startTime: slot.startTime,
              endTime: slot.endTime,
              isRecurring: false,
              availabilityId: slot._id
            })
          }
        }
      })

      // Sort by date and start time
      return slots.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.startTime.localeCompare(b.startTime)
      })
    },

    availableDates() {
      const uniqueDates = [...new Set(this.upcomingAvailableSlots.map(slot => slot.date))]
      return uniqueDates.map(date => {
        const dateObj = new Date(date + 'T00:00:00')
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
        const day = dateObj.getDate()
        return {
          title: `${dayName}, ${month} ${day} (${date})`,
          value: date
        }
      }).sort((a, b) => new Date(a.value) - new Date(b.value))
    }
  },

  methods: {
    // Time conversion utilities
    timeStringToMinutes(timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    },

    minutesToTimeString(minutes) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    },

    async checkAvailabilityForDate() {
      if (!this.form.date || !this.authStore.user) return

      try {
        const date = new Date(this.form.date)
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
        
        // First ensure we have the latest availability data
        await this.availabilityStore.fetchMyAvailability()
        
        // Get availability for this tutor and day (both recurring and specific date)
        const allAvailability = this.availabilityStore.availability || []
        
        this.dateAvailability = allAvailability.filter(slot => {
          // Check if it's a recurring slot for this day of week
          if (slot.isRecurring && slot.dayOfWeek === dayOfWeek) {
            return true
          }
          // Check if it's a specific date slot for this exact date
          if (!slot.isRecurring && slot.specificDate) {
            const slotDate = new Date(slot.specificDate).toISOString().split('T')[0]
            const selectedDate = this.form.date
            return slotDate === selectedDate
          }
          return false
        })
        
        // Reset time selections when date changes
        this.form.startTime = ''
        this.form.endTime = ''
        
      } catch (error) {
        console.error('Error checking availability:', error)
        this.availabilityWarning = 'Error checking availability for this date.'
      }
    },

    async createSession() {
      if (!this.$refs.sessionForm.validate()) {
        return
      }

      this.loading = true
      this.error = null

      try {
        const sessionData = {
          ...this.form,
          duration: this.calculatedDuration,
          status: 'available'
        }

        const sessionId = this.$route.params.id
        const isEditing = !!sessionId

        let result
        if (isEditing) {
          // Update existing session
          result = await this.sessionStore.updateSession(sessionId, sessionData)
        } else {
          // Create new session
          result = await this.sessionStore.createSession(sessionData)
        }
        
        if (result.success) {
          this.successDialog = true
        } else {
          this.error = result.error || `Failed to ${isEditing ? 'update' : 'create'} session`
        }
      } catch (error) {
        this.error = `An error occurred while ${this.$route.params.id ? 'updating' : 'creating'} the session`
        console.error('Create/Update session error:', error)
      } finally {
        this.loading = false
      }
    },

    goToDashboard() {
      if (this.$route.params.id) {
        // If editing, go back to My Sessions
        this.$router.push('/my-sessions')
      } else {
        // If creating, go to dashboard
        this.$router.push('/dashboard')
      }
    },

    createAnother() {
      this.successDialog = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        title: '',
        subject: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
        notes: ''
      }
      this.dateAvailability = []
      this.availabilityWarning = ''
      this.$refs.sessionForm.resetValidation()
    }
  },

  async mounted() {
    // Check if we're editing an existing session
    const sessionId = this.$route.params.id
    const isEditing = !!sessionId
    
    if (isEditing) {
      // Load session data for editing
      await this.sessionStore.fetchSessions()
      const session = this.sessionStore.sessions.find(s => s._id === sessionId)
      if (session) {
        this.form = {
          title: session.title || '',
          subject: session.subject || '',
          description: session.description || '',
          date: session.date ? session.date.split('T')[0] : '',
          startTime: session.startTime || '',
          endTime: session.endTime || '',
          meetingLink: session.meetingLink || '',
          notes: session.notes || ''
        }
      }
    } else {
      // Set default date to tomorrow for new sessions
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      this.form.date = tomorrow.toISOString().split('T')[0]
    }

    // Pre-fill subjects based on tutor's expertise
    if (this.authStore.user && this.authStore.user.subjects) {
      // If tutor has specified subjects, prioritize them
      const userSubjects = this.authStore.user.subjects
      this.subjects = [...userSubjects, ...this.subjects.filter(s => !userSubjects.includes(s))]
    }

    // Load tutor's availability
    if (this.authStore.user && this.authStore.user.role === 'tutor') {
      try {
        await this.availabilityStore.fetchMyAvailability()
        this.availabilityLoaded = true
        // Check availability for the default date
        this.checkAvailabilityForDate()
      } catch (error) {
        console.error('Error loading availability:', error)
        this.availabilityLoaded = true // Still mark as loaded even if there's an error
      }
    } else {
      this.availabilityLoaded = true
    }
  }
}
</script>

<style scoped>
.create-session-container {
  min-height: calc(100vh - 100px);
  padding-top: 20px;
}

.v-card {
  border-radius: 12px;
}

.v-text-field, .v-textarea, .v-select {
  margin-bottom: 8px;
}
</style>
