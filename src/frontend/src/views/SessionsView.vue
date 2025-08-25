<template>
  <v-container class="sessions-shell" fluid>
    <v-row>
      <v-col cols="12" class="pb-0">
        <div class="header-line d-flex flex-column flex-md-row align-md-center justify-space-between gap-h">
          <div>
            <h1 class="page-title mb-1"><v-icon class="mr-2" size="34">mdi-account-search</v-icon> Find Sessions</h1>
            <p class="subtitle mb-0">Discover and book upcoming tutoring sessions</p>
          </div>
          <div class="actions mt-4 mt-md-0 d-flex align-center gap-sm">
            <v-btn color="primary" variant="flat" @click="refresh" :loading="sessionStore.loading"><v-icon start>mdi-refresh</v-icon>Refresh</v-btn>
            <v-btn color="secondary" variant="outlined" @click="$router.push('/my-sessions')"><v-icon start>mdi-calendar-check</v-icon>My Bookings</v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filters Chip Bar -->
    <v-row class="mt-4">
      <v-col cols="12" class="pt-0">
        <div class="chip-bar d-flex flex-wrap align-center gap-xs">
          <v-text-field v-model="search" density="compact" hide-details variant="outlined" placeholder="Search subject or tutor" class="search-field" prepend-inner-icon="mdi-magnify" />
          <v-select v-model="subject" :items="subjectOptions" density="compact" hide-details variant="outlined" placeholder="Subject" class="w-auto select-small" clearable />
          <v-select v-model="level" :items="levelOptions" density="compact" hide-details variant="outlined" placeholder="Level" class="w-auto select-small" clearable />
          <v-text-field v-model="date" type="date" density="compact" hide-details variant="outlined" class="w-auto date-small" />
          <v-btn size="small" variant="text" @click="clearFilters" :disabled="!hasFilters"><v-icon start size="16">mdi-filter-remove</v-icon>Clear</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="sessionStore.loading" class="mt-4">
      <v-col cols="12" class="text-center py-10">
        <v-progress-circular indeterminate color="primary" size="56" />
        <p class="mt-4 mb-0">Loading sessions...</p>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="sessionStore.error" class="mt-4">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" class="mb-4">{{ sessionStore.error }}<template #append><v-btn size="small" variant="text" @click="refresh">Retry</v-btn></template></v-alert>
      </v-col>
    </v-row>

    <!-- Sessions Grid -->
    <v-row v-else-if="filteredSessions.length" class="mt-1">
      <v-col v-for="s in filteredSessions" :key="s._id" cols="12" sm="6" md="4" lg="3">
        <SessionCard :session="s" @book="onBook" @select="openDialog" :booking="bookingId===s._id" />
      </v-col>
    </v-row>

    <!-- Empty -->
    <v-row v-else class="mt-6">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="70" color="grey">mdi-calendar-blank</v-icon>
        <h3 class="mt-4 mb-2">No sessions match your filters</h3>
        <p class="text-medium-emphasis mb-4">Try adjusting or clearing the filters to see more.</p>
        <v-btn color="primary" variant="flat" @click="refresh"><v-icon start>mdi-refresh</v-icon>Reload</v-btn>
      </v-col>
    </v-row>

    <!-- Detail Dialog -->
    <v-dialog v-model="dialog" max-width="640">
      <v-card v-if="selected">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-calendar</v-icon>
          {{ selected.subject }}
          <v-spacer />
          <v-chip size="x-small" color="primary" class="text-uppercase">{{ selected.level }}</v-chip>
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-wrap gap-md mb-3 meta-block">
            <div class="meta-pair"><v-icon size="18" class="mr-1">mdi-account</v-icon>{{ selected.tutor?.name }}</div>
            <div class="meta-pair"><v-icon size="18" class="mr-1">mdi-calendar</v-icon>{{ formatFullDate(selected.date) }}</div>
            <div class="meta-pair"><v-icon size="18" class="mr-1">mdi-clock-outline</v-icon>{{ selected.startTime }} - {{ selected.endTime }}</div>
            <div class="meta-pair"><v-icon size="18" class="mr-1">mdi-timelapse</v-icon>{{ selected.duration }} mins</div>
          </div>
          <p class="desc-full mb-4">{{ selected.description || 'No description provided.' }}</p>
          <v-alert v-if="selected.status!=='available'" type="warning" density="comfortable" variant="tonal" class="mb-4">
            This session is currently {{ selected.status }}.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
            <v-btn variant="text" @click="dialog=false">Close</v-btn>
            <v-btn color="primary" :disabled="selected.status!=='available'" :loading="bookingId===selected._id" @click="onBook(selected)"><v-icon start size="18">mdi-check</v-icon>Book</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="480">
      <v-card>
        <v-card-title class="text-h6"><v-icon class="mr-2" color="success">mdi-check-circle</v-icon>Booking Successful</v-card-title>
        <v-card-text>Your session has been booked successfully.</v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="successDialog=false">OK</v-btn><v-btn color="primary" @click="$router.push('/my-sessions')">View My Bookings</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useSessionStore } from '../stores/sessions'
import { useNotificationStore } from '../stores/notifications'
import SessionCard from '../components/SessionCard.vue'

export default {
  name: 'SessionsView',
  components: { SessionCard },
  setup() { return { sessionStore: useSessionStore(), notificationStore: useNotificationStore() } },
  data(){ return { search:'', subject:'', level:'', date:'', dialog:false, selected:null, successDialog:false, bookingId:null, levelOptions:['Beginner','Intermediate','Advanced'] } },
  computed: {
    subjectOptions(){ const set=new Set(this.sessionStore.sessions.map(s=>s.subject)); return Array.from(set) },
    hasFilters(){ return !!(this.search||this.subject||this.level||this.date) },
    filteredSessions(){
      let list = this.sessionStore.availableSessions
      if (this.search){ const q=this.search.toLowerCase(); list = list.filter(s=> (s.subject||'').toLowerCase().includes(q) || (s.tutor?.name||'').toLowerCase().includes(q)) }
      if (this.subject) list = list.filter(s=> s.subject===this.subject)
      if (this.level) list = list.filter(s=> s.level===this.level)
      if (this.date) list = list.filter(s=> new Date(s.date).toDateString() === new Date(this.date).toDateString())
      return list
    }
  },
  methods: {
    async refresh(){ await this.sessionStore.fetchAvailableSessions() },
    clearFilters(){ this.search=this.subject=this.level=this.date='' },
    formatFullDate(d){ return new Date(d).toLocaleDateString('en-US',{ weekday:'short', year:'numeric', month:'short', day:'numeric' }) },
    openDialog(s){ this.selected = s; this.dialog = true },
    async onBook(session){ const id=session._id; this.bookingId=id; try { const res=await this.sessionStore.bookSession(id); if(res?.success){ this.successDialog=true; await this.refresh() } else { this.notificationStore.addNotification({ title:'Booking Failed', message:res.error||'Failed', type:'error'}) } } catch(e){ this.notificationStore.addNotification({ title:'Booking Failed', message:e.message||'Failed', type:'error'}) } finally { this.bookingId=null } }
  },
  async mounted(){ await this.refresh() }
}
</script>

<style scoped>
.sessions-shell { background:linear-gradient(135deg,#f2f7fc,#eef0ff) !important; min-height:100vh; padding-bottom:48px; }
.page-title { font-weight:700; letter-spacing:.5px; font-size:clamp(1.6rem,2.1vw,2.2rem); }
.subtitle { opacity:.75; font-size:.9rem; }
.chip-bar { gap:12px; }
.search-field { max-width:260px; }
.select-small, .date-small { max-width:140px; }
.w-auto { width:auto; }
.gap-xs > * { margin-right:8px; }
.meta-pair { font-size:.8rem; display:flex; align-items:center; background:#f3f6fa; padding:6px 10px; border-radius:10px; }
.meta-block { gap:8px; }
.desc-full { font-size:.85rem; line-height:1.45; }
@media (max-width:800px){ .search-field { flex:1 1 100%; max-width:100%; } .select-small, .date-small { flex:1 1 120px; } }
</style>
