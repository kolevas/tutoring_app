<template>
  <v-card class="action-card" elevation="2" @click="handleClick">
    <v-card-text class="pa-6 text-center d-flex flex-column align-center">
      <!-- Icon -->
      <div class="icon-wrapper mb-4">
        <v-icon :icon="icon" size="32" color="white" />
      </div>

      <!-- Text Content -->
      <div class="text-content">
        <h3 class="text-h6 mb-2 font-weight-medium">{{ title }}</h3>
        <p v-if="description" class="text-body-2 mb-0 text-medium-emphasis">{{ description }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'ActionCard',
  props: {
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' }
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.action-card {
  cursor: pointer;
  transition: all var(--transition-normal) !important;
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-lg) !important;
}

.action-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-primary) !important;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}
</style>
