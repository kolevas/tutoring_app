<template>
  <v-container fluid class="admin-sessions-shell">
    <v-row>
      <v-col cols="12" class="pt-0">
        <div class="header-line d-flex flex-column flex-md-row align-md-center justify-space-between gap-h">
          <div>
            <h1 class="page-title mb-1">
              <v-icon size="34" class="mr-2">mdi-calendar-multiple</v-icon>
              Session Management
            </h1>
            <p class="subtitle mb-0">
              Monitor and manage all tutoring sessions across the platform
            </p>
          </div>
          <div class="d-flex align-center gap-sm mt-4 mt-md-0">
            <v-btn
              color="primary"
              variant="flat"
              @click="refreshSessions"
              :loading="sessionStore.loading"
            >
              <v-icon start>mdi-refresh</v-icon>
              Refresh
            </v-btn>
            <v-btn
              color="secondary"
              variant="outlined"
              @click="exportSessions"
            >
              <v-icon start>mdi-download</v-icon>
              Export
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mt-4" dense>
      <v-col
        v-for="stat in sessionStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <StatCard
          :icon="stat.icon"
          :label="stat.title"
          :value="stat.value"
          :color="stat.color"
        />
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-sheet
      elevation="0"
      class="px-4 py-3 rounded filter-bar mt-6 mb-4"
    >
      <v-row dense align="center">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="searchQuery"
            density="comfortable"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-magnify"
            placeholder="Search sessions"
            clearable
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            item-title="text"
            item-value="value"
            density="comfortable"
            hide-details
            variant="outlined"
            placeholder="Status"
            clearable
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="subjectFilter"
            :items="subjectOptions"
            item-title="text"
            item-value="value"
            density="comfortable"
            hide-details
            variant="outlined"
            placeholder="Subject"
            clearable
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="dateFilter"
            type="date"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3" class="d-flex justify-end">
          <v-btn
            variant="text"
            size="small"
            class="mr-2"
            @click="clearFilters"
            :disabled="!hasFilters"
          >
            <v-icon start size="16">mdi-filter-remove</v-icon>
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- Sessions Table -->
    <v-card elevation="2" class="data-wrapper mb-10">
      <v-data-table
        :headers="headers"
        :items="filteredSessions"
        :loading="sessionStore.loading"
        :items-per-page="15"
        class="elevation-0 modern-table"
        sort-by="date"
        sort-desc
      >
        <!-- Title Column -->
        <template v-slot:item.title="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.title }}</div>
            <div class="text-caption grey--text">{{ item.subject }}</div>
          </div>
        </template>

        <!-- Tutor Column -->
        <template v-slot:item.tutor="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-2 avatar-fallback">
              <v-icon>mdi-account-tie</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.tutor.name }}</div>
              <div class="text-caption grey--text">{{ item.tutor.email }}</div>
            </div>
          </div>
        </template>

        <!-- Student Column -->
        <template v-slot:item.student="{ item }">
          <div v-if="item.student" class="d-flex align-center">
            <v-avatar size="32" class="mr-2 avatar-student">
              <v-icon>mdi-account-school</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.student.name }}</div>
              <div class="text-caption grey--text">{{ item.student.email }}</div>
            </div>
          </div>
          <span v-else class="grey--text">Not booked</span>
        </template>

        <!-- Date/Time Column -->
        <template v-slot:item.dateTime="{ item }">
          <div>
            <div class="font-weight-medium">{{ formatDate(item.date) }}</div>
            <div class="text-caption grey--text">
              {{ item.startTime }} - {{ item.endTime }}
              <v-chip x-small class="ml-1">{{ item.duration }}m</v-chip>
            </div>
          </div>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            small
            :color="getStatusColor(item.status)"
            :variant="item.status==='available' ? 'outlined' : 'elevated'"
          >
            {{ item.status.toUpperCase() }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="viewSession(item)">
                <v-list-item-icon>
                  <v-icon>mdi-eye</v-icon>
                </v-list-item-icon>
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editSession(item)">
                <v-list-item-icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="item.status==='booked'" @click="cancelSession(item)">
                <v-list-item-icon>
                  <v-icon>mdi-cancel</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Cancel Booking</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="deleteSession(item)" class="error--text">
                <v-list-item-icon>
                  <v-icon color="error">mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- No Data Template -->
        <template v-slot:no-data>
          <div class="text-center pa-10">
            <v-icon size="60" color="grey">mdi-calendar-remove</v-icon>
            <h3 class="mt-3 mb-2">No sessions found</h3>
            <p class="text-medium-emphasis mb-4">
              Adjust filters or refresh the list.
            </p>
            <v-btn
              color="primary"
              variant="flat"
              @click="refreshSessions"
            >
              <v-icon start>mdi-refresh</v-icon>
              Reload
            </v-btn>
          </div>
        </template>

        <!-- Loading Skeleton -->
        <template v-slot:loading>
          <v-skeleton-loader type="table" class="mx-4 my-6" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Session Details Dialog -->
    <v-dialog v-model="showSessionDialog" max-width="700">
      <v-card v-if="selectedSession">
        <v-card-title class="primary white--text">
          <v-icon class="mr-2">mdi-calendar</v-icon>
          Session Details
        </v-card-title>

        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :value="selectedSession.title"
                label="Title"
                readonly
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :value="selectedSession.subject"
                label="Subject"
                readonly
                outlined
              ></v-text-field>
            </v-col>
          </v-row>

          <v-textarea
            :value="selectedSession.description"
            label="Description"
            readonly
            outlined
            rows="3"
          ></v-textarea>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                :value="formatDate(selectedSession.date)"
                label="Date"
                readonly
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                :value="`${selectedSession.startTime} - ${selectedSession.endTime}`"
                label="Time"
                readonly
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                :value="`${selectedSession.duration} minutes`"
                label="Duration"
                readonly
                outlined
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :value="selectedSession.tutor?.name"
                label="Tutor"
                readonly
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :value="selectedSession.student?.name || 'Not booked'"
                label="Student"
                readonly
                outlined
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedSession.status"
                :items="statusOptions"
                label="Status"
                outlined
                @change="sessionChanged = true"
              ></v-select>
            </v-col>
          </v-row>

          <v-text-field
            v-model="selectedSession.meetingLink"
            label="Meeting Link"
            outlined
            @input="sessionChanged = true"
          ></v-text-field>

          <v-textarea
            v-model="selectedSession.notes"
            label="Notes"
            outlined
            rows="3"
            @input="sessionChanged = true"
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeSessionDialog">Close</v-btn>
          <v-btn
            color="primary"
            @click="saveSession"
            :loading="saving"
            :disabled="!sessionChanged"
          >
            Save Changes
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
          Are you sure you want to delete the session
          <strong>"{{ sessionToDelete?.title }}"</strong>? This action cannot be
          undone.
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
  </v-container>
</template>

<script>
import { useSessionStore } from '../../stores/sessions'
import StatCard from '../../components/StatCard.vue'

export default {
  name: 'AdminSessionsView',
  components: { StatCard },
  setup() { const sessionStore = useSessionStore(); return { sessionStore } },
  data() { return { searchQuery:'', statusFilter:'', subjectFilter:'', dateFilter:'', showSessionDialog:false, showDeleteDialog:false, selectedSession:null, sessionToDelete:null, sessionChanged:false, saving:false, deleting:false, headers:[ { text:'Session', value:'title', width:'200px' }, { text:'Tutor', value:'tutor', width:'180px' }, { text:'Student', value:'student', width:'180px' }, { text:'Date & Time', value:'dateTime', width:'150px' }, { text:'Status', value:'status', width:'120px' }, { text:'Actions', value:'actions', sortable:false, width:'100px' } ], statusOptions:[ { text:'Available', value:'available' }, { text:'Booked', value:'booked' }, { text:'Completed', value:'completed' }, { text:'Cancelled', value:'cancelled' } ] } },
  computed: {
    filteredSessions(){ let sessions=[...this.sessionStore.sessions]; if(this.searchQuery){ const q=this.searchQuery.toLowerCase(); sessions=sessions.filter(s=> s.title.toLowerCase().includes(q)|| s.subject.toLowerCase().includes(q)|| s.tutor?.name.toLowerCase().includes(q)|| s.student?.name?.toLowerCase().includes(q)) } if(this.statusFilter) sessions=sessions.filter(s=> s.status===this.statusFilter); if(this.subjectFilter) sessions=sessions.filter(s=> s.subject===this.subjectFilter); if(this.dateFilter){ sessions=sessions.filter(s=> new Date(s.date).toDateString()=== new Date(this.dateFilter).toDateString()) } return sessions },
    subjectOptions(){ const subjects=[...new Set(this.sessionStore.sessions.map(s=> s.subject))]; return subjects.map(s=> ({ text:s, value:s })) },
    sessionStats(){ const list=this.sessionStore.sessions; return [ { title:'Total Sessions', value:list.length, icon:'mdi-calendar', color:'primary' }, { title:'Available', value:list.filter(s=>s.status==='available').length, icon:'mdi-calendar-check', color:'success' }, { title:'Booked', value:list.filter(s=>s.status==='booked').length, icon:'mdi-calendar-account', color:'warning' }, { title:'Completed', value:list.filter(s=>s.status==='completed').length, icon:'mdi-calendar-star', color:'info' } ] },
    hasFilters(){ return !!(this.searchQuery||this.statusFilter||this.subjectFilter||this.dateFilter) }
  },
  methods: {
    getStatusColor(status){ switch(status){ case 'available': return 'success'; case 'booked': return 'warning'; case 'completed': return 'info'; case 'cancelled': return 'error'; default: return 'grey'} },
    formatDate(d){ return new Date(d).toLocaleDateString('en-US',{ year:'numeric', month:'short', day:'numeric'}) },
    viewSession(s){ this.selectedSession={...s}; this.sessionChanged=false; this.showSessionDialog=true },
    editSession(s){ this.selectedSession={...s}; this.sessionChanged=false; this.showSessionDialog=true },
    async cancelSession(s){ try { const result=await this.sessionStore.cancelBooking(s._id); this.$root.$emit('showSnackbar', result.success? 'Session booking cancelled':'Failed to cancel', result.success?'success':'error') } catch(e){ this.$root.$emit('showSnackbar','Failed to cancel session','error') } },
    deleteSession(s){ this.sessionToDelete=s; this.showDeleteDialog=true },
    async confirmDelete(){ if(!this.sessionToDelete) return; this.deleting=true; try { const r=await this.sessionStore.deleteSession(this.sessionToDelete._id); this.$root.$emit('showSnackbar', r.success? 'Session deleted':'Failed to delete', r.success?'success':'error'); if(r.success){ this.showDeleteDialog=false; this.sessionToDelete=null } } finally { this.deleting=false } },
    async saveSession(){ if(!this.selectedSession||!this.sessionChanged) return; this.saving=true; try { const r=await this.sessionStore.updateSession(this.selectedSession._id, this.selectedSession); this.$root.$emit('showSnackbar', r.success? 'Session updated':'Failed to update', r.success?'success':'error'); if(r.success) this.closeSessionDialog() } finally { this.saving=false } },
    closeSessionDialog(){ this.showSessionDialog=false; this.selectedSession=null; this.sessionChanged=false },
    async refreshSessions(){ await this.sessionStore.fetchSessions(); this.$root.$emit('showSnackbar','Sessions refreshed','success') },
    clearFilters(){ this.searchQuery=this.statusFilter=this.subjectFilter=this.dateFilter='' },
    exportSessions(){ 
      // Simple CSV export
      const headers=['Title','Subject','Tutor','Student','Date','Time','Status','Price'];
      const rows=this.filteredSessions.map(s=> [s.title,s.subject,s.tutor?.name||'',s.student?.name||'',this.formatDate(s.date),`${s.startTime}-${s.endTime}`,s.status,s.price||0]);
      const csv=[headers,...rows].map(r=> r.map(f=>`"${f}"`).join(',')).join('\n');
      const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`sessions-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url); this.$root.$emit('showSnackbar','Sessions exported successfully','success'); }
  },
  async mounted(){ await this.sessionStore.fetchSessions() }
}
</script>

<style scoped>
.admin-sessions-shell {
  background: linear-gradient(135deg, #f2f7fc, #eef0ff) !important;
  min-height: 100vh;
  padding-bottom: 48px;
}

.page-title {
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: clamp(1.55rem, 2vw, 2.1rem);
}

.subtitle {
  opacity: 0.75;
  font-size: 0.9rem;
}

.filter-bar {
  background: linear-gradient(135deg, #f5f7fa, #eef2f7);
  border: 1px solid #e3e8ef;
  border-radius: 18px;
}

.data-wrapper {
  border-radius: 22px;
  overflow: hidden;
}

.modern-table :deep(thead th) {
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modern-table :deep(tbody tr:hover) {
  background: rgba(52, 134, 235, 0.06);
}

.avatar-fallback {
  background: linear-gradient(
    135deg,
    var(--color-primary, #3486eb),
    var(--color-accent, #2c1a87)
  );
  color: #fff;
}

.avatar-student {
  background: #e3f2fd;
  color: #1976d2;
}

.gap-sm > * + * {
  margin-left: 12px;
}
</style>
