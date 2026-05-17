import { AppRouter } from './routes/AppRouter'
import { InstitutionProvider } from './context/InstitutionContext'
import { useEffect } from 'react'
import { useAuthStore } from './presentation/stores/auth.store'

function App() {
  useEffect(() => {
    useAuthStore.getState().initializeAuth()
  }, [])

  return (
    <InstitutionProvider>
      <AppRouter />
    </InstitutionProvider>
  )
}

export default App
