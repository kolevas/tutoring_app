<template>
  <v-card elevation="2" class="tutor-search">
    <v-card-title class="primary white--text">
      <v-icon class="mr-2">mdi-account-search</v-icon>
      Find Your Perfect Tutor
    </v-card-title>
    
    <v-card-text class="pt-4">
      <v-row>
        <!-- Search Input -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            label="Search tutors by name or subject"
            prepend-inner-icon="mdi-magnify"
            outlined
            dense
            clearable
            @input="performSearch"
          ></v-text-field>
        </v-col>
        
        <!-- Subject Filter -->
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedSubject"
            :items="availableSubjects"
            label="Subject"
            outlined
            dense
            clearable
            prepend-inner-icon="mdi-book"
            @change="performSearch"
          ></v-select>
        </v-col>
        
        <!-- Availability Filter -->
        <v-col cols="12" md="3">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="selectedDate"
                label="Available on date"
                prepend-inner-icon="mdi-calendar"
                readonly
                outlined
                dense
                clearable
                v-bind="attrs"
                v-on="on"
                @click:clear="clearDate"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="selectedDate"
              :min="new Date().toISOString().split('T')[0]"
              @change="dateMenu = false; performSearch()"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      
      <!-- Advanced Filters -->
      <v-expansion-panels v-model="advancedPanel" flat>
        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon class="mr-2">mdi-filter-variant</v-icon>
            Advanced Filters
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedExperience"
                  :items="experienceLevels"
                  item-title="text"
                  item-value="value"
                  label="Experience Level"
                  outlined
                  dense
                  clearable
                  @change="performSearch"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedRating"
                  :items="ratingOptions"
                  item-title="text"
                  item-value="value"
                  label="Minimum Rating"
                  outlined
                  dense
                  clearable
                  @change="performSearch"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedTimeRange"
                  :items="timeRanges"
                  item-title="text"
                  item-value="value"
                  label="Preferred Time"
                  outlined
                  dense
                  clearable
                  @change="performSearch"
                ></v-select>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    
    <!-- Search Results Summary -->
    <v-card-actions v-if="searchPerformed">
      <v-chip
        :color="filteredTutors.length > 0 ? 'success' : 'warning'"
        small
        text-color="white"
      >
        <v-icon left small>mdi-account-group</v-icon>
        {{ filteredTutors.length }} tutor{{ filteredTutors.length !== 1 ? 's' : '' }} found
      </v-chip>
      
      <v-spacer></v-spacer>
      
      <v-btn
        text
        small
        color="primary"
        @click="clearAllFilters"
        v-if="hasActiveFilters"
      >
        <v-icon left small>mdi-filter-remove</v-icon>
        Clear Filters
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'TutorSearchComponent',
  props: {
    tutors: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      searchQuery: '',
      selectedSubject: null,
      selectedDate: null,
      selectedExperience: null,
      selectedRating: null,
      selectedTimeRange: null,
      dateMenu: false,
      advancedPanel: null,
      searchPerformed: false,
      
      experienceLevels: [
        { text: 'Beginner (0-1 year)', value: 'beginner' },
        { text: 'Intermediate (1-3 years)', value: 'intermediate' },
        { text: 'Advanced (3-5 years)', value: 'advanced' },
        { text: 'Expert (5+ years)', value: 'expert' }
      ],
      
      ratingOptions: [
        { text: '4+ stars', value: 4 },
        { text: '3+ stars', value: 3 },
        { text: '2+ stars', value: 2 },
        { text: '1+ stars', value: 1 }
      ],
      
      timeRanges: [
        { text: 'Morning (8AM - 12PM)', value: 'morning' },
        { text: 'Afternoon (12PM - 5PM)', value: 'afternoon' },
        { text: 'Evening (5PM - 9PM)', value: 'evening' },
        { text: 'Night (9PM - 11PM)', value: 'night' }
      ]
    }
  },
  
  computed: {
    availableSubjects() {
      const subjects = new Set()
      this.tutors.forEach(tutor => {
        if (tutor.subjects && Array.isArray(tutor.subjects)) {
          tutor.subjects.forEach(subject => subjects.add(subject))
        }
      })
      return Array.from(subjects).sort()
    },
    
    filteredTutors() {
      let filtered = [...this.tutors]
      
      // Text search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(tutor =>
          tutor.name.toLowerCase().includes(query) ||
          (tutor.bio && tutor.bio.toLowerCase().includes(query)) ||
          (tutor.subjects && tutor.subjects.some(subject =>
            subject.toLowerCase().includes(query)
          ))
        )
      }
      
      // Subject filter
      if (this.selectedSubject) {
        filtered = filtered.filter(tutor =>
          tutor.subjects && tutor.subjects.includes(this.selectedSubject)
        )
      }
      
      // Date availability filter
      if (this.selectedDate) {
        // This would need to be implemented with actual session data
        // For now, we'll just return all tutors
      }
      
      // Experience filter
      if (this.selectedExperience) {
        filtered = filtered.filter(tutor =>
          tutor.experienceLevel === this.selectedExperience
        )
      }
      
      // Rating filter
      if (this.selectedRating) {
        filtered = filtered.filter(tutor =>
          (tutor.rating || 0) >= this.selectedRating
        )
      }
      
      // Time range filter
      if (this.selectedTimeRange) {
        // This would need to be implemented with actual availability data
        // For now, we'll just return all tutors
      }
      
      return filtered
    },
    
    hasActiveFilters() {
      return !!(
        this.searchQuery ||
        this.selectedSubject ||
        this.selectedDate ||
        this.selectedExperience ||
        this.selectedRating ||
        this.selectedTimeRange
      )
    }
  },
  
  methods: {
    performSearch() {
      this.searchPerformed = true
      this.$emit('search-results', this.filteredTutors)
    },
    
    clearDate() {
      this.selectedDate = null
      this.performSearch()
    },
    
    clearAllFilters() {
      this.searchQuery = ''
      this.selectedSubject = null
      this.selectedDate = null
      this.selectedExperience = null
      this.selectedRating = null
      this.selectedTimeRange = null
      this.searchPerformed = false
      this.$emit('search-results', this.tutors)
    }
  },
  
  watch: {
    tutors: {
      handler() {
        if (this.searchPerformed) {
          this.performSearch()
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.tutor-search {
  margin-bottom: 20px;
}

:deep(.v-expansion-panel-content__wrap) {
  padding: 0 16px 16px;
}

:deep(.v-expansion-panel-header) {
  min-height: 48px;
  padding: 0 16px;
}
</style>
