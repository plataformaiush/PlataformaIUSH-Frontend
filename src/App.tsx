import { AppRouter } from './routes/AppRouter'
import { InstitutionProvider } from './context/InstitutionContext'
import { UsersViewPreferenceProvider } from './context/UsersViewPreferenceContext'
import { useEffect } from 'react'
import { useAuthStore } from './presentation/stores/auth.store'

function App() {
  useEffect(() => {
    useAuthStore.getState().initializeAuth()
  }, [])

  return (
    <InstitutionProvider>
      <UsersViewPreferenceProvider>
        <AppRouter />
      </UsersViewPreferenceProvider>
    </InstitutionProvider>
  )
}

export default App
