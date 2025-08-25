<template>
  <v-card
    class="action-card"
    elevation="2"
    @click="handleClick"
    style="cursor: pointer; transition: all 0.3s ease;"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Main Content -->
    <v-card-text class="pa-6 text-center d-flex flex-column align-center" style="min-height: 160px;">
      <!-- Icon -->
      <div 
        class="icon-wrapper mb-4" 
        :style="{
          width: '80px',
          height: '80px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #2c1a87 0%, #3486eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hover ? '0 8px 25px rgba(52,134,235,0.3)' : '0 4px 15px rgba(52,134,235,0.2)',
          transform: hover ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }"
      >
        <v-icon 
          :icon="icon" 
          size="32" 
          color="white"
        />
      </div>

      <!-- Text Content -->
      <div class="text-content flex-grow-1 d-flex flex-column justify-center">
        <h3 class="text-h6 mb-2 font-weight-medium" style="color: #1a202c;">
          {{ title }}
        </h3>
        <p v-if="description" class="text-body-2 mb-0" style="color: #4a5568;">
          {{ description }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'ActionCard',
  props: {
    icon: { 
      type: String, 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      default: '' 
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
  emits: ['click'],
  data() {
    return {
      hover: false
    }
  },
  methods: {
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.action-card {
  border-radius: 16px !important;
  border: 1px solid rgba(52,134,235,0.12) !important;
  transition: all 0.3s ease !important;
}

.action-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 40px rgba(52,134,235,0.15) !important;
  border-color: rgba(52,134,235,0.2) !important;
}
</style>
