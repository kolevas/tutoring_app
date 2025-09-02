<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="6" class="profile-card-modern">
          <v-card-title class="primary white--text">
            <v-icon class="mr-2">mdi-account</v-icon>
            My Profile
          </v-card-title>
          <v-card-subtitle class="white">
            Manage your account information and preferences
          </v-card-subtitle>
          <v-card-text class="pt-6">
            <v-row>
              <!-- Profile Image Section -->
              <v-col cols="12" md="3" class="text-center">
                <v-avatar size="120" class="mb-4">
                  <v-img
                    v-if="user.avatar"
                    :src="user.avatar"
                    :alt="user.name"
                  ></v-img>
                  <v-icon v-else size="60" color="grey">mdi-account-circle</v-icon>
                </v-avatar>
                <br>
                <v-btn small text color="primary" @click="changeAvatar">
                  <v-icon class="mr-2">mdi-camera</v-icon>
                  Change Photo
                </v-btn>
                
                <div class="mt-4">
                  <v-chip
                    :color="roleColor"
                    outlined
                    large
                  >
                    <v-icon class="mr-2">{{ roleIcon }}</v-icon>
                    {{ user.role?.toUpperCase() }}
                  </v-chip>
                </div>
              </v-col>

              <!-- Profile Form -->
              <v-col cols="12" md="9">
                <v-form @submit.prevent="updateProfile" ref="profileForm">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="form.name"
                        label="Full Name"
                        :rules="nameRules"
                        required
                        outlined
                        prepend-icon="mdi-account"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="form.email"
                        label="Email"
                        :rules="emailRules"
                        required
                        outlined
                        prepend-icon="mdi-email"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row v-if="user.role === 'student' || user.role === 'tutor'">
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="form.studentIndex"
                        label="Student Index"
                        :rules="studentIndexRules"
                        required
                        outlined
                        prepend-icon="mdi-card-account-details"
                        readonly
                        hint="Student index cannot be changed"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- Bio Section -->
                  <v-textarea
                    v-model="form.bio"
                    label="Bio"
                    outlined
                    rows="4"
                    prepend-icon="mdi-information"
                    :placeholder="bioPlaceholder"
                    counter="500"
                    :rules="bioRules"
                  ></v-textarea>

                  <!-- Subjects (for tutors) -->
                  <v-autocomplete
                    v-if="user.role === 'tutor'"
                    v-model="form.subjects"
                    :items="availableSubjects"
                    label="Subjects You Teach"
                    multiple
                    chips
                    deletable-chips
                    outlined
                    prepend-icon="mdi-book-open-variant"
                    hint="Add subjects you're qualified to teach"
                  ></v-autocomplete>

                  <!-- Error Display -->
                  <v-alert
                    v-if="error"
                    type="error"
                    dismissible
                    @input="error = null"
                    class="mb-4"
                  >
                    {{ error }}
                  </v-alert>

                  <!-- Success Display -->
                  <v-alert
                    v-if="successMessage"
                    type="success"
                    dismissible
                    @input="successMessage = null"
                    class="mb-4"
                  >
                    {{ successMessage }}
                  </v-alert>

                  <!-- Action Buttons -->
                  <v-row class="mt-4">
                    <v-col>
                      <v-btn
                        color="primary"
                        large
                        type="submit"
                        :loading="loading"
                        :disabled="!hasChanges"
                      >
                        <v-icon class="mr-2">mdi-content-save</v-icon>
                        Save Changes
                      </v-btn>
                      <v-btn
                        text
                        large
                        class="ml-2"
                        @click="resetForm"
                        :disabled="!hasChanges"
                      >
                        Reset
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Account Settings Section -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="secondary white--text">
            <v-icon class="mr-2">mdi-cog</v-icon>
            Account Settings
          </v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item @click="showChangePassword = true">
                <v-list-item-icon>
                  <v-icon>mdi-lock</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Change Password</v-list-item-title>
                  <v-list-item-subtitle>Update your password</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-list-item-action>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-bell</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Email Notifications</v-list-item-title>
                  <v-list-item-subtitle>Session reminders and updates</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch v-model="notifications" color="primary"></v-switch>
                </v-list-item-action>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-shield-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Account Status</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip small :color="user.isActive ? 'success' : 'error'">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Statistics Section (for tutors) -->
      <v-col cols="12" md="6" v-if="user.role === 'tutor'">
        <v-card elevation="2">
          <v-card-title class="info white--text">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Your Statistics
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="6" class="text-center">
                <div class="text-h3 primary--text">{{ tutorStats.totalSessions }}</div>
                <div class="text-caption grey--text">Total Sessions</div>
              </v-col>
              <v-col cols="6" class="text-center">
                <div class="text-h3 success--text">{{ tutorStats.completedSessions }}</div>
                <div class="text-caption grey--text">Completed</div>
              </v-col>
              <v-col cols="6" class="text-center">
                <div class="text-h3 warning--text">{{ tutorStats.averageRating }}</div>
                <div class="text-caption grey--text">Avg. Rating</div>
              </v-col>
              <v-col cols="6" class="text-center">
                <div class="text-h3 info--text">{{ tutorStats.totalStudents }}</div>
                <div class="text-caption grey--text">Students Helped</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Change Password Dialog -->
    <v-dialog v-model="showChangePassword" max-width="400">
      <v-card>
        <v-card-title class="primary white--text">
          Change Password
        </v-card-title>

        <v-card-text class="pt-6">
          <v-form @submit.prevent="changePassword" ref="passwordForm">
            <v-text-field
              v-model="passwordForm.currentPassword"
              label="Current Password"
              type="password"
              outlined
              required
            ></v-text-field>

            <v-text-field
              v-model="passwordForm.newPassword"
              label="New Password"
              type="password"
              outlined
              :rules="passwordRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="Confirm New Password"
              type="password"
              outlined
              :rules="confirmPasswordRules"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showChangePassword = false">Cancel</v-btn>
          <v-btn color="primary" @click="changePassword" :loading="changingPassword">
            Change Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/users'
import { eventBus } from '../utils/eventBus'

export default {
  name: 'ProfileView',
  
  setup() {
    const authStore = useAuthStore()
    const userStore = useUserStore()
    
    return {
      authStore,
      userStore
    }
  },

  data() {
    return {
      form: {
        name: '',
        email: '',
        studentIndex: '',
        bio: '',
        subjects: []
      },
      originalForm: {},
      loading: false,
      error: null,
      successMessage: null,
      showChangePassword: false,
      changingPassword: false,
      notifications: true,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      tutorStats: {
        totalSessions: 12,
        completedSessions: 10,
        averageRating: 4.8,
        totalStudents: 25
      },
      availableSubjects: [
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'Computer Science', 'Programming', 'JavaScript', 'Python',
        'Java', 'C++', 'Web Development', 'Data Structures',
        'Algorithms', 'Database Design', 'Software Engineering',
        'English', 'Literature', 'History', 'Philosophy',
        'Economics', 'Statistics', 'Linear Algebra', 'Calculus',
        'Discrete Mathematics', 'Machine Learning',
        'Artificial Intelligence', 'Cybersecurity'
      ],
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length >= 2 || 'Name must be at least 2 characters'
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ],
      studentIndexRules: [
        v => !!v || 'Student index is required',
        v => /^\d{6}$/.test(v) || 'Student index must be 6 digits'
      ],
      bioRules: [
        v => !v || v.length <= 500 || 'Bio must be less than 500 characters'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters'
      ]
    }
  },

  computed: {
    user() {
      return this.authStore.user || {}
    },

    roleColor() {
      switch (this.user.role) {
        case 'student': return 'blue'
        case 'tutor': return 'green'
        case 'admin': return 'purple'
        default: return 'grey'
      }
    },

    roleIcon() {
      switch (this.user.role) {
        case 'student': return 'mdi-account-school'
        case 'tutor': return 'mdi-teach'
        case 'admin': return 'mdi-shield-account'
        default: return 'mdi-account'
      }
    },

    bioPlaceholder() {
      switch (this.user.role) {
        case 'student': return 'Tell us about your learning goals and interests...'
        case 'tutor': return 'Share your teaching experience, qualifications, and teaching philosophy...'
        case 'admin': return 'Administrative role description...'
        default: return 'Tell us about yourself...'
      }
    },

    hasChanges() {
      return JSON.stringify(this.form) !== JSON.stringify(this.originalForm)
    },

    confirmPasswordRules() {
      return [
        v => !!v || 'Password confirmation is required',
        v => v === this.passwordForm.newPassword || 'Passwords do not match'
      ]
    }
  },

  methods: {
    initializeForm() {
      this.form = {
        name: this.user.name || '',
        email: this.user.email || '',
        studentIndex: this.user.studentIndex || '',
        bio: this.user.bio || '',
        subjects: this.user.subjects || []
      }
      this.originalForm = { ...this.form }
    },

    async updateProfile() {
      if (!this.$refs.profileForm.validate()) {
        return
      }

      this.loading = true
      this.error = null

      try {
        const result = await this.userStore.updateUser(this.user._id, this.form)
        
        if (result.success) {
          this.authStore.updateUser(this.form)
          this.originalForm = { ...this.form }
          this.successMessage = 'Profile updated successfully!'
        } else {
          this.error = result.error || 'Failed to update profile'
        }
      } catch (error) {
        this.error = 'An error occurred while updating your profile'
        console.error('Update profile error:', error)
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.form = { ...this.originalForm }
      this.$refs.profileForm.resetValidation()
    },

    changeAvatar() {
      // Placeholder for avatar change functionality
      eventBus.emit('showSnackbar', 'Avatar change feature coming soon!', 'info')
    },

    async changePassword() {
      if (!this.$refs.passwordForm.validate()) {
        return
      }

      this.changingPassword = true

      try {
        // Simulate password change API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.showChangePassword = false
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        eventBus.emit('showSnackbar', 'Password changed successfully!', 'success')
      } catch (error) {
        eventBus.emit('showSnackbar', 'Failed to change password', 'error')
      } finally {
        this.changingPassword = false
      }
    }
  },

  mounted() {
    this.initializeForm()
  },

  watch: {
    user: {
      handler() {
        this.initializeForm()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.profile-card-modern {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.18);
  margin-top: 32px;
}

.v-avatar {
  border: 3px solid #e0e0e0;
}

.v-chip {
  font-weight: bold;
}
</style>
