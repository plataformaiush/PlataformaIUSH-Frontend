import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Tooltip from '@mui/material/Tooltip'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { HelpCircle, LogOut } from 'lucide-react'

import { useHiddenNavStore } from './store/hiddenNavStore'
import { useAuthStore } from '../../../stores/auth.store'
import { useInstitution } from '../../../../context/InstitutionContext'
import { definedSectionRole } from './components/SidebarSections'
import { type Section, type SidebarProps } from './types/Sidebar.types'
import logoDefault from '../img/ProfunSoft.png'

const Sidebar = ({ showToggle = true }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { hiddenNav, toggleHiddenNav } = useHiddenNavStore()
  const logout = useAuthStore((state) => state.logout)
  const { logo } = useInstitution()

  const logoSrc = logo || logoDefault
  const getUserStorage = JSON.parse(localStorage.getItem('user') ?? 'null') ?? {}
  const { roles, nombre } = getUserStorage as { roles?: string[]; nombre?: string }
  const avatarUrl = `https://api.dicebear.com/9.x/icons/svg?seed=Jessica`

  const [sections, setSections] = useState<Section[]>([])
  const [selected, setSelected] = useState('Dashboard')

  useEffect(() => {
    const sectionByRol = definedSectionRole()
    setSections(sectionByRol)
    const current = sectionByRol.find(s => location.pathname.startsWith(s.path))
    if (current) setSelected(current.label)
  }, [location.pathname])

  const handleNav = (label: string, path: string) => {
    setSelected(label)
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* ── HEADER ── */}
      <div className={`flex shrink-0 items-center w-full p-4 ${hiddenNav ? 'justify-center' : 'justify-between'}`}>
        {!hiddenNav && (
          <div className="flex flex-1 justify-center">
            <img src={logoSrc} alt="Logo Institucional" className="h-10 w-auto object-contain" />
          </div>
        )}
        {showToggle && (
          <button
            onClick={toggleHiddenNav}
            className="p-2 rounded-xl transition-all hover:opacity-80 shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-on-dark)' }}
            aria-label={hiddenNav ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <MenuOpenIcon
              sx={{ fontSize: 24 }}
              className={`${hiddenNav ? 'rotate-180' : ''} transition-transform duration-300`}
            />
          </button>
        )}
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {sections.map((v, i) => {
          const isActive = selected === v.label
          return (
            <Tooltip
              key={i}
              describeChild
              arrow
              title={v.label}
              placement="right"
              disableHoverListener={!hiddenNav}
            >
              <div
                onClick={() => handleNav(v.label, v.path)}
                className={`flex items-center px-3 py-2.5 mx-1 mb-0.5 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white/15 shadow-sm'
                    : 'hover:bg-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className="flex items-center shrink-0"
                  style={{ color: isActive ? 'var(--color-text-on-dark)' : 'rgba(255,255,255,0.8)' }}
                >
                  {v.icon}
                </div>
                {!hiddenNav && (
                  <span
                    className="text-sm font-semibold px-3 truncate"
                    style={{ color: isActive ? 'var(--color-text-on-dark)' : 'rgba(255,255,255,0.8)' }}
                  >
                    {v.label}
                  </span>
                )}
              </div>
            </Tooltip>
          )
        })}
      </nav>

      {/* ── FOOTER ── */}
      <div
        className="shrink-0 px-3 pb-4 pt-4 space-y-1"
        style={{ borderTopColor: 'rgba(255,255,255,0.1)', borderTopWidth: '1px' }}
      >
        <Tooltip describeChild title="Ayuda" arrow placement="right" disableHoverListener={!hiddenNav}>
          <button
            aria-label="Ayuda"
            className={`flex items-center w-full rounded-xl text-sm font-medium transition-all hover:bg-white/10 ${
              hiddenNav ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'
            }`}
            style={{ color: 'var(--color-text-on-dark)' }}
          >
            <HelpCircle size={18} className="shrink-0" />
            {!hiddenNav && <span>Ayuda</span>}
          </button>
        </Tooltip>

        <Tooltip describeChild title="Cerrar sesión" arrow placement="right" disableHoverListener={!hiddenNav}>
          <button
            aria-label="Cerrar sesión"
            onClick={handleLogout}
            className={`flex items-center w-full rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-red-500/20 ${
              hiddenNav ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'
            }`}
            style={{ color: 'var(--color-text-on-dark)' }}
          >
            <LogOut size={18} className="shrink-0" />
            {!hiddenNav && <span>Cerrar sesión</span>}
          </button>
        </Tooltip>

        <div
          className={`flex items-center px-3 py-3 mt-1 rounded-xl transition-all hover:opacity-90 cursor-default ${
            hiddenNav ? 'justify-center' : 'gap-3'
          }`}
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <img
            src={avatarUrl}
            alt={nombre}
            className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{ borderColor: 'var(--color-tertiary)', borderWidth: '2px' }}
          />
          {!hiddenNav && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-on-dark)' }}>
                {nombre}
              </p>
              <p className="text-xs opacity-70" style={{ color: 'var(--color-text-on-dark)' }}>
                {roles?.[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
