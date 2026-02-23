import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { MusicProvider } from './contexts/MusicContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MusicProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MusicProvider>
    </AuthProvider>
  </StrictMode>,
)
