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
        colors: {
          primary: '#3486eb',
          secondary: '#2c1a87',
          accent: '#2c1a87',
          error: '#dc2626',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          background: '#f5f8fc',
          surface: '#ffffff'
        },
        variables: {
          'border-radius-root': '12px'
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
