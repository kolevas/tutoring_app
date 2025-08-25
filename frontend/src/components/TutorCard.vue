<template>
  <v-card elevation="3" class="tutor-card" :class="{ 'tutor-card--featured': tutor.featured }">
    <!-- Header with Avatar and Basic Info -->
    <v-card-title class="pb-2">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-avatar size="60" color="primary">
            <v-img
              v-if="tutor.avatar"
              :src="tutor.avatar"
              :alt="tutor.name"
            ></v-img>
            <span v-else class="white--text headline">
              {{ getInitials(tutor.name) }}
            </span>
          </v-avatar>
        </v-col>
        <v-col class="ml-3">
          <div class="text-h6 font-weight-bold">{{ tutor.name }}</div>
          <div class="text-subtitle-2 grey--text">
            <v-icon small color="grey">mdi-school</v-icon>
            {{ formatExperience(tutor.experienceLevel) }}
          </div>
          <div v-if="tutor.studentIndex" class="text-caption grey--text">
            <v-icon small color="grey">mdi-card-account-details</v-icon>
            Индекс: {{ tutor.studentIndex }}
          </div>
          <div v-if="tutor.email" class="text-caption grey--text">
            <v-icon small color="grey">mdi-email</v-icon>
            {{ tutor.email }}
          </div>
          <div v-if="tutor.rating" class="d-flex align-center">
            <v-rating
              :value="tutor.rating"
              color="amber"
              dense
              half-increments
              readonly
              size="16"
            ></v-rating>
            <span class="ml-1 text-caption">
              ({{ tutor.rating }}) · {{ tutor.reviewCount || 0 }} reviews
            </span>
          </div>
        </v-col>
        <v-col cols="auto">
          <v-chip
            :color="getStatusColor(tutor.status)"
            small
            text-color="white"
          >
            <v-icon left small>{{ getStatusIcon(tutor.status) }}</v-icon>
            {{ tutor.status || 'Available' }}
          </v-chip>
        </v-col>
      </v-row>
    </v-card-title>

    <!-- Subjects -->
    <v-card-subtitle v-if="tutor.subjects && tutor.subjects.length > 0" class="pt-0">
      <div class="d-flex flex-wrap gap-1">
        <v-chip
          v-for="subject in tutor.subjects.slice(0, 3)"
          :key="subject"
          x-small
          outlined
          color="primary"
        >
          {{ subject }}
        </v-chip>
        <v-chip
          v-if="tutor.subjects.length > 3"
          x-small
          color="grey"
          text-color="white"
        >
          +{{ tutor.subjects.length - 3 }} more
        </v-chip>
      </div>
    </v-card-subtitle>

    <!-- Bio -->
    <v-card-text v-if="tutor.bio" class="py-2">
      <p class="text-body-2 mb-0">
        {{ truncateBio(tutor.bio) }}
        <v-btn
          v-if="tutor.bio.length > 120"
          text
          x-small
          color="primary"
          @click="showFullBio = !showFullBio"
        >
          {{ showFullBio ? 'Show Less' : 'Read More' }}
        </v-btn>
      </p>
    </v-card-text>

    <!-- Availability Preview -->
    <v-card-text v-if="upcomingSlots.length > 0" class="py-2">
      <div class="text-subtitle-2 font-weight-medium mb-2">
        <v-icon small class="mr-1">mdi-calendar-clock</v-icon>
        Next Available
      </div>
      <div class="d-flex flex-wrap gap-1">
        <v-chip
          v-for="slot in upcomingSlots.slice(0, 2)"
          :key="slot.id"
          small
          outlined
          color="success"
        >
          <v-icon left x-small>mdi-clock-outline</v-icon>
          {{ formatSlot(slot) }}
        </v-chip>
      </div>
    </v-card-text>

    <!-- Action Buttons -->
    <v-card-actions>
      <v-btn
        color="primary"
        outlined
        small
        @click="viewProfile"
      >
        <v-icon left small>mdi-account</v-icon>
        View Profile
      </v-btn>
      
      <v-btn
        color="success"
        small
        @click="bookSession"
        :disabled="!hasAvailableSlots"
      >
        <v-icon left small>mdi-calendar-plus</v-icon>
        Book Session
      </v-btn>

      <v-spacer></v-spacer>

      <!-- Favorite Button (for students) -->
      <v-btn
        icon
        small
        @click="toggleFavorite"
        :color="isFavorite ? 'red' : 'grey'"
      >
        <v-icon small>{{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
      </v-btn>
    </v-card-actions>

    <!-- Featured Badge -->
    <v-chip
      v-if="tutor.featured"
      color="accent"
      text-color="white"
      small
      class="featured-badge"
    >
      <v-icon left small>mdi-star</v-icon>
      Featured
    </v-chip>
  </v-card>
</template>

<script>
export default {
  name: 'TutorCard',
  props: {
    tutor: {
      type: Object,
      required: true
    },
    availableSlots: {
      type: Array,
      default: () => []
    },
    favorites: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      showFullBio: false
    }
  },
  
  computed: {
    upcomingSlots() {
      // Show next available slots for this tutor
      return this.availableSlots
        .filter(slot => 
          slot.tutor._id === this.tutor._id && 
          slot.status === 'available' &&
          new Date(slot.date) >= new Date()
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
    },
    
    hasAvailableSlots() {
      return this.upcomingSlots.length > 0
    },
    
    isFavorite() {
      return this.favorites.includes(this.tutor._id)
    }
  },
  
  methods: {
    getInitials(name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    
    formatExperience(level) {
      const levels = {
        beginner: 'Beginner Tutor',
        intermediate: 'Intermediate Tutor',
        advanced: 'Advanced Tutor',
        expert: 'Expert Tutor'
      }
      return levels[level] || 'Tutor'
    },
    
    getStatusColor(status) {
      const colors = {
        available: 'success',
        busy: 'warning',
        offline: 'grey'
      }
      return colors[status] || 'success'
    },
    
    getStatusIcon(status) {
      const icons = {
        available: 'mdi-check-circle',
        busy: 'mdi-clock',
        offline: 'mdi-circle'
      }
      return icons[status] || 'mdi-check-circle'
    },
    
    truncateBio(bio) {
      if (this.showFullBio || bio.length <= 120) {
        return bio
      }
      return bio.substring(0, 120) + '...'
    },
    
    formatSlot(slot) {
      const date = new Date(slot.date)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      let dateStr = ''
      if (date.toDateString() === today.toDateString()) {
        dateStr = 'Today'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        dateStr = 'Tomorrow'
      } else {
        dateStr = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
      
      return `${dateStr} ${slot.startTime}`
    },
    
    viewProfile() {
      this.$emit('view-profile', this.tutor)
    },
    
    bookSession() {
      this.$emit('book-session', this.tutor)
    },
    
    toggleFavorite() {
      this.$emit('toggle-favorite', this.tutor._id)
    }
  }
}
</script>

<style scoped>
.tutor-card {
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 16px;
}

.tutor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
}

.tutor-card--featured {
  border: 2px solid #FF4081;
}

.featured-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.gap-1 > * {
  margin-right: 4px;
  margin-bottom: 4px;
}

:deep(.v-card__title) {
  word-break: normal;
}

:deep(.v-rating .v-icon) {
  padding: 0;
}
</style>
