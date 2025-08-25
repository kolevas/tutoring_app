<template>
  <div class="login-page">
    <div class="login-background">
      <div class="background-shapes"></div>
    </div>
    
    <v-container fluid class="login-container">
      <v-row align="center" justify="center" class="min-vh-100">
        <v-col cols="12" sm="8" md="6" lg="5" xl="4">
          <!-- Brand Header -->
          <div class="text-center mb-8 fade-in-up">
            <div class="brand-logo mb-4">
              <v-avatar size="80" class="brand-avatar">
                <v-icon size="40" color="white">mdi-school</v-icon>
              </v-avatar>
            </div>
            <h1 class="brand-title gradient-text mb-2">FINKI Tutor</h1>
            <p class="brand-subtitle text-secondary">Faculty of Computer Science and Engineering</p>
          </div>

          <!-- Login Card -->
          <v-card class="login-card surface-glass" elevation="0">
            <v-card-text class="pa-8">
              <div class="text-center mb-6">
                <h2 class="login-title mb-2">Welcome back</h2>
                <p class="login-subtitle text-muted">Sign in to your account</p>
              </div>

              <v-form @submit.prevent="login" ref="loginForm" class="login-form">
                <v-text-field
                  v-model="form.identifier"
                  label="Student Index or Email"
                  placeholder="Enter your student index or email"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  color="primary"
                  required
                  class="mb-4"
                  :rules="identifierRules"
                ></v-text-field>

                <v-text-field
                  v-model="form.password"
                  label="Password"
                  placeholder="Enter your password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  variant="outlined"
                  color="primary"
                  required
                  class="mb-6"
                  :rules="passwordRules"
                ></v-text-field>

                <!-- Error Display -->
                <v-alert
                  v-if="authStore && authStore.error"
                  type="error"
                  variant="tonal"
                  class="mb-6"
                  density="compact"
                >
                  {{ authStore.error }}
                </v-alert>

                <!-- Login Button -->
                <v-btn
                  type="submit"
                  color="primary"
                  variant="elevated"
                  size="large"
                  block
                  :loading="authStore && authStore.loading"
                  class="login-btn mb-6"
                >
                  <v-icon start>mdi-login</v-icon>
                  Sign In
                </v-btn>

                <!-- Divider -->
                <div class="divider-section mb-6">
                  <v-divider></v-divider>
                  <span class="divider-text">New to FINKI Tutor?</span>
                  <v-divider></v-divider>
                </div>

                <!-- Register Link -->
                <div class="text-center">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    :to="'/register'"
                    class="register-btn"
                  >
                    <v-icon start>mdi-account-plus</v-icon>
                    Create Account
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Test Credentials Info -->
          <v-card class="mt-6 surface-glass" variant="tonal" color="info">
            <v-card-text class="pa-4">
              <div class="text-center">
                <v-icon class="mb-2" color="info">mdi-information</v-icon>
                <h4 class="text-info mb-2">Test Credentials</h4>
                <div class="test-credentials">
                  <p class="mb-1"><strong>Admin:</strong> admin@example.com / admin123</p>
                  <p class="mb-1"><strong>Tutor:</strong> 151023 / password123</p>
                  <p class="mb-0"><strong>Student:</strong> 201156 / password123</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'LoginView',
  
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      form: {
        identifier: '',
        password: ''
      },
      showPassword: false,
      identifierRules: [
        v => !!v || 'Student index or email is required'
      ],
      passwordRules: [
        v => !!v || 'Password is required'
      ]
    }
  },

  methods: {
    async login() {
      try {
        const result = await this.authStore.login(this.form.identifier, this.form.password)
        
        if (result && result.user) {
          // Show success notification
          this.$emit('show-notification', 'Welcome back!', 'success', 'mdi-check-circle')
          this.$router.push('/dashboard')
        }
      } catch (error) {
        console.error('Login error:', error)
      }
    }
  },

  mounted() {
    if (this.authStore && typeof this.authStore.clearError === 'function') {
      this.authStore.clearError()
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-background {
  position: fixed;
  inset: 0;
  z-index: -1;
}

.background-shapes {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(52,134,235,0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(44,26,135,0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(52,134,235,0.08) 0%, transparent 40%);
  background-size: 600px 600px, 800px 800px, 500px 500px;
  animation: float 15s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
  33% { transform: translate(20px, -30px) rotate(2deg); }
  66% { transform: translate(-15px, 20px) rotate(-2deg); }
}

.login-container {
  padding: var(--space-6);
}

.brand-logo {
  margin-bottom: var(--space-6);
}

.brand-avatar {
  background: var(--color-gradient) !important;
  box-shadow: var(--shadow-brand-lg);
  border: 4px solid rgba(255,255,255,0.2);
}

.brand-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-2);
}

.brand-subtitle {
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  opacity: 0.8;
}

.login-card {
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
  box-shadow: var(--shadow-brand-lg) !important;
}

.login-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.login-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.login-form {
  width: 100%;
}

.login-btn {
  font-weight: var(--font-weight-semibold) !important;
  letter-spacing: 0.025em !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-brand) !important;
}

.login-btn:hover {
  box-shadow: var(--shadow-brand-lg) !important;
  transform: translateY(-2px) !important;
}

.register-btn {
  border-radius: var(--radius-lg) !important;
  font-weight: var(--font-weight-medium) !important;
}

.divider-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.divider-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  padding: 0 var(--space-3);
  background: var(--color-surface);
}

.test-credentials {
  font-size: 0.875rem;
  line-height: 1.5;
}

.test-credentials p {
  margin: 0;
  padding: var(--space-1) 0;
}

.min-vh-100 {
  min-height: 100vh;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .login-container {
    padding: var(--space-4);
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .login-card {
    margin: var(--space-4) 0;
  }
  
  .login-card .v-card-text {
    padding: var(--space-6) !important;
  }
}

@media (max-width: 400px) {
  .brand-title {
    font-size: 1.75rem;
  }
  
  .login-card .v-card-text {
    padding: var(--space-5) !important;
  }
}

/* Animation delays for staggered entrance */
.fade-in-up {
  animation-delay: 0.1s;
}

.login-card {
  animation: fadeInUp 0.6s var(--transition-normal) 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Disable animations on reduced motion */
@media (prefers-reduced-motion: reduce) {
  .background-shapes {
    animation: none;
  }
  
  .login-card {
    animation: none;
  }
  
  .login-btn:hover {
    transform: none !important;
  }
}
</style>
