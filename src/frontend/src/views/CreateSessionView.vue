<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="4">
          <v-card-title class="primary white--text">
            <v-icon class="mr-2">mdi-calendar-plus</v-icon>
            Create New Tutoring Session
          </v-card-title>
          <v-card-subtitle class="white">
            Set up a new session for students to book
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

              <!-- Date and Time with Availability Check -->
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.date"
                    label="Date"
                    type="date"
                    :min="today"
                    :rules="dateRules"
                    required
                    outlined
                    prepend-icon="mdi-calendar"
                    @input="checkAvailabilityForDate"
                  ></v-text-field>
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
                outlined
                prepend-icon="mdi-video"
                placeholder="https://zoom.us/j/... or Google Meet link"
              ></v-text-field>

              <!-- Additional Notes -->
              <v-textarea
                v-model="form.notes"
                label="Additional Notes (optional)"
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
                    <v-icon class="mr-2">mdi-plus</v-icon>
                    Create Session
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
          Session Created!
        </v-card-title>
        <v-card-text>
          Your tutoring session has been created successfully. Students can now find and book it.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="goToDashboard">
            Go to Dashboard
          </v-btn>
          <v-btn color="secondary" @click="createAnother">
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

        const result = await this.sessionStore.createSession(sessionData)
        
        if (result.success) {
          this.successDialog = true
        } else {
          this.error = result.error || 'Failed to create session'
        }
      } catch (error) {
        this.error = 'An error occurred while creating the session'
        console.error('Create session error:', error)
      } finally {
        this.loading = false
      }
    },

    goToDashboard() {
      this.$router.push('/dashboard')
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
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    this.form.date = tomorrow.toISOString().split('T')[0]

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
        // Check availability for the default date
        this.checkAvailabilityForDate()
      } catch (error) {
        console.error('Error loading availability:', error)
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-text-field, .v-textarea, .v-select {
  margin-bottom: 8px;
}
</style>
