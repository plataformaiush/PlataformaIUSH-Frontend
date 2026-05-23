import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Sidebar from './presentation/components/shared/sidebar/SideBar'
import Header from './presentation/components/shared/header/Header'
import SideBarResponsive from './presentation/components/shared/sidebarResponsive/SideBarResponsive'

import { useHiddenNavStore } from './presentation/components/shared/sidebar/store/hiddenNavStore'
import { useHandleRolTracker } from './presentation/features/reports/hooks/useHandleRolTracker'

const ProfunSoft = () => {

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const hiddenNav = useHiddenNavStore((state) => state.hiddenNav)
    const setHiddenNav = useHiddenNavStore((state) => state.setHiddenNav)
    const location = useLocation()

    useHandleRolTracker() //Trackeamos el rol más usado.

    const handleMobileSidebarToggle = () => {

        if (!mobileSidebarOpen) setHiddenNav(false);

        setMobileSidebarOpen((current) => !current)
    }

    useEffect(() => {
        //Cerrar el sidebar móvil automáticamente cuando cambie la ruta
        setMobileSidebarOpen(false)
    }, [location.pathname])

    return (
        <div className="min-h-screen overflow-hidden bg-slate-100">
            <div className={`hidden h-screen grid-cols-[220px_1fr] grid-rows-[auto_1fr] overflow-hidden transition-[grid-template-columns] duration-300 md:grid ${hiddenNav ? 'md:grid-cols-[72px_1fr]' : 'md:grid-cols-[220px_1fr]'}`}>
                {/* Sidebar */}
                <div className="row-span-2 h-screen overflow-hidden">
                    <Sidebar />
                </div>

                {/* Header */}
                <div className="sticky top-0 z-20">
                    <Header />
                </div>

                {/* Outlet */}
                <div className="min-h-0 overflow-y-auto bg-slate-100">
                    <Outlet />
                </div>
            </div>

            <div className="flex min-h-screen flex-col md:hidden">
                <div className="fixed top-0 left-0 right-0 z-40">
                    <Header onMobileMenuToggle={handleMobileSidebarToggle}
                        mobileMenuOpen={mobileSidebarOpen}
                    />
                </div>

                <main className="min-h-0 flex-1 overflow-y-auto bg-slate-100 pt-[70px]">
                    <Outlet />
                </main>

                <SideBarResponsive isOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                />
            </div>
        </div>
    )
}

export default ProfunSoft
