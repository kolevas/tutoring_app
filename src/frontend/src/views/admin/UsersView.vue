<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="primary white--text">
            <v-icon class="mr-2">mdi-account-multiple</v-icon>
            User Management
          </v-card-title>
          <v-card-subtitle class="white">
            Manage all users in the FINKI tutoring platform
          </v-card-subtitle>

          <v-card-text>
            <!-- Stats / KPI Row -->
            <v-row class="mb-4" v-if="!userStore.loading && userStore.users.length">
              <v-col cols="12" sm="3" v-for="stat in userStats" :key="stat.label">
                <v-card :color="stat.color" elevation="1" class="pa-3 stats-card" dark>
                  <div class="text-caption mb-1" style="opacity:.85">{{ stat.label }}</div>
                  <div class="d-flex align-center">
                    <v-icon left small class="mr-2">{{ stat.icon }}</v-icon>
                    <span class="text-h5 font-weight-medium">{{ stat.value }}</span>
                    <span v-if="stat.suffix" class="ml-1 text-caption">{{ stat.suffix }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <!-- Skeleton Stats -->
            <v-row class="mb-4" v-else-if="userStore.loading">
              <v-col cols="12" sm="3" v-for="n in 4" :key="n">
                <v-skeleton-loader type="card" class="stats-skeleton" />
              </v-col>
            </v-row>

            <!-- Filters / Actions Toolbar -->
            <v-sheet class="mb-4 px-4 py-3 rounded toolbar-sheet" elevation="0">
              <v-row dense align="center">
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="searchQuery"
                    label="Search users..."
                    prepend-icon="mdi-magnify"
                    clearable
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="roleFilter"
                    :items="roleOptions"
                    item-title="text"
                    item-value="value"
                    label="Filter by role"
                    outlined
                    dense
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="statusFilter"
                    :items="statusOptions"
                    item-title="text"
                    item-value="value"
                    label="Filter by status"
                    outlined
                    dense
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3" class="text-right">
                  <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                      <v-btn 
                        color="success" 
                        class="mr-2" 
                        variant="elevated"
                        v-bind="props"
                        :disabled="selectedUsers.length === 0"
                      >
                        <v-icon start>mdi-account-switch</v-icon>
                        Bulk Role Change
                        <v-badge 
                          v-if="selectedUsers.length > 0" 
                          :content="selectedUsers.length" 
                          color="error" 
                          overlap
                        />
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item 
                        v-for="role in roleOptions" 
                        :key="role.value"
                        @click="bulkChangeRole(role.value)"
                      >
                        <template v-slot:prepend>
                          <v-icon :color="getRoleColor(role.value)">
                            {{ getRoleIcon(role.value) }}
                          </v-icon>
                        </template>
                        <v-list-item-title>Change to {{ role.text }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-btn color="primary" @click="createUser" class="mr-2" variant="elevated">
                    <v-icon start>mdi-plus</v-icon>
                    Add User
                  </v-btn>
                  <v-btn color="secondary" variant="outlined" @click="refreshUsers"
                         :disabled="userStore.loading">
                    <v-icon start>mdi-refresh</v-icon>
                    Refresh
                  </v-btn>
                </v-col>
              </v-row>
            </v-sheet>

            <!-- Users Table -->
            <v-data-table
              :headers="headers"
              :items="filteredUsers"
              :loading="userStore.loading"
              :items-per-page="10"
              class="elevation-1"
              show-select
              v-model="selectedUsers"
              item-value="_id"
            >
              <!-- Loading Slot -->
              <template v-slot:loading>
                <v-skeleton-loader type="table" class="mx-4 my-4" />
              </template>

              <!-- Avatar Column -->
              <template v-slot:item.avatar="{ item }">
                <v-avatar size="40">
                  <v-img v-if="item.avatar" :src="item.avatar" />
                  <v-icon v-else>mdi-account-circle</v-icon>
                </v-avatar>
              </template>

              <!-- Role Column -->
              <template v-slot:item.role="{ item }">
                <v-menu offset-y v-if="authStore.isAdmin">
                  <template v-slot:activator="{ props }">
                    <v-chip 
                      small 
                      :color="getRoleColor(item.role)" 
                      outlined
                      v-bind="props"
                      class="role-chip-clickable"
                    >
                      {{ item.role.toUpperCase() }}
                      <v-icon right size="14">mdi-chevron-down</v-icon>
                    </v-chip>
                  </template>
                  <v-list>
                    <v-list-item 
                      v-for="role in roleOptions" 
                      :key="role.value"
                      @click="changeUserRole(item, role.value)"
                      :disabled="item.role === role.value"
                    >
                      <template v-slot:prepend>
                        <v-icon :color="getRoleColor(role.value)">
                          {{ getRoleIcon(role.value) }}
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ role.text }}</v-list-item-title>
                      <template v-slot:append v-if="item.role === role.value">
                        <v-icon color="success" size="16">mdi-check</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-chip v-else small :color="getRoleColor(item.role)" outlined>
                  {{ item.role.toUpperCase() }}
                </v-chip>
              </template>

              <!-- Status Column -->
              <template v-slot:item.isActive="{ item }">
                <v-chip small :color="item.isActive ? 'success' : 'error'">
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </v-chip>
              </template>

              <!-- Subjects Column -->
              <template v-slot:item.subjects="{ item }">
                <div v-if="item.subjects && item.subjects.length > 0">
                  <v-chip
                    v-for="subject in item.subjects.slice(0, 2)"
                    :key="subject"
                    x-small
                    class="mr-1"
                  >
                    {{ subject }}
                  </v-chip>
                  <span v-if="item.subjects.length > 2" class="text-caption grey--text">
                    +{{ item.subjects.length - 2 }} more
                  </span>
                </div>
                <span v-else class="grey--text">-</span>
              </template>

              <!-- Created Date Column -->
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <!-- Actions Column -->
              <template v-slot:item.actions="{ item }">
                <v-menu offset-y>
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="viewUser(item)">
                      <template v-slot:prepend>
                        <v-icon>mdi-eye</v-icon>
                      </template>
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editUser(item)">
                      <template v-slot:prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="toggleUserStatus(item)">
                      <template v-slot:prepend>
                        <v-icon>{{ item.isActive ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ item.isActive ? 'Deactivate' : 'Activate' }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="deleteUser(item)" class="text-error">
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <!-- Empty State -->
              <template v-slot:no-data>
                <div class="text-center pa-8 w-100">
                  <v-icon size="56" color="grey lighten-1">mdi-account-search</v-icon>
                  <div class="mt-3 text-subtitle-1 font-weight-medium">No users found</div>
                  <div class="text-caption mb-4 grey--text">Try adjusting filters or create a new user.</div>
                  <v-btn color="primary" @click="createUser">
                    <v-icon left>mdi-plus</v-icon>
                    Add User
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- User Details Dialog -->
    <v-dialog v-model="showUserDialog" max-width="600">
      <v-card v-if="selectedUser">
        <v-card-title class="primary white--text">
          <v-avatar class="mr-3">
            <v-img v-if="selectedUser.avatar" :src="selectedUser.avatar"></v-img>
            <v-icon v-else>mdi-account-circle</v-icon>
          </v-avatar>
          {{ selectedUser.name }}
        </v-card-title>

        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="6">
              <v-text-field
                :value="selectedUser.email"
                label="Email"
                readonly
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="selectedUser.role"
                :items="roleOptions"
                item-title="text"
                item-value="value"
                label="Role"
                outlined
                @change="userChanged = true"
              ></v-select>
            </v-col>
          </v-row>

          <v-textarea
            v-model="selectedUser.bio"
            label="Bio"
            outlined
            rows="3"
            @input="userChanged = true"
          ></v-textarea>

          <v-autocomplete
            v-if="selectedUser.role === 'tutor'"
            v-model="selectedUser.subjects"
            :items="availableSubjects"
            label="Subjects"
            multiple
            chips
            deletable-chips
            outlined
            @change="userChanged = true"
          ></v-autocomplete>

          <v-switch
            v-model="selectedUser.isActive"
            :label="selectedUser.isActive ? 'Active' : 'Inactive'"
            @change="userChanged = true"
          ></v-switch>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeUserDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="saving"
            :disabled="!userChanged"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Role Change Confirmation Dialog -->
    <v-dialog v-model="showRoleDialog" max-width="500">
      <v-card>
        <v-card-title class="warning white--text">
          <v-icon class="mr-2">mdi-account-switch</v-icon>
          Confirm Role Change
        </v-card-title>
        <v-card-text class="pt-6">
          <div v-if="roleChangeType === 'single'">
            Are you sure you want to change <strong>{{ userToChangeRole?.name }}</strong>'s role 
            from <strong>{{ userToChangeRole?.role }}</strong> to <strong>{{ newRole }}</strong>?
          </div>
          <div v-else>
            Are you sure you want to change the role of <strong>{{ selectedUsers.length }} users</strong> 
            to <strong>{{ newRole }}</strong>?
            <v-list dense class="mt-3" v-if="selectedUsers.length <= 5">
              <v-list-item v-for="user in selectedUsers" :key="user._id" dense>
                <v-list-item-content>
                  <v-list-item-title class="body-2">
                    {{ user.name }} ({{ user.role }} → {{ newRole }})
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" dense class="mt-3">
              Showing first 5 users. {{ selectedUsers.length - 5 }} more will be updated.
              <v-list dense class="mt-2">
                <v-list-item v-for="user in selectedUsers.slice(0, 5)" :key="user._id" dense>
                  <v-list-item-content>
                    <v-list-item-title class="body-2">
                      {{ user.name }} ({{ user.role }} → {{ newRole }})
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-alert>
          </div>
          
          <v-alert type="warning" dense class="mt-4">
            <v-icon start>mdi-alert</v-icon>
            This action will immediately change user permissions and access levels.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showRoleDialog = false">Cancel</v-btn>
          <v-btn color="warning" @click="confirmRoleChange" :loading="changingRole">
            Change Role{{ roleChangeType === 'bulk' ? 's' : '' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="error white--text">
          <v-icon class="mr-2">mdi-delete</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text class="pt-6">
          Are you sure you want to delete user <strong>{{ userToDelete?.name }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create User Dialog -->
    <CreateUserDialog 
      v-model="showCreateDialog"
      @create-user="handleCreateUser"
      @user-created="onUserCreated"
    />
  </v-container>
</template>

<script>
import { useUserStore } from '../../stores/users'
import { useAuthStore } from '../../stores/auth'
import CreateUserDialog from '../../components/CreateUserDialog.vue'
import { eventBus } from '../../utils/eventBus'

export default {
  name: 'AdminUsersView',
  components: { CreateUserDialog },
  
  setup() {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    return { userStore, authStore }
  },

  data() {
    return {
      searchQuery: '',
      roleFilter: '',
      statusFilter: '',
      showUserDialog: false,
      showDeleteDialog: false,
      showRoleDialog: false,
      showCreateDialog: false,
      selectedUser: null,
      userToDelete: null,
      userToChangeRole: null,
      selectedUsers: [],
      newRole: '',
      roleChangeType: 'single', // 'single' or 'bulk'
      userChanged: false,
      saving: false,
      deleting: false,
      changingRole: false,
      headers: [
        { text: '', value: 'avatar', width: '60px', sortable: false },
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Role', value: 'role' },
        { text: 'Status', value: 'isActive' },
        { text: 'Subjects', value: 'subjects', sortable: false },
        { text: 'Joined', value: 'createdAt' },
        { text: 'Actions', value: 'actions', sortable: false, width: '100px' }
      ],
      roleOptions: [
        { text: 'Student', value: 'student' },
        { text: 'Tutor', value: 'tutor' },
        { text: 'Admin', value: 'admin' }
      ],
      statusOptions: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ],
      availableSubjects: [
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'Computer Science', 'Programming', 'JavaScript', 'Python',
        'Java', 'C++', 'Web Development', 'Data Structures',
        'Algorithms', 'Database Design', 'Software Engineering',
        'English', 'Literature', 'History', 'Philosophy',
        'Economics', 'Statistics', 'Linear Algebra', 'Calculus'
      ]
    }
  },

  computed: {
    filteredUsers() {
      let users = [...this.userStore.users]

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        users = users.filter(user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }

      if (this.roleFilter) {
        users = users.filter(user => user.role === this.roleFilter)
      }

      if (this.statusFilter !== '') {
        users = users.filter(user => user.isActive === this.statusFilter)
      }

      return users
    },

    userStats() {
      const all = this.userStore.users
      const total = all.length
      const active = all.filter(u => u.isActive).length
      const tutors = all.filter(u => u.role === 'tutor').length
      const students = all.filter(u => u.role === 'student').length
      return [
        { label: 'Total Users', value: total, icon: 'mdi-account-group', color: 'primary' },
        { label: 'Active %', value: total ? Math.round((active/total)*100) : 0, suffix:'%', icon: 'mdi-progress-check', color: 'success' },
        { label: 'Tutors', value: tutors, icon: 'mdi-teach', color: 'indigo' },
        { label: 'Students', value: students, icon: 'mdi-school', color: 'deep-purple' }
      ]
    }
  },

  methods: {
    getRoleColor(role) {
      switch (role) {
        case 'student': return 'blue'
        case 'tutor': return 'green'
        case 'admin': return 'purple'
        default: return 'grey'
      }
    },

    getRoleIcon(role) {
      switch (role) {
        case 'student': return 'mdi-account-school'
        case 'tutor': return 'mdi-teach'
        case 'admin': return 'mdi-shield-account'
        default: return 'mdi-account'
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    viewUser(user) {
      this.selectedUser = { ...user }
      this.userChanged = false
      this.showUserDialog = true
    },

    editUser(user) {
      this.selectedUser = { ...user }
      this.userChanged = false
      this.showUserDialog = true
    },

    async toggleUserStatus(user) {
      try {
        const result = await this.userStore.updateUser(user._id, { isActive: !user.isActive })
        if (result.success) {
          eventBus.emit('showSnackbar', `User ${user.isActive ? 'deactivated' : 'activated'} successfully`, 'success')
        }
      } catch (error) {
        eventBus.emit('showSnackbar', 'Failed to update user status', 'error')
      }
    },

    deleteUser(user) {
      this.userToDelete = user
      this.showDeleteDialog = true
    },

    async confirmDelete() {
      if (!this.userToDelete) return
      this.deleting = true
      try {
        const result = await this.userStore.deleteUser(this.userToDelete._id)
        if (result.success) {
          eventBus.emit('showSnackbar', 'User deleted successfully', 'success')
          this.showDeleteDialog = false
          this.userToDelete = null
        } else {
          eventBus.emit('showSnackbar', result.error, 'error')
        }
      } catch (error) {
        eventBus.emit('showSnackbar', 'Failed to delete user', 'error')
      } finally {
        this.deleting = false
      }
    },

    async saveUser() {
      if (!this.selectedUser || !this.userChanged) return
      this.saving = true
      try {
        const result = await this.userStore.updateUser(this.selectedUser._id, this.selectedUser)
        if (result.success) {
          eventBus.emit('showSnackbar', 'User updated successfully', 'success')
          this.closeUserDialog()
        } else {
          eventBus.emit('showSnackbar', result.error, 'error')
        }
      } catch (error) {
        this.$root.$emit('showSnackbar', 'Failed to update user', 'error')
      } finally {
        this.saving = false
      }
    },

    closeUserDialog() {
      this.showUserDialog = false
      this.selectedUser = null
      this.userChanged = false
    },

    createUser() {
      this.showCreateDialog = true
    },

    async handleCreateUser(userData) {
      try {
        const result = await this.userStore.createUser(userData)
        if (result.success) {
          this.$root.$emit('showSnackbar', 'User created successfully!', 'success')
          this.showCreateDialog = false
          return true
        } else {
          this.$root.$emit('showSnackbar', result.error, 'error')
          return false
        }
      } catch (error) {
        this.$root.$emit('showSnackbar', 'Failed to create user', 'error')
        return false
      }
    },

    onUserCreated() {
      // This is called when the dialog is closed successfully
      this.showCreateDialog = false
    },

    async refreshUsers() {
      await this.userStore.fetchUsers()
    },

    // Role Management Methods
    changeUserRole(user, role) {
      if (user.role === role) return
      
      this.userToChangeRole = user
      this.newRole = role
      this.roleChangeType = 'single'
      this.showRoleDialog = true
    },

    bulkChangeRole(role) {
      if (this.selectedUsers.length === 0) return
      
      this.newRole = role
      this.roleChangeType = 'bulk'
      this.showRoleDialog = true
    },

    async confirmRoleChange() {
      this.changingRole = true
      
      try {
        if (this.roleChangeType === 'single') {
          const result = await this.userStore.updateUserRole(this.userToChangeRole._id, this.newRole)
          if (result.success) {
            this.$root.$emit('showSnackbar', `${this.userToChangeRole.name}'s role changed to ${this.newRole}`, 'success')
          } else {
            this.$root.$emit('showSnackbar', result.error, 'error')
          }
        } else {
          // Bulk update
          const updates = this.selectedUsers.map(user => ({
            userId: user._id,
            role: this.newRole
          }))
          
          const result = await this.userStore.bulkUpdateUserRoles(updates)
          if (result.success) {
            const { updated, errors } = result.data
            this.$root.$emit('showSnackbar', 
              `${updated.length} users updated successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`, 
              'success'
            )
            this.selectedUsers = [] // Clear selection
          } else {
            this.$root.$emit('showSnackbar', result.error, 'error')
          }
        }
        
        this.showRoleDialog = false
        this.userToChangeRole = null
        this.newRole = ''
      } catch (error) {
        this.$root.$emit('showSnackbar', 'Failed to update user role(s)', 'error')
      } finally {
        this.changingRole = false
      }
    }
  },

  async mounted() {
    await this.userStore.fetchUsers()
  }
}
</script>

<style scoped>
.v-data-table { border-radius: 8px; }
.stats-card { border-radius: 14px; }
.stats-skeleton .v-skeleton-loader__image { height: 80px; }
.toolbar-sheet { background: linear-gradient(135deg,#f5f7fa,#eef2f7); }

.role-chip-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-chip-clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
</style>
