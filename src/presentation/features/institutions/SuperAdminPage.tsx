import { JSX, useEffect } from 'react'
import { DashboardView } from './components/DashboardView'
import { CursosView } from './components/CursosView'
import { ResumenView } from './components/ResumenView'
import { PersonalizacionView } from './components/PersonalizacionView'
import { UsuariosView } from './components/UsuariosView'
import UserManagementPage from '../student/auth/pages/UserManagementPage'
import { useUsersViewPreference } from '../../../context/UsersViewPreferenceContext'
import { institutionService } from '../../../domain/institution/institutionService'
import { institutionStorageService } from '../../../domain/institution/institutionStorageService'
import { useLocation } from 'react-router-dom'

type Page = 'dashboard' | 'reportes' | 'usuarios' | 'cursos' | 'personalizacion'

export function SuperAdminPage() {
  const location = useLocation()
  const { viewType } = useUsersViewPreference()

  const VIEWS: Record<Page, JSX.Element> = {
    dashboard: <DashboardView />,
    reportes: <ResumenView />,
    usuarios: viewType === 'original' ? <UsuariosView /> : <UserManagementPage />,
    cursos: <CursosView />,
    personalizacion: <PersonalizacionView />,
  }

  useEffect(() => {
    institutionService
      .getConfig()
      .then((data) => {
        institutionStorageService.setLogo(data.logo)
      })
      .catch((error) => {
        const errorMessage = String(error)
        if (!errorMessage.includes('HTTP 401')) {
          console.error('Error loading logo:', error)
        }
      })
  }, [])

  // Determinar la página actual basada en la ruta
  const getPageFromPath = (): Page => {
    if (location.pathname.includes('usuarios')) return 'usuarios'
    if (location.pathname.includes('resumen')) return 'reportes'
    if (location.pathname.includes('cursos')) return 'cursos'
    if (location.pathname.includes('personalizacion')) return 'personalizacion'
    return 'dashboard'
  }

  const page = getPageFromPath()

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }}>
      {VIEWS[page]}
    </div>
  )
}
