import React from 'react'
import { AppRouter } from './routes/AppRouter'
import { InstitutionProvider } from './context/InstitutionContext'

function App() {
  return (
    <InstitutionProvider>
      <AppRouter />
    </InstitutionProvider>
  )
}

export default App
