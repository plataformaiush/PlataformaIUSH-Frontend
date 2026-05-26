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
        <div className="h-screen overflow-hidden bg-slate-100">

            {/* ── Desktop layout ── */}
            <div className="hidden h-full md:flex overflow-hidden">

                {/* Sidebar */}
                <div className={`flex-shrink-0 h-full overflow-hidden transition-all duration-300 ${hiddenNav ? 'w-[72px]' : 'w-[220px]'}`}>
                    <Sidebar />
                </div>

                {/* Contenido principal */}
                <div className="flex flex-1 flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex-shrink-0 h-[70px] z-20">
                        <Header />
                    </div>

                    {/* Outlet — único scroll */}
                    <div className="flex-1 overflow-y-auto bg-slate-100">
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* ── Mobile layout ── */}
            <div className="flex h-full flex-col md:hidden">
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
