import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Capture beforeinstallprompt as early as possible so the banner
// component can use it even if it mounts after the event fires.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  ;(window as any).__pwaPromptEvent = e
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
