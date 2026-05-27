import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Award, HelpCircle, LogOut, Bell, X } from 'lucide-react'
import { PlayandLearnLogo } from '@presentation/components/PlayandLearnLogo'
import { useAuthStore } from '../../../stores/auth.store'
import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/student/grades',    label: 'Certificados', icon: Award },
]

const MOCK_STUDENT = {
  name: 'Ana García',
  role: 'Estudiante',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana',
}

interface StudentSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function StudentSidebar({ isOpen, onToggle }: StudentSidebarProps) {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral/40 z-30 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed left-0 top-0 h-full w-56 bg-surface border-r border-mid/20',
          'flex flex-col z-40',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* ── Logo ───────────────────────────────────────────── */}
        <div className="px-4 pt-6 pb-5 border-b border-mid/20 flex items-start justify-between">
          <div>
            <PlayandLearnLogo size={36} theme="dark" variant="full" />
            <p className="text-[11px] text-mid mt-1.5 pl-11.5">Educational Portal</p>
          </div>
          <button
            onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-mid hover:bg-primary/5 hover:text-primary
                       transition-colors mt-1 shrink-0"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav principal ──────────────────────────────────── */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Navegación principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors',
                  isActive
                    ? 'font-semibold text-primary bg-tertiary/30 border-r-2 border-primary'
                    : 'font-medium text-secondary hover:bg-primary/5',
                ].join(' ')
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Sección inferior ───────────────────────────────── */}
        <div className="shrink-0 px-3 pb-5 space-y-0.5 border-t border-mid/20 pt-4">
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-secondary hover:bg-primary/5 transition-colors w-full text-left"
          >
            <Bell size={16} />
            Notificaciones
          </button>
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-secondary hover:bg-primary/5 transition-colors w-full text-left"
          >
            <HelpCircle size={16} />
            Ayuda
          </button>
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-secondary hover:bg-red-50 hover:text-red-500
                       transition-colors w-full text-left"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>

          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg
                          bg-surface-muted border border-mid/20 cursor-pointer
                          hover:border-secondary/30 transition-colors">
            <img
              src={MOCK_STUDENT.avatar}
              alt={MOCK_STUDENT.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-mid/30 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{MOCK_STUDENT.name}</p>
              <p className="text-[11px] text-mid">{MOCK_STUDENT.role}</p>
            </div>
          </div>
        </div>
      </aside>

    </>
  )
}
