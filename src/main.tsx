import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { TokenManager } from './domain/auth/tokenManager'

// Inicializar token temporal mientras no esté el login
TokenManager.initializeTemporaryToken()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
