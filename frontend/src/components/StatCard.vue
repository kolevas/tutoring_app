<template>
  <v-card 
    class="stat-card"
    elevation="2"
    style="border-radius: 16px; border: 1px solid rgba(52,134,235,0.12); transition: all 0.3s ease;"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Content -->
    <v-card-text class="pa-6">
      <!-- Header with Icon -->
      <div class="d-flex justify-space-between align-start mb-4">
        <div 
          class="icon-wrapper"
          :style="{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: variant === 'primary' ? 'linear-gradient(135deg, rgba(52,134,235,0.1) 0%, rgba(44,26,135,0.08) 100%)' : 
                        variant === 'success' ? 'rgba(72, 187, 120, 0.1)' : 
                        variant === 'info' ? 'rgba(66, 153, 225, 0.1)' : 
                        'rgba(128, 90, 213, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(52,134,235,0.12)',
            transition: 'all 0.3s ease',
            transform: hover ? 'scale(1.05)' : 'scale(1)'
          }"
        >
          <v-icon 
            :icon="icon" 
            size="24" 
            :color="variant === 'primary' ? 'primary' : 
                   variant === 'success' ? 'success' : 
                   variant === 'info' ? 'info' : 
                   'secondary'"
          />
        </div>
        <div v-if="trend" class="trend-chip" :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '500',
          background: trend.type === 'up' ? 'rgba(72, 187, 120, 0.1)' : 
                      trend.type === 'down' ? 'rgba(245, 101, 101, 0.1)' : 
                      'rgba(160, 174, 192, 0.1)',
          color: trend.type === 'up' ? '#48bb78' : 
                 trend.type === 'down' ? '#f56565' : 
                 '#4a5568',
          border: '1px solid',
          borderColor: trend.type === 'up' ? 'rgba(72, 187, 120, 0.2)' : 
                       trend.type === 'down' ? 'rgba(245, 101, 101, 0.2)' : 
                       'rgba(160, 174, 192, 0.2)'
        }">
          <v-icon 
            :icon="trend.type === 'up' ? 'mdi-trending-up' : 
                   trend.type === 'down' ? 'mdi-trending-down' : 
                   'mdi-trending-neutral'" 
            size="16"
          />
          <span>{{ trend.value }}</span>
        </div>
      </div>

      <!-- Main Stats -->
      <div class="stats-content">
        <div class="d-flex align-baseline mb-2" style="gap: 8px;">
          <span class="text-h4 font-weight-bold" style="color: #1a202c; line-height: 1;">
            {{ formattedValue }}
          </span>
          <span v-if="suffix" class="text-body-2" style="color: #4a5568; font-weight: 500;">
            {{ suffix }}
          </span>
        </div>
        <div class="text-caption font-weight-medium text-uppercase" style="color: #4a5568; letter-spacing: 0.05em; margin-bottom: 4px;">
          {{ label }}
        </div>
        <div v-if="subtitle" class="text-caption" style="color: #718096; line-height: 1.4;">
          {{ subtitle }}
        </div>
      </div>

      <!-- Progress Bar (optional) -->
      <div v-if="progress !== null" class="d-flex align-center mt-4" style="gap: 12px;">
        <v-progress-linear
          :model-value="progress"
          :color="progressColor"
          height="6"
          rounded
          style="flex: 1;"
        />
        <span class="text-caption font-weight-semibold" style="color: #4a5568; white-space: nowrap;">
          {{ progress }}%
        </span>
      </div>
    </v-card-text>

    <!-- Loading Overlay -->
    <div v-if="loading" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); z-index: 2;">
      <v-progress-circular
        indeterminate
        color="primary"
        size="32"
      />
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    icon: { 
      type: String, 
      required: true 
    },
    label: { 
      type: String, 
      required: true 
    },
    value: { 
      type: [String, Number], 
      required: true 
    },
    suffix: { 
      type: String, 
      default: '' 
    },
    subtitle: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    trend: {
      type: Object,
      default: null
    },
    progress: {
      type: Number,
      default: null
    },
    progressColor: {
      type: String,
      default: 'primary'
    },
    animation: {
      type: String,
      default: 'fade-up'
    },
    animationDelay: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      hover: false
    }
  },
  computed: {
    formattedValue() {
      if (typeof this.value === 'number') {
        return this.value.toLocaleString()
      }
      return this.value
    }
  }
}
</script>

<style scoped>
.stat-card {
  position: relative;
  transition: all 0.3s ease !important;
}

.stat-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 40px rgba(52,134,235,0.15) !important;
  border-color: rgba(52,134,235,0.2) !important;
}
</style>
