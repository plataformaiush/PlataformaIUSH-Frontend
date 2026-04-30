import { JSX, useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import styles from './SuperAdminPage.module.css'
import { Sidebar } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { UsuariosView } from './components/UsuariosView'
import { CursosView } from './components/CursosView'
import { ReportesView } from './components/ReportesView'
import { PersonalizacionView } from './components/PersonalizacionView'
import { institutionService } from '../../../domain/institution/institutionService'
import { institutionStorageService } from '../../../domain/institution/institutionStorageService'

type Page = 'dashboard' | 'reportes' | 'usuarios' | 'cursos' | 'personalizacion'

const VIEWS: Record<Page, JSX.Element> = {
  dashboard: <DashboardView />,
  reportes: <ReportesView />,
  usuarios: <UsuariosView />,
  cursos: <CursosView />,
  personalizacion: <PersonalizacionView />,
}

export function SuperAdminPage() {
  const [page, setPage] = useState<Page>('dashboard')
  const [logo, setLogo] = useState(() => {
    // Cargar logo desde el servicio de almacenamiento
    return institutionStorageService.getLogo()
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    institutionService
      .getConfig()
      .then((data) => {
        setLogo(data.logo)
        // Guardar en el servicio centralizado de almacenamiento
        institutionStorageService.setLogo(data.logo)
      })
      .catch((error) => {
        // Silenciar errores de autenticación (token expirado)
        const errorMessage = String(error)
        if (!errorMessage.includes('HTTP 401')) {
          console.error('Error loading logo:', error)
        }
      })
  }, [])

  const handleNavigate = (p: Page) => {
    setPage(p)
    setSidebarOpen(false)
  }

  return (
    <div className={`${styles.superAdminContainer} flex h-screen overflow-hidden`} style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar active={page} onNavigate={(page) => handleNavigate(page as Page)} logo={logo} />
      </div>

      {/* Overlay para móvil cuando sidebar está abierta */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300"
          style={{ opacity: sidebarOpen ? 0.50 : 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-all duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        <Sidebar active={page} onNavigate={(page) => handleNavigate(page as Page)} logo={logo} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Header - Mobile Only */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b transition-colors duration-300" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-all duration-300 hover:bg-muted/30 active:scale-90"
            title="Abrir menú"
          >
            {sidebarOpen ? (
              <X size={24} className="transition-transform duration-300 rotate-90" style={{ color: 'var(--color-foreground)' }} />
            ) : (
              <Menu size={24} className="transition-transform duration-300" style={{ color: 'var(--color-foreground)' }} />
            )}
          </button>
          <h1 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
            Profunsoft
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
          {VIEWS[page]}
        </div>
      </main>
    </div>
  )
}
