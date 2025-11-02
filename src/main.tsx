import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Buffer } from 'buffer'

// Polyfill Buffer for browser
if (typeof window !== 'undefined') {
  const win = window as any
  if (!win.Buffer) {
    win.Buffer = Buffer
  }
  if (!win.global) {
    win.global = win
  }
  if (!win.globalThis) {
    win.globalThis = win
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

