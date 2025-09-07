<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="6" class="availability-card-modern">
          <v-card-title class="primary white--text">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            Manage Your Availability
          </v-card-title>
          <v-card-subtitle class="white">
            Set your available time slots for students to book sessions
          </v-card-subtitle>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <v-card outlined class="calendar-card-modern">
                  <v-card-title>
                    <span>Availability Calendar</span>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      @click="openAddAvailabilityDialog"
                    >
                      <v-icon class="mr-2">mdi-plus</v-icon>
                      Add Time Slot
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <!-- Calendar Component -->
                    <CalendarComponent
                      :events="calendarEvents"
                      view="dayGridMonth"
                      :selectable="true"
                      :editable="true"
                      @date-select="handleDateSelect"
                      @event-click="handleEventClick"
                      @event-drop="handleEventDrop"
                      @event-resize="handleEventResize"
                    />
                    
                    <!-- No availability message -->
                    <div v-if="availableSlots.length === 0" class="text-center pa-8">
                      <v-icon size="64" color="grey lighten-1">mdi-calendar-outline</v-icon>
                      <h3 class="grey--text">No availability set</h3>
                      <p class="grey--text">Click "Add Time Slot" to start setting your availability</p>
                    </div>

                    <!-- Available Time Slots List -->
                    <v-card v-if="availableSlots.length > 0" class="mt-4" outlined>
                      <v-card-title>Current Availability</v-card-title>
                      <v-list>
                        <v-list-item
                          v-for="slot in availableSlots"
                          :key="slot._id"
                          dense
                        >
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ slot.dayOfWeek ? slot.dayOfWeek.toUpperCase() : slot.specificDate }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{ slot.startTime }} - {{ slot.endTime }}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                          <v-list-item-action>
                            <v-btn icon color="error" @click="deleteAvailability(slot._id)">
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Next Week Schedule -->
              <v-col cols="12" md="4">
                <v-card outlined class="side-card-modern" style="box-shadow: none !important;">
                  <v-card-title>Next Week Availability</v-card-title>
                  <v-list>
                    <v-list-item v-for="day in weeklySchedule" :key="day.key" dense>
                      <v-list-item-content>
                        <v-list-item-title>{{ day.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ day.times }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Availability Dialog -->
    <v-dialog v-model="showAddAvailabilityDialog" max-width="500">
      <v-card>
        <v-card-title class="primary white--text">
          {{ editingSlot ? 'Edit Availability' : 'Add Availability' }}
        </v-card-title>
        
        <v-card-text class="pt-4">
          <v-form ref="availabilityForm" v-model="formValid">
            <!-- Recurring or Specific Date -->
            <v-switch
              v-model="availabilityForm.isRecurring"
              label="Recurring weekly slot"
              color="primary"
            ></v-switch>
            
            <!-- Day of Week (for recurring) -->
            <v-select
              v-if="availabilityForm.isRecurring"
              v-model="availabilityForm.dayOfWeek"
              :items="dayOptions"
              item-title="text"
              item-value="value"
              label="Day of Week"
              :rules="[v => !!v || 'Day of week is required']"
              outlined
            ></v-select>
            
            <!-- Specific Date (for one-time) -->
            <v-text-field
              v-if="!availabilityForm.isRecurring"
              v-model="availabilityForm.specificDate"
              label="Date"
              type="date"
              :min="today"
              :rules="[v => !!v || 'Date is required']"
              outlined
            ></v-text-field>
            
            <!-- Time Range -->
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="availabilityForm.startTime"
                  label="Start Time"
                  type="time"
                  :rules="[v => !!v || 'Start time is required']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="availabilityForm.endTime"
                  label="End Time"
                  type="time"
                  :rules="[v => !!v || 'End time is required', v => v > availabilityForm.startTime || 'End time must be after start time']"
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddAvailabilityDialog = false">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveAvailability"
            :disabled="!formValid"
          >
            {{ editingSlot ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Session Details Dialog -->
    <v-dialog v-model="showSessionDetailsDialog" max-width="600">
      <v-card>
        <v-card-title class="primary white--text">
          <v-icon class="mr-2">mdi-calendar-clock</v-icon>
          Session Details
        </v-card-title>
        
        <v-card-text class="pt-4" v-if="selectedSession">
          <v-row>
            <v-col cols="12">
              <h3 class="text-h6 mb-2">{{ selectedSession.title }}</h3>
              <p class="text-subtitle-1 text--secondary mb-4">{{ selectedSession.subject }}</p>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="6">
              <v-list-item class="pa-0">
                <v-list-item-icon>
                  <v-icon>mdi-account-student</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Student</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSession.student?.name || 'Not assigned' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item class="pa-0">
                <v-list-item-icon>
                  <v-icon>mdi-calendar</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Date</v-list-item-title>
                  <v-list-item-subtitle>{{ formatSessionDate(selectedSession.date) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="6">
              <v-list-item class="pa-0">
                <v-list-item-icon>
                  <v-icon>mdi-clock</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Time</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSession.startTime }} - {{ selectedSession.endTime }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col cols="6">
              <v-list-item class="pa-0">
                <v-list-item-icon>
                  <v-icon>mdi-timer</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Duration</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSession.duration }} minutes</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-list-item class="pa-0">
                <v-list-item-icon>
                  <v-icon>mdi-text</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Description</v-list-item-title>
                  <v-list-item-subtitle class="text-wrap">{{ selectedSession.description }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          
          <v-row v-if="selectedSession.meetingLink">
            <v-col cols="12">
              <v-list-item class="pa-0">
                <v-list-item-icon>
                  <v-icon>mdi-video</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Meeting Link</v-list-item-title>
                  <v-list-item-subtitle>
                    <a :href="selectedSession.meetingLink" target="_blank" class="text-decoration-none">
                      {{ selectedSession.meetingLink }}
                    </a>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-chip 
                :color="getStatusColor(selectedSession.status)" 
                text-color="white" 
                small
              >
                {{ selectedSession.status.toUpperCase() }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-btn text @click="showSessionDetailsDialog = false">
            Close
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            v-if="selectedSession && ['booked', 'available'].includes(selectedSession.status)"
            color="error" 
            @click="confirmCancelSession"
            :loading="cancellingSession"
          >
            <v-icon class="mr-2">mdi-cancel</v-icon>
            Cancel Session
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Session Confirmation Dialog -->
    <v-dialog v-model="showCancelConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 error--text">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Cancel Session?
        </v-card-title>
        <v-card-text>
          Are you sure you want to cancel this session? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCancelConfirmDialog = false">
            Keep Session
          </v-btn>
          <v-btn color="error" @click="cancelSession" :loading="cancellingSession">
            Cancel Session
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import CalendarComponent from '@/components/CalendarComponent.vue'
import { useAuthStore } from '@/stores/auth'
import { useAvailabilityStore } from '@/stores/availability'
import { useSessionStore } from '@/stores/sessions'
import { useNotificationStore } from '@/stores/notifications'

export default {
  name: 'AvailabilityView',
  components: {
    CalendarComponent
  },
  setup() {
    const authStore = useAuthStore()
    const availabilityStore = useAvailabilityStore()
    const sessionStore = useSessionStore()
    const notificationStore = useNotificationStore()
    return {
      authStore,
      availabilityStore,
      sessionStore,
      notificationStore
    }
  },
  data() {
    return {
      showAddAvailabilityDialog: false,
      showSessionDetailsDialog: false,
      showCancelConfirmDialog: false,
      editingSlot: null,
      selectedSession: null,
      cancellingSession: false,
      formValid: false,
      availabilityForm: {
        dayOfWeek: '',
        startTime: '09:00',
        endTime: '10:00',
        isRecurring: true,
        specificDate: null
      },
      weeklyTemplate: [
        { name: 'Monday', key: 'monday', times: null, day: 1 },
        { name: 'Tuesday', key: 'tuesday', times: null, day: 2 },
        { name: 'Wednesday', key: 'wednesday', times: null, day: 3 },
        { name: 'Thursday', key: 'thursday', times: null, day: 4 },
        { name: 'Friday', key: 'friday', times: null, day: 5 },
        { name: 'Saturday', key: 'saturday', times: null, day: 6 },
        { name: 'Sunday', key: 'sunday', times: null, day: 0 }
      ],
      dayOptions: [
        { text: 'Monday', value: 'monday' },
        { text: 'Tuesday', value: 'tuesday' },
        { text: 'Wednesday', value: 'wednesday' },
        { text: 'Thursday', value: 'thursday' },
        { text: 'Friday', value: 'friday' },
        { text: 'Saturday', value: 'saturday' },
        { text: 'Sunday', value: 'sunday' }
      ]
    }
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0]
    },
    calendarEvents() {
      // Convert availability slots to calendar events
      const events = []
      
      if (!this.availabilityStore.availability || this.availabilityStore.availability.length === 0) {
        return events
      }
      
      // Get booked sessions for this tutor
      const bookedSessions = this.sessionStore && this.sessionStore.mySessions 
        ? this.sessionStore.mySessions(this.authStore.user._id, 'tutor') 
        : []
      
      this.availabilityStore.availability.forEach(slot => {
        if (slot.isRecurring && slot.dayOfWeek) {
          // For recurring slots, create events for the next 8 weeks only
          const today = new Date()
          const daysOfWeek = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
          }
          
          const targetDay = daysOfWeek[slot.dayOfWeek.toLowerCase()]
          if (targetDay === undefined) return // Skip invalid day names
          
          for (let week = 0; week < 8; week++) {
            const eventDate = new Date(today)
            const currentDay = eventDate.getDay()
            const daysToAdd = (targetDay - currentDay + 7) % 7 + (week * 7)
            eventDate.setDate(eventDate.getDate() + daysToAdd)
            
            const dateStr = eventDate.toISOString().split('T')[0]
            
            // Check if there's a booked session for this time slot
            const bookedSession = bookedSessions.find(session => {
              const sessionDate = new Date(session.date).toISOString().split('T')[0]
              return sessionDate === dateStr && 
                     session.startTime === slot.startTime && 
                     session.endTime === slot.endTime &&
                     ['booked', 'completed'].includes(session.status)
            })
            
            if (bookedSession) {
              // Create title with session title and student name
              const studentName = bookedSession.student?.name || 'Unknown Student'
              const sessionTitle = bookedSession.title || bookedSession.subject
              
              events.push({
                id: `booked-${bookedSession._id}`,
                title: `${sessionTitle} - ${studentName}`,
                date: dateStr,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: 'booked',
                isRecurring: true,
                originalSlot: slot,
                session: bookedSession
              })
            } else {
              events.push({
                id: `${slot._id}-${week}`,
                title: `Available (${this.formatDayOfWeek(slot.dayOfWeek)})`,
                date: dateStr,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: 'available',
                isRecurring: true,
                originalSlot: slot
              })
            }
          }
        } else if (slot.specificDate) {
          // For specific date slots, check if there's a booked session
          const bookedSession = bookedSessions.find(session => {
            const sessionDate = new Date(session.date).toISOString().split('T')[0]
            const slotDate = new Date(slot.specificDate).toISOString().split('T')[0]
            return sessionDate === slotDate && 
                   session.startTime === slot.startTime && 
                   session.endTime === slot.endTime &&
                   ['booked', 'completed'].includes(session.status)
          })
          
          if (bookedSession) {
            // Create title with session title and student name
            const studentName = bookedSession.student?.name || 'Unknown Student'
            const sessionTitle = bookedSession.title || bookedSession.subject
            
            events.push({
              id: `booked-${bookedSession._id}`,
              title: `${sessionTitle} - ${studentName}`,
              date: slot.specificDate,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: 'booked',
              isRecurring: false,
              originalSlot: slot,
              session: bookedSession
            })
          } else {
            events.push({
              id: slot._id,
              title: 'Available',
              date: slot.specificDate,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: 'available',
              isRecurring: false,
              originalSlot: slot
            })
          }
        }
      })
      
      return events
    },
    availableSlots() {
      return this.availabilityStore.availability || []
    },
    weeklySchedule() {
      // Get the next 7 days starting from tomorrow
      const today = new Date()
      const nextWeekDays = []
      
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        nextWeekDays.push({
          date: date,
          dateString: date.toISOString().split('T')[0],
          dayOfWeek: date.getDay(),
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          times: []
        })
      }
      
      // Add actual availability data for the next 7 days
      if (this.availabilityStore.availability) {
        this.availabilityStore.availability.forEach(slot => {
          if (slot.isRecurring && slot.dayOfWeek) {
            // For recurring availability, check if it matches any day in the next week
            const dayOfWeekMap = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
              'thursday': 4, 'friday': 5, 'saturday': 6
            }
            const slotDayNumber = dayOfWeekMap[slot.dayOfWeek.toLowerCase()]
            
            nextWeekDays.forEach(day => {
              if (day.dayOfWeek === slotDayNumber) {
                const timeSlot = `${slot.startTime} - ${slot.endTime}`
                if (!day.times.includes(timeSlot)) {
                  day.times.push(timeSlot)
                }
              }
            })
          } else if (!slot.isRecurring && slot.specificDate) {
            // For specific date availability, check if it's in the next 7 days
            const slotDate = new Date(slot.specificDate).toISOString().split('T')[0]
            const matchingDay = nextWeekDays.find(day => day.dateString === slotDate)
            
            if (matchingDay) {
              const timeSlot = `${slot.startTime} - ${slot.endTime}`
              if (!matchingDay.times.includes(timeSlot)) {
                matchingDay.times.push(timeSlot)
              }
            }
          }
        })
      }

      // Format the schedule for display
      const schedule = nextWeekDays.map(day => ({
        name: `${day.dayName} (${day.formattedDate})`,
        key: day.dayName.toLowerCase(),
        times: day.times.length > 0 ? day.times.join(', ') : 'Not available'
      }))
  
      return schedule
    }
  },
  methods: {
    openAddAvailabilityDialog() {
      this.editingSlot = null
      this.resetForm()
      this.showAddAvailabilityDialog = true
    },
    handleDateSelect(selectInfo) {
      // Handle calendar date selection for adding new availability
      const selectedDate = selectInfo.start.toISOString().split('T')[0]
      const startTime = selectInfo.start.toTimeString().slice(0, 5)
      const endTime = selectInfo.end ? selectInfo.end.toTimeString().slice(0, 5) : '10:00'
      
      this.availabilityForm.specificDate = selectedDate
      this.availabilityForm.startTime = startTime !== '00:00' ? startTime : '09:00'
      this.availabilityForm.endTime = endTime !== '00:00' ? endTime : '10:00'
      this.availabilityForm.isRecurring = false
      this.editingSlot = null
      this.showAddAvailabilityDialog = true
    },
    handleEventClick(clickInfo) {
      // Handle clicking on calendar events
      const eventData = clickInfo.data || clickInfo.event.extendedProps
      
      // If this is a booked session, show session details
      if (eventData.status === 'booked' && eventData.session) {
        this.selectedSession = eventData.session
        this.showSessionDetailsDialog = true
      } else if (eventData.originalSlot) {
        // If this is an available slot, edit the availability
        this.editSlot(eventData.originalSlot)
      }
    },
    handleEventDrop(dropInfo) {
      // Handle drag and drop of calendar events
      const slotId = dropInfo.event.id
      const slot = this.availableSlots.find(s => (s.id || s._id) == slotId)
      
      if (slot) {
        const newStart = new Date(dropInfo.event.start)
        const newEnd = new Date(dropInfo.event.end)
        
        slot.specificDate = newStart.toISOString().split('T')[0]
        slot.startTime = newStart.toTimeString().slice(0, 5)
        slot.endTime = newEnd.toTimeString().slice(0, 5)
        
        this.updateAvailabilitySlot(slot)
      }
    },
    handleEventResize(resizeInfo) {
      // Handle resizing of calendar events
      const slotId = resizeInfo.event.id
      const slot = this.availableSlots.find(s => (s.id || s._id) == slotId)
      
      if (slot) {
        const newEnd = new Date(resizeInfo.event.end)
        slot.endTime = newEnd.toTimeString().slice(0, 5)
        
        this.updateAvailabilitySlot(slot)
      }
    },
    async updateAvailabilitySlot(slot) {
      try {
        const success = await this.availabilityStore.updateAvailabilitySlot(slot._id, slot)
        if (success) {
          this.notificationStore.addNotification({
            title: 'Success',
            message: 'Availability updated successfully',
            type: 'success'
          })
        }
      } catch (error) {
        this.notificationStore.addNotification({
          title: 'Update Error',
          message: 'Could not update availability',
          type: 'error'
        })
      }
    },
    async saveAvailability() {
      try {
        const formData = { ...this.availabilityForm }
        let result
        
        if (this.editingSlot) {
          // Update existing slot
          result = await this.availabilityStore.updateAvailabilitySlot(this.editingSlot._id, formData)
        } else {
          // Create new slot
          result = await this.availabilityStore.createAvailabilitySlot(formData)
        }
        
        if (result && result.success) {
          this.notificationStore.addNotification({
            title: 'Success',
            message: this.editingSlot ? 'Availability updated successfully' : 'Availability created successfully',
            type: 'success'
          })
          this.showAddAvailabilityDialog = false
          this.resetForm()
        } else {
          this.notificationStore.addNotification({
            title: 'Error',
            message: (result && result.error) || 'Failed to save availability',
            type: 'error'
          })
        }
      } catch (error) {
        this.notificationStore.addNotification({
          title: 'Save Error',
          message: error.message || 'Could not save availability',
          type: 'error'
        })
      }
    },
    async deleteAvailability(slotId) {
      if (confirm('Are you sure you want to delete this availability slot?')) {
        try {
          const result = await this.availabilityStore.deleteAvailabilitySlot(slotId)
          if (result && result.success) {
            this.notificationStore.addNotification({
              title: 'Success',
              message: 'Availability deleted successfully',
              type: 'success'
            })
          } else {
            this.notificationStore.addNotification({
              title: 'Delete Error',
              message: (result && result.error) || 'Could not delete availability',
              type: 'error'
            })
          }
        } catch (error) {
          this.notificationStore.addNotification({
            title: 'Delete Error',
            message: error.message || 'Could not delete availability',
            type: 'error'
          })
        }
      }
    },
    editSlot(slot) {
      this.editingSlot = slot
      this.availabilityForm = {
        dayOfWeek: slot.dayOfWeek || '',
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring,
        specificDate: slot.specificDate || null
      }
      this.showAddAvailabilityDialog = true
    },
    resetForm() {
      this.editingSlot = null
      this.availabilityForm = {
        dayOfWeek: '',
        startTime: '09:00',
        endTime: '10:00',
        isRecurring: true,
        specificDate: null
      }
    },
    async loadAvailability() {
      try {
        await this.availabilityStore.fetchMyAvailability()
      } catch (error) {
        this.notificationStore.addNotification({
          title: 'Loading Error',
          message: 'Could not load your availability',
          type: 'error'
        })
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatDayOfWeek(dayOfWeek) {
      if (!dayOfWeek) return 'Unknown'
      
      const dayMap = {
        monday: 'Monday',
        tuesday: 'Tuesday', 
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      }
      return dayMap[dayOfWeek.toLowerCase()] || dayOfWeek
    },
    formatSessionDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    getStatusColor(status) {
      const colors = {
        available: 'success',
        booked: 'primary',
        completed: 'info',
        cancelled: 'error'
      }
      return colors[status] || 'grey'
    },
    confirmCancelSession() {
      this.showCancelConfirmDialog = true
    },
    async cancelSession() {
      if (!this.selectedSession) return
  
      this.cancellingSession = true
      try {
        const result = await this.sessionStore.cancelSession(this.selectedSession._id)
        if (result && result.success) {
          // Check if notification store has showSuccess method
          if (this.notificationStore.showSuccess) {
            this.notificationStore.showSuccess('Session cancelled successfully')
          } else {
            this.notificationStore.addNotification({
              title: 'Success',
              message: 'Session cancelled successfully',
              type: 'success'
            })
          }
          this.showCancelConfirmDialog = false
          this.showSessionDetailsDialog = false
          // Refresh sessions to update calendar
          await this.sessionStore.fetchSessions()
        } else {
          const errorMsg = (result && result.error) || 'Failed to cancel session'
          if (this.notificationStore.showError) {
            this.notificationStore.showError(errorMsg)
          } else {
            this.notificationStore.addNotification({
              title: 'Error',
              message: errorMsg,
              type: 'error'
            })
          }
        }
      } catch (error) {
        console.error('Cancel session error:', error)
        const errorMsg = 'An error occurred while cancelling the session'
        if (this.notificationStore.showError) {
          this.notificationStore.showError(errorMsg)
        } else {
          this.notificationStore.addNotification({
            title: 'Error',
            message: errorMsg,
            type: 'error'
          })
        }
      } finally {
        this.cancellingSession = false
      }
    }
  },
  async mounted() {
    try {
      // Set default date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      this.availabilityForm.specificDate = tomorrow.toISOString().split('T')[0]
      
      // Load tutor's current availability and sessions
      await this.loadAvailability()
      
      // Check if sessionStore has fetchSessions method before calling it
      if (this.sessionStore && this.sessionStore.fetchSessions) {
        await this.sessionStore.fetchSessions()
      }
    } catch (error) {
      console.error('Error during component mounting:', error)
      this.notificationStore.addNotification({
        title: 'Loading Error',
        message: 'Failed to load initial data',
        type: 'error'
      })
    }
  }
}
</script>

<style scoped>
.calendar-placeholder {
  text-align: center;
  padding: 60px 20px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.v-list-item--dense {
  min-height: 40px;
}

.availability-card-modern {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.18);
  margin-top: 32px;
}

.calendar-card-modern {
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}

.side-card-modern {
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}
/* Remove hover styles from availability cards */
.availability-card-modern:hover,
.calendar-card-modern:hover,
.side-card-modern:hover {
  box-shadow: none !important;
}
</style>