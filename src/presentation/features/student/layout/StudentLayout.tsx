import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Bell, Menu, Settings } from 'lucide-react'
import { StudentHeader } from './StudentHeader'
import { StudentSidebar } from './StudentSidebar'
import { StudentBottomNav } from './StudentBottomNav'
import { useHandleRolTracker } from '../../reports/hooks/useHandleRolTracker'

const MOCK_AVATAR = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana'

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggle = () => setSidebarOpen(o => !o)

  useHandleRolTracker()

  return (
    <div className="min-h-screen bg-surface-muted">
      <StudentSidebar isOpen={sidebarOpen} onToggle={toggle} />
      <StudentHeader onToggle={toggle} />

      {/* ── Barra superior desktop ──────────────────────────────────────── */}
      <div
        className={[
          'hidden md:flex fixed top-0 right-0 z-30 h-12',
          'items-center px-4 gap-1 bg-surface-muted',
          'transition-all duration-300',
          sidebarOpen ? 'left-56' : 'left-0',
        ].join(' ')}
      >
        {/* Hamburguesa — solo cuando el sidebar está cerrado */}
        {!sidebarOpen && (
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       bg-surface border border-mid/20 shadow-sm
                       text-secondary hover:text-primary hover:border-secondary/30
                       transition-all duration-200 shrink-0"
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Controles globales — siempre a la derecha */}
        <div className="ml-auto flex items-center gap-1">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
            aria-label="Notificaciones"
          >
            <Bell size={18} />
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
            aria-label="Configuración"
          >
            <Settings size={18} />
          </button>
          <img
            src={MOCK_AVATAR}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border-2 border-mid/20
                       cursor-pointer hover:border-secondary/40 transition-colors ml-1"
          />
        </div>
      </div>

      <main
        className={[
          'w-full pt-14 md:pt-12 pb-20 md:pb-0',
          'transition-all duration-300',
          sidebarOpen ? 'md:ml-56 md:w-[calc(100%-224px)]' : 'md:ml-0',
        ].join(' ')}
      >
        <Outlet />
      </main>
      <StudentBottomNav />
    </div>
  )
}
