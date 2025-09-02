<template>
  <v-card class="stat-card" elevation="2">
    <v-card-text class="pa-6">
      <!-- Header with Icon -->
      <div class="d-flex justify-space-between align-start mb-4">
        <div class="icon-wrapper">
          <v-icon :icon="icon" size="24" color="primary" />
        </div>
        <div v-if="trend" class="trend-chip">
          <v-icon 
            :icon="trend.type === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'" 
            size="16"
            :color="trend.type === 'up' ? 'success' : 'error'"
          />
          <span>{{ trend.value }}</span>
        </div>
      </div>

      <!-- Main Stats -->
      <div class="stats-content">
        <div class="d-flex align-baseline mb-2">
          <span class="text-h4 font-weight-bold">{{ formattedValue }}</span>
          <span v-if="suffix" class="text-body-2 ml-2 text-medium-emphasis">{{ suffix }}</span>
        </div>
        <div class="text-caption font-weight-medium text-uppercase mb-2 text-medium-emphasis">{{ label }}</div>
        <div v-if="subtitle" class="text-body-2 text-medium-emphasis">{{ subtitle }}</div>
      </div>

      <!-- Progress bar if provided -->
      <v-progress-linear
        v-if="progress !== null"
        :model-value="progress"
        :color="progressColor"
        height="4"
        rounded
        class="mt-4"
      />

      <!-- Loading overlay -->
      <v-overlay v-if="loading" contained>
        <v-progress-circular indeterminate color="primary" size="32" />
      </v-overlay>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    suffix: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    trend: { type: Object, default: null },
    progress: { type: Number, default: null },
    progressColor: { type: String, default: 'primary' }
  },
  computed: {
    formattedValue() {
      return typeof this.value === 'number' ? this.value.toLocaleString() : this.value
    }
  }
}
</script>

<style scoped>
.stat-card {
  transition: all var(--transition-normal) !important;
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-lg) !important;
}

.stat-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-primary) !important;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-gradient-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
}

.trend-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--color-gradient-soft);
  border: 1px solid var(--color-border);
}
</style>
