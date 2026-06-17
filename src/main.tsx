import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/ui-kit.css'
import './styles/app.css'
import './lib/custom-dropdown.js'
import './styles/index.css'
import './styles/shadcn.css'
import './styles/onboarding.css'
import { App } from './app/App'

// ResizeObserver loop errors are benign browser noise (fired when the iframe preview
// resizes during mode switches). Without this guard React dev mode treats them as
// component crashes because it intercepts all window error events.
window.addEventListener(
  'error',
  (event) => {
    if (
      event.message === 'ResizeObserver loop completed with undelivered notifications' ||
      event.message === 'ResizeObserver loop limit exceeded'
    ) {
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  },
  { capture: true },
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
