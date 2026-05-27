import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { StudentNavBar } from './StudentNavBar'
import { StudentSidebar } from './StudentSidebar'
import { StudentBottomNav } from './StudentBottomNav'
import { useHandleRolTracker } from '../../reports/hooks/useHandleRolTracker'

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggle = () => setSidebarOpen(o => !o)

  useHandleRolTracker()

  return (
    <div className="min-h-screen bg-surface-muted">
      <StudentSidebar isOpen={sidebarOpen} onToggle={toggle} />
      <StudentNavBar onToggle={toggle} mobileMenuOpen={sidebarOpen} />

      <main
        className={[
          'w-full pt-14 md:pt-16 pb-20 md:pb-0',
          'overflow-v-auto h-screen',
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
