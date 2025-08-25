<template>
  <v-card 
    class="session-card" 
    :class="[
      `session-card--${session.status}`,
      { 'session-card--booking': booking },
      animationClass
    ]"
    elevation="0" 
    @click="handleSelect" 
    @keyup.enter="handleSelect"
    tabindex="0" 
    role="button"
    :aria-label="`${session.subject} session with ${session.tutor?.name} on ${dateLabel}`"
  >
    <!-- Background Pattern -->
    <div class="session-card__background">
      <div class="session-card__pattern" />
    </div>

    <!-- Header -->
    <div class="session-card__header">
      <div class="session-card__subject-area">
        <h3 class="session-card__subject">{{ session.subject }}</h3>
        <div class="session-card__meta">
          <div class="session-card__meta-item">
            <v-icon size="14" class="session-card__meta-icon">mdi-calendar</v-icon>
            <span>{{ dateLabel }}</span>
          </div>
          <div class="session-card__meta-separator" />
          <div class="session-card__meta-item">
            <v-icon size="14" class="session-card__meta-icon">mdi-clock-outline</v-icon>
            <span>{{ timeLabel }}</span>
          </div>
        </div>
      </div>
      
      <!-- Level Badge -->
      <v-chip 
        v-if="session.level" 
        size="small" 
        class="session-card__level" 
        color="primary" 
        variant="elevated"
      >
        {{ session.level }}
      </v-chip>
    </div>

    <!-- Tutor Info -->
    <div class="session-card__tutor">
      <v-avatar size="32" class="session-card__avatar">
        <v-img 
          v-if="session.tutor?.avatar" 
          :src="session.tutor.avatar" 
          :alt="session.tutor.name"
        />
        <v-icon v-else size="18" color="white">mdi-account</v-icon>
      </v-avatar>
      <div class="session-card__tutor-info">
        <span class="session-card__tutor-name">{{ session.tutor?.name || 'Unknown Tutor' }}</span>
        <div v-if="session.tutor?.rating" class="session-card__rating">
          <v-icon size="12" color="warning">mdi-star</v-icon>
          <span>{{ session.tutor.rating }}</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p class="session-card__description">
      {{ descriptionPreview }}
    </p>

    <!-- Tags/Skills -->
    <div v-if="session.tags && session.tags.length" class="session-card__tags">
      <v-chip
        v-for="tag in session.tags.slice(0, 3)"
        :key="tag"
        size="x-small"
        variant="outlined"
        class="session-card__tag"
      >
        {{ tag }}
      </v-chip>
      <span v-if="session.tags.length > 3" class="session-card__more-tags">
        +{{ session.tags.length - 3 }} more
      </span>
    </div>

    <!-- Footer -->
    <div class="session-card__footer">
      <div class="session-card__status-area">
        <v-chip 
          size="small" 
          :color="statusColor" 
          :variant="statusVariant"
          class="session-card__status"
        >
          <v-icon :icon="statusIcon" size="12" start />
          {{ statusLabel }}
        </v-chip>
        <span v-if="session.price" class="session-card__price">
          ${{ session.price }}
        </span>
      </div>
      
      <v-btn 
        size="small" 
        :color="actionButtonColor"
        :variant="actionButtonVariant"
        class="session-card__action"
        :disabled="!canPerformAction"
        :loading="booking"
        @click.stop="handleAction"
      >
        <v-icon :icon="actionIcon" size="16" start />
        {{ actionLabel }}
      </v-btn>
    </div>

    <!-- Loading Overlay -->
    <div v-if="booking" class="session-card__loading">
      <v-progress-circular
        indeterminate
        color="primary"
        size="24"
      />
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'SessionCard',
  props: {
    session: { 
      type: Object, 
      required: true 
    },
    booking: { 
      type: Boolean, 
      default: false 
    },
    userRole: {
      type: String,
      default: 'student'
    },
    animation: {
      type: String,
      default: 'fade-up',
      validator: (value) => ['none', 'fade-up', 'slide-left', 'scale'].includes(value)
    },
    animationDelay: {
      type: Number,
      default: 0
    }
  },
  emits: ['select', 'book', 'edit', 'cancel'],
  computed: {
    dateLabel() { 
      return new Date(this.session.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: new Date(this.session.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })
    },
    timeLabel() {
      return `${this.session.startTime}-${this.session.endTime}`
    },
    descriptionPreview() { 
      const desc = this.session.description || 'No description provided.'
      return desc.length > 120 ? desc.substring(0, 120) + '...' : desc
    },
    statusColor() {
      switch(this.session.status) {
        case 'available': return 'success'
        case 'booked': return 'warning'
        case 'completed': return 'info'
        case 'cancelled': return 'error'
        case 'in-progress': return 'primary'
        default: return 'grey'
      }
    },
    statusVariant() {
      return this.session.status === 'available' ? 'outlined' : 'elevated'
    },
    statusIcon() {
      switch(this.session.status) {
        case 'available': return 'mdi-check-circle-outline'
        case 'booked': return 'mdi-calendar-check'
        case 'completed': return 'mdi-check-circle'
        case 'cancelled': return 'mdi-cancel'
        case 'in-progress': return 'mdi-play-circle'
        default: return 'mdi-help-circle-outline'
      }
    },
    statusLabel() {
      switch(this.session.status) {
        case 'available': return 'Available'
        case 'booked': return 'Booked'
        case 'completed': return 'Completed'
        case 'cancelled': return 'Cancelled'
        case 'in-progress': return 'In Progress'
        default: return this.session.status
      }
    },
    canPerformAction() {
      if (this.booking) return false
      
      switch(this.userRole) {
        case 'student':
          return this.session.status === 'available'
        case 'tutor':
          return ['available', 'booked'].includes(this.session.status)
        case 'admin':
          return true
        default:
          return false
      }
    },
    actionLabel() {
      if (this.userRole === 'tutor') {
        return this.session.status === 'available' ? 'Edit' : 'Manage'
      }
      return this.session.status === 'available' ? 'Book' : 'View'
    },
    actionIcon() {
      if (this.userRole === 'tutor') {
        return this.session.status === 'available' ? 'mdi-pencil' : 'mdi-cog'
      }
      return this.session.status === 'available' ? 'mdi-calendar-plus' : 'mdi-eye'
    },
    actionButtonColor() {
      if (this.session.status === 'available') return 'primary'
      return 'secondary'
    },
    actionButtonVariant() {
      return this.session.status === 'available' ? 'elevated' : 'outlined'
    },
    animationClass() {
      return this.animation !== 'none' ? `session-card--anim-${this.animation}` : ''
    }
  },
  methods: {
    handleSelect(event) {
      if (!this.booking) {
        this.$emit('select', this.session, event)
      }
    },
    handleAction(event) {
      if (this.booking || !this.canPerformAction) return
      
      if (this.userRole === 'tutor') {
        this.$emit('edit', this.session, event)
      } else if (this.session.status === 'available') {
        this.$emit('book', this.session, event)
      } else {
        this.$emit('select', this.session, event)
      }
    }
  },
  mounted() {
    if (this.animation !== 'none' && this.animationDelay > 0) {
      this.$el.style.animationDelay = `${this.animationDelay}ms`
    }
  }
}
</script>

<style scoped>
.session-card {
  position: relative;
  border-radius: var(--radius-xl) !important;
  background: var(--color-surface-elevated) !important;
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.session-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border);
}

.session-card:active {
  transform: translateY(-2px);
}

/* Background Pattern */
.session-card__background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.02;
  pointer-events: none;
  transition: opacity var(--transition-normal);
}

.session-card:hover .session-card__background {
  opacity: 0.04;
}

.session-card__pattern {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0);
  background-size: 16px 16px;
}

/* Status Variants */
.session-card--available .session-card__background {
  background: var(--color-success);
}

.session-card--booked .session-card__background {
  background: var(--color-warning);
}

.session-card--completed .session-card__background {
  background: var(--color-info);
}

.session-card--cancelled .session-card__background {
  background: var(--color-error);
}

/* Header */
.session-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) 0;
}

.session-card__subject-area {
  flex: 1;
  min-width: 0;
}

.session-card__subject {
  font-size: 1.1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.session-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.session-card__meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.session-card__meta-icon {
  color: var(--color-text-muted);
}

.session-card__meta-separator {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-muted);
  opacity: 0.5;
}

.session-card__level {
  text-transform: uppercase;
  font-weight: var(--font-weight-semibold) !important;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

/* Tutor Info */
.session-card__tutor {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5) 0;
}

.session-card__avatar {
  background: var(--color-gradient) !important;
  border: 2px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
}

.session-card__tutor-info {
  flex: 1;
  min-width: 0;
}

.session-card__tutor-name {
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-card__rating {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* Description */
.session-card__description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: var(--space-4) var(--space-5) 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Tags */
.session-card__tags {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  padding: var(--space-3) var(--space-5) 0;
}

.session-card__tag {
  font-size: 0.7rem !important;
  font-weight: var(--font-weight-medium) !important;
  height: 24px !important;
}

.session-card__more-tags {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

/* Footer */
.session-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) var(--space-5);
  margin-top: auto;
}

.session-card__status-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.session-card__status {
  font-size: 0.7rem !important;
  font-weight: var(--font-weight-semibold) !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.session-card__price {
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.session-card__action {
  font-weight: var(--font-weight-medium) !important;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

/* Loading State */
.session-card__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-glass);
  backdrop-filter: blur(4px);
  z-index: 2;
}

.session-card--booking {
  pointer-events: none;
}

/* Animations */
.session-card--anim-fade-up {
  animation: fadeInUp 0.6s var(--transition-normal) both;
}

.session-card--anim-slide-left {
  animation: slideInLeft 0.6s var(--transition-normal) both;
}

.session-card--anim-scale {
  animation: scaleIn 0.5s var(--transition-normal) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 600px) {
  .session-card__header,
  .session-card__tutor,
  .session-card__tags,
  .session-card__footer {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }
  
  .session-card__description {
    margin-left: var(--space-4);
    margin-right: var(--space-4);
  }
  
  .session-card__subject {
    font-size: 1rem;
  }
  
  .session-card__footer {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .session-card__action {
    width: 100%;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .session-card,
  .session-card__background {
    transition: none !important;
    animation: none !important;
  }
  
  .session-card:hover {
    transform: none;
  }
}

.session-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Dark theme adjustments */
.v-theme--dark .session-card {
  background: var(--color-surface-dark) !important;
  border-color: var(--color-border-dark);
}
</style>
