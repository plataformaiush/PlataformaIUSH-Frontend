import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Award, User } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/student/dashboard', label: 'Inicio',  icon: LayoutDashboard },
  { to: '/student/grades',    label: 'Logros',  icon: Award },
  { to: '/student/profile',   label: 'Perfil',  icon: User },
]

export function StudentBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                 bg-surface border-t border-mid/15"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch justify-around h-16">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-1',
                'min-w-[44px] flex-1 px-1',
                'text-[10px] font-medium transition-colors duration-150',
                isActive ? 'text-primary' : 'text-mid',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex items-center justify-center w-9 h-9 rounded-xl transition-colors',
                    isActive ? 'bg-tertiary/25 text-primary' : 'text-mid',
                  ].join(' ')}
                >
                  <Icon size={20} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
