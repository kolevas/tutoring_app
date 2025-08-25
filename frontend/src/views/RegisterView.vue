<template>
  <div class="register-container-modern">
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5">
          <v-card elevation="8" class="pa-6 register-card-modern">
            <v-card-title class="text-center">
              <v-icon size="48" color="primary" class="mb-4">mdi-school</v-icon>
              <h2 class="primary--text">Create Account</h2>
              <p class="text-subtitle-1 grey--text">Join our tutoring platform</p>
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="register" ref="form">
                <v-text-field
                  v-model="form.name"
                  label="Full Name"
                  prepend-icon="mdi-account"
                  :rules="nameRules"
                  required
                  outlined
                ></v-text-field>
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  prepend-icon="mdi-email"
                  :rules="emailRules"
                  required
                  outlined
                ></v-text-field>
                <v-text-field
                  v-model="form.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-icon="mdi-lock"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  :rules="passwordRules"
                  required
                  outlined
                ></v-text-field>
                <v-text-field
                  v-model="form.confirmPassword"
                  label="Confirm Password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  prepend-icon="mdi-lock-check"
                  :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showConfirmPassword = !showConfirmPassword"
                  :rules="confirmPasswordRules"
                  required
                  outlined
                ></v-text-field>
                
                <!-- Role Assignment Info -->
                <v-alert type="info" variant="tonal" class="mb-4">
                  <v-icon start>mdi-information</v-icon>
                  <div>
                    <strong>Role Assignment:</strong> All new users start as students. 
                    Admins can later assign tutor roles based on qualifications and verification.
                  </div>
                </v-alert>
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  class="mt-4"
                >
                  Register
                </v-btn>
              </v-form>
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
  name: 'RegisterView',
  
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      showConfirmPassword: false,
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length >= 2 || 'Name must be at least 2 characters'
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters'
      ]
    }
  },

  computed: {
    confirmPasswordRules() {
      return [
        v => !!v || 'Password confirmation is required',
        v => v === this.form.password || 'Passwords do not match'
      ]
    }
  },

  methods: {
    async register() {
      if (this.$refs.form.validate()) {
        const { confirmPassword, ...userData } = this.form
        const result = await this.authStore.register(userData)
        
        if (result.success) {
          this.$router.push('/dashboard')
        }
      }
    }
  }
}
</script>

<style scoped>
.register-container-modern {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%);
}

.register-card-modern {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.18);
}

.text-decoration-none {
  text-decoration: none;
}

:deep(.v-container) {
  height: 100vh;
}

:deep(.v-card) {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}
</style>
