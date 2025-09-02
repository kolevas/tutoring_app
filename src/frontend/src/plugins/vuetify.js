import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Import Vuetify components
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#3486eb',
          secondary: '#2c1a87',
          accent: '#2c1a87',
          error: '#dc2626',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          background: '#f8fafc',
          surface: '#ffffff',
          'surface-variant': '#f1f5f9',
          'on-surface': '#1e293b',
          'on-surface-variant': '#475569'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#60a5fa',
          secondary: '#a78bfa',
          accent: '#a78bfa',
          error: '#ef4444',
          info: '#06b6d4',
          success: '#22c55e',
          warning: '#f59e0b',
          background: '#0f172a',
          surface: '#1e293b',
          'surface-variant': '#334155',
          'on-surface': '#f1f5f9',
          'on-surface-variant': '#cbd5e1'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})
