<template>
  <div class="calendar-wrapper">
    <FullCalendar
      ref="calendar"
      :options="calendarOptions"
    />
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default {
  name: 'CalendarComponent',
  components: {
    FullCalendar
  },
  props: {
    events: {
      type: Array,
      default: () => []
    },
    view: {
      type: String,
      default: 'dayGridMonth'
    },
    selectable: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    calendarOptions() {
      return {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: this.view,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: this.formattedEvents,
        selectable: this.selectable,
        selectMirror: true,
        editable: this.editable,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventDrop: this.handleEventDrop,
        eventResize: this.handleEventResize,
        height: 'auto',
        contentHeight: 650,
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        slotDuration: '00:30:00',
        businessHours: {
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days
          startTime: '08:00',
          endTime: '22:00',
        },
        // Calendar styling
        firstDay: 1, // Start week on Monday
        fixedWeekCount: false,
        showNonCurrentDates: false,
        dayHeaderFormat: { weekday: 'short' },
        eventDisplay: 'block',
        displayEventTime: true,
        displayEventEnd: false,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      }
    },
    formattedEvents() {
      return this.events.map(event => {
        let startDateTime, endDateTime
        
        if (event.date && event.startTime && event.endTime) {
          // Format availability slots
          startDateTime = this.formatDateTime(event.date, event.startTime)
          endDateTime = this.formatDateTime(event.date, event.endTime)
        } else if (event.start && event.end) {
          // Format session events
          startDateTime = event.start
          endDateTime = event.end
        } else {
          return null
        }
        
        return {
          id: event.id || event._id,
          title: event.title || `${event.subject || 'Session'}`,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: this.getEventColor(event.status),
          borderColor: this.getEventColor(event.status),
          textColor: 'white',
          extendedProps: {
            ...event,
            tutor: event.tutor,
            student: event.student,
            subject: event.subject,
            description: event.description,
            isRecurring: event.isRecurring
          }
        }
      }).filter(event => event !== null)
    }
  },
  methods: {
    formatDateTime(date, time) {
      const dateObj = new Date(date)
      const [hours, minutes] = time.split(':')
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      return dateObj.toISOString()
    },
    
    getEventColor(status) {
      const colors = {
        available: '#4CAF50',    // Green
        booked: '#2196F3',       // Blue
        passed: '#9E9E9E'        // Grey
      }
      return colors[status] || '#9E9E9E'
    },
    
    handleDateSelect(selectInfo) {
      this.$emit('date-select', {
        start: selectInfo.start,
        end: selectInfo.end,
        allDay: selectInfo.allDay
      })
    },
    
    handleEventClick(clickInfo) {
      this.$emit('event-click', {
        event: clickInfo.event,
        data: clickInfo.event.extendedProps
      })
    },
    
    handleEventDrop(dropInfo) {
      this.$emit('event-drop', {
        event: dropInfo.event,
        data: dropInfo.event.extendedProps,
        delta: dropInfo.delta
      })
    },
    
    handleEventResize(resizeInfo) {
      this.$emit('event-resize', {
        event: resizeInfo.event,
        data: resizeInfo.event.extendedProps,
        endDelta: resizeInfo.endDelta
      })
    },
    
    // Public methods
    getCalendarApi() {
      return this.$refs.calendar.getApi()
    },
    
    refetchEvents() {
      this.getCalendarApi().refetchEvents()
    },
    
    addEvent(event) {
      this.getCalendarApi().addEvent(event)
    },
    
    removeEvent(eventId) {
      const event = this.getCalendarApi().getEventById(eventId)
      if (event) {
        event.remove()
      }
    }
  }
}
</script>

<style scoped>
.calendar-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

:deep(.fc) {
  font-family: 'Roboto', sans-serif;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 1.5rem;
  padding: 0.5rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1976D2;
}

:deep(.fc-button-primary) {
  background-color: #1976D2;
  border-color: #1976D2;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-weight: 500;
}

:deep(.fc-button-primary:hover) {
  background-color: #1565C0;
  border-color: #1565C0;
}

:deep(.fc-button-primary:disabled) {
  background-color: #e0e0e0;
  border-color: #e0e0e0;
  color: #9e9e9e;
}

/* Day grid (month view) styling */
:deep(.fc-daygrid-day) {
  border: 1px solid #e0e0e0;
  min-height: 120px;
}

:deep(.fc-daygrid-day:hover) {
  background-color: #f5f5f5;
}

:deep(.fc-daygrid-day-number) {
  font-weight: 600;
  color: #424242;
  padding: 8px;
}

:deep(.fc-day-today) {
  background-color: #e3f2fd !important;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  background-color: #1976D2;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
}

/* Event styling */
:deep(.fc-event) {
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  margin: 2px;
  padding: 2px 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.fc-event:hover) {
  opacity: 0.8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

:deep(.fc-event-title) {
  font-weight: 500;
}

:deep(.fc-event-time) {
  font-weight: 600;
}

:deep(.fc-daygrid-event-dot) {
  display: none;
}

/* Week and day view styling */
:deep(.fc-timegrid-slot-label) {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
}

:deep(.fc-timegrid-axis) {
  border-right: 2px solid #e0e0e0;
}

:deep(.fc-timegrid-divider) {
  border-bottom: 2px solid #e0e0e0;
}

:deep(.fc-timegrid-slot) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.fc-timegrid-slot:nth-child(even)) {
  background-color: #fafafa;
}

/* Header styling */
:deep(.fc-col-header-cell) {
  background-color: #f5f5f5;
  border-bottom: 2px solid #1976D2;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 10px 8px;
  color: #424242;
}

/* Selection styling */
:deep(.fc-highlight) {
  background-color: #bbdefb;
  opacity: 0.3;
}

/* Scrollbar styling for time views */
:deep(.fc-scroller) {
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

:deep(.fc-scroller::-webkit-scrollbar) {
  width: 6px;
}

:deep(.fc-scroller::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.fc-scroller::-webkit-scrollbar-thumb) {
  background-color: #ccc;
  border-radius: 3px;
}

:deep(.fc-scroller::-webkit-scrollbar-thumb:hover) {
  background-color: #999;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .calendar-wrapper {
    padding: 12px;
  }
  
  :deep(.fc-header-toolbar) {
    flex-direction: column;
    gap: 10px;
  }
  
  :deep(.fc-toolbar-title) {
    font-size: 1.2rem;
  }
  
  :deep(.fc-button-group) {
    flex-wrap: wrap;
  }
  
  :deep(.fc-daygrid-day) {
    min-height: 80px;
  }
}
</style>
