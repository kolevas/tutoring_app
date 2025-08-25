<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="primary white--text">
        <v-icon class="mr-2">mdi-account-plus</v-icon>
        Create New User
      </v-card-title>

      <v-card-text class="pt-6">
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Full Name"
                :rules="nameRules"
                required
                outlined
                prepend-icon="mdi-account"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                :rules="emailRules"
                required
                outlined
                prepend-icon="mdi-email"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12">
              <v-text-field
                v-model="form.password"
                label="Temporary Password"
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
                required
                outlined
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                hint="User will be required to change this on first login"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <v-col cols="12">
              <v-select
                v-model="form.role"
                :items="roleOptions"
                item-title="text"
                item-value="value"
                label="Role"
                required
                outlined
                prepend-icon="mdi-account-switch"
                :rules="[v => !!v || 'Role is required']"
              ></v-select>
            </v-col>
            
            <v-col cols="12" v-if="form.role === 'tutor'">
              <v-autocomplete
                v-model="form.subjects"
                :items="availableSubjects"
                label="Subjects (for tutors)"
                multiple
                chips
                deletable-chips
                outlined
                prepend-icon="mdi-book"
                hint="Select subjects the tutor can teach"
                persistent-hint
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-alert type="info" dense class="mt-4">
            <v-icon start>mdi-information</v-icon>
            The user will receive an email with their login credentials and will be prompted to change their password on first login.
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn 
          color="primary" 
          @click="createUser" 
          :loading="loading"
          :disabled="!valid"
        >
          Create User
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CreateUserDialog',
  
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dialog: false,
      valid: false,
      loading: false,
      showPassword: false,
      form: {
        name: '',
        email: '',
        password: '',
        role: 'student',
        subjects: []
      },
      roleOptions: [
        { text: 'Student', value: 'student' },
        { text: 'Tutor', value: 'tutor' },
        { text: 'Admin', value: 'admin' }
      ],
      availableSubjects: [
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'Computer Science', 'Programming', 'JavaScript', 'Python',
        'Java', 'C++', 'Web Development', 'Data Structures',
        'Algorithms', 'Database Design', 'Software Engineering',
        'English', 'Literature', 'History', 'Philosophy',
        'Economics', 'Statistics', 'Linear Algebra', 'Calculus'
      ],
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

  watch: {
    value(val) {
      this.dialog = val
    },
    dialog(val) {
      if (!val) {
        this.$emit('input', false)
        this.resetForm()
      }
    },
    'form.role'() {
      if (this.form.role !== 'tutor') {
        this.form.subjects = []
      }
    }
  },

  methods: {
    async createUser() {
      if (!this.$refs.form.validate()) return
      
      this.loading = true
      
      try {
        const userData = {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          role: this.form.role,
          subjects: this.form.subjects
        }

        // Emit the create-user event - parent will handle the API call
        this.$emit('create-user', userData)
        
        // Dialog closing will be handled by parent component
      } catch (error) {
        console.error('Error creating user:', error)
      } finally {
        this.loading = false
      }
    },

    closeDialog() {
      this.dialog = false
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        password: '',
        role: 'student',
        subjects: []
      }
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
</style>
