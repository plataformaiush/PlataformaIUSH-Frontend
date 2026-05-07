import { LayoutDashboard, TrendingUp, Users, BookOpen, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  active: string
  onNavigate: (page: string) => void
  logo?: string
}

const navItems = [
  {
    section: 'PRINCIPAL',
    items: [
      { id: 'dashboard', label: 'Panel de control', icon: LayoutDashboard },
      { id: 'reportes', label: 'Reportes', icon: TrendingUp },
    ],
  },
  {
    section: 'GESTIÓN',
    items: [
      { id: 'usuarios', label: 'Usuarios', icon: Users },
      { id: 'cursos', label: 'Cursos', icon: BookOpen },
    ],
  },
  {
    section: 'CONFIGURACIÓN',
    items: [
      { id: 'personalizacion', label: 'Personalización', icon: Settings },
    ],
  },
]

export function Sidebar({ active, onNavigate, logo }: SidebarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }
  return (
    <aside className="w-48 min-w-[192px] h-screen border-r flex flex-col px-3 py-4 shadow-lg transition-shadow duration-300" 
      style={{ 
        backgroundColor: 'var(--color-primary)',
        borderColor: 'var(--color-border)',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)'
      }}>
      <div className="flex items-center gap-3 px-2 mb-6">
        {logo ? (
          <div className="p-1 rounded-lg" style={{ backgroundColor: 'var(--color-muted)', border: '2px solid var(--color-border)' }}>
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        ) : (
          <div className="w-16 h-16 flex items-center justify-center rounded-lg\" style={{ backgroundColor: 'var(--color-text-on-dark)', opacity: 0.2 }}>
            <span className="text-xs font-bold" style={{ color: 'var(--color-text-on-dark)' }}>SA</span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-on-dark)' }}>Profunsoft</p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-on-dark)', opacity: 0.7 }}>Super Admin</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ section, items }) => (
          <div key={section} className="mb-3">
            <p className="text-[10px] font-semibold px-2 mb-1 tracking-widest" style={{ color: 'var(--color-text-on-dark)', opacity: 0.6 }}>
              {section}
            </p>
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 font-medium active:scale-95"
                style={active === id ? {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  color: 'var(--color-text-on-dark)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)'
                } : {
                  color: 'var(--color-text-on-dark)',
                  opacity: 0.8
                }}
              >
                <Icon size={16} className="transition-all duration-300 group-hover:scale-110" />
                <span className="transition-colors duration-300">{label}</span>
                {active === id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-muted)' }} />}
              </button>
            ))}
          </div>
        ))}
      </nav>

        <div className="border-t pt-3 px-2 transition-all duration-300 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
          <button className="group w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 active:scale-95" style={{ color: 'var(--color-text-on-dark)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110\" style={{ backgroundColor: 'var(--color-text-on-dark)' }}>
              <span className="text-[10px] font-bold" style={{ color: 'var(--color-foreground)' }}>AD</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold transition-colors duration-300" style={{ color: 'var(--color-text-on-dark)' }}>Admin</p>
              <p className="text-[10px] transition-colors duration-300" style={{ color: 'var(--color-text-on-dark)' }}>Super Admin</p>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-text-on-dark)' }} />
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 hover:bg-red-500/30 active:scale-95"
            style={{ color: 'var(--color-text-on-dark)'}}
            title="Cerrar sesión"
          >
            <LogOut size={16} className="transition-all duration-300 group-hover:scale-110" />
            <span className="text-xs font-medium">Cerrar sesión</span>
          </button>
        </div>
    </aside>
  )
}
