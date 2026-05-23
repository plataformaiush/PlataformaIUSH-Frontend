import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Sidebar from '../../../components/shared/sidebar/SideBar'
import Header from '../../../components/shared/header/Header'
import SideBarResponsive from '../../../components/shared/sidebarResponsive/SideBarResponsive'
import { useHiddenNavStore } from '../../../components/shared/sidebar/store/hiddenNavStore'

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const hiddenNav = useHiddenNavStore((state) => state.hiddenNav)
  const setHiddenNav = useHiddenNavStore((state) => state.setHiddenNav)
  const location = useLocation()

  const handleMobileSidebarToggle = () => {
    if (!mobileSidebarOpen) setHiddenNav(false)
    setMobileSidebarOpen((current) => !current)
  }

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className={`hidden h-screen grid-cols-[220px_1fr] grid-rows-[auto_1fr] overflow-hidden transition-[grid-template-columns] duration-300 md:grid ${
          hiddenNav ? 'md:grid-cols-[72px_1fr]' : 'md:grid-cols-[220px_1fr]'
        }`}
      >
        <div className="row-span-2 h-screen overflow-hidden">
          <Sidebar />
        </div>

        <div className="sticky top-0 z-20">
          <Header />
        </div>

        <div className="min-h-0 overflow-y-auto bg-background">
          <Outlet />
        </div>
      </div>

      <div className="flex min-h-screen flex-col md:hidden">
        <div className="fixed top-0 left-0 right-0 z-40">
          <Header onMobileMenuToggle={handleMobileSidebarToggle} mobileMenuOpen={mobileSidebarOpen} />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto bg-background pt-[70px]">
          <Outlet />
        </main>

        <SideBarResponsive isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      </div>
    </div>
  )
}
