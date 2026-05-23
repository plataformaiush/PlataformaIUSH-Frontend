import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, Settings } from 'lucide-react'
import { useInstitution } from '../../../../context/InstitutionContext'
import { useAuthStore } from '@presentation/stores/auth.store'
import { logoutRequest } from '@presentation/features/student/auth/services/authService'
import logoDefault from '@presentation/components/shared/img/ProfunSoft.png'
import Avatar from '@mui/material/Avatar'
import StudentPersonalization from './StudentPersonalization'

interface StudentNavBarProps {
  onToggle: () => void
  mobileMenuOpen?: boolean
}

const stringAvatar = (name: string) => {
  const nameParts = name.trim().split(/\s+/)
  const firstInitial = nameParts[0]?.[0] ?? 'U'
  const secondInitial = nameParts[1]?.[0] ?? ''

  return {
    sx: {
      bgcolor: 'var(--color-secondary)',
      color: 'var(--color-text-on-dark)',
    },
    children: `${firstInitial}${secondInitial}`.toUpperCase(),
  }
}

export function StudentNavBar({ onToggle, mobileMenuOpen = false }: StudentNavBarProps) {
  const navigate = useNavigate()
  const institution = useInstitution()
  const { logo, colors, updateColors } = institution
  const { user } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userName = user?.nombre || 'Estudiante IUSH'
  const userAvatar = stringAvatar(userName)
  const logoSrc = logo || logoDefault
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [form, setForm] = useState(() => ({
    primary: colors?.primary ?? '#223740',
    secondary: colors?.secondary ?? '#5a878C',
    background: colors?.background ?? '#F8FAFC',
  }))

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      // Intentar logout en servidor
      await logoutRequest()
    } catch (error) {
      console.error('Error durante logout:', error)
    } finally {
      // Limpiar sesión localmente
      useAuthStore.getState().logout()
      // Redirigir a login
      navigate('/login', { replace: true })
    }
  }

  const openCustomizer = () => {
    setForm({
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
    })
    setShowCustomizer(true)
  }

  const handleSaveColors = () => {
    try {
      // Llamar updateColors del contexto
      const ctx = useInstitution()
      const newColors = { ...ctx.colors, primary: form.primary ?? ctx.colors.primary }
      ctx.updateColors(newColors)
      setShowCustomizer(false)
    } catch (e) {
      console.error('Error aplicando colores:', e)
    }
  }

  return (
    <div
      className="flex h-14 md:h-16 items-center justify-between px-3 md:px-4"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-dark)',
      }}
    >
      {/* Logo - Mostrar en mobile cuando menú cerrado, en desktop siempre */}
      {!mobileMenuOpen && (
        <img
          src={logoSrc}
          alt="Logo institución"
          className="max-w-[100px] h-auto max-h-10 md:max-h-12 object-contain"
        />
      )}

      {/* Controles a la derecha */}
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Botón Personalizar colores (solo vista estudiante) */}
        <button
          type="button"
          onClick={openCustomizer}
          className="inline-flex cursor-pointer items-center justify-center rounded-full p-2 transition-all duration-200 hover:opacity-80"
          style={{ color: 'var(--color-text-on-dark)', backgroundColor: 'rgba(255,255,255,0.04)' }}
          aria-label="Personalizar colores"
          title="Personalizar colores"
        >
          <Settings size={18} />
        </button>

        {/* Botón Logout - Visible en desktop siempre, en mobile cuando cierre sesión disponible */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex cursor-pointer select-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-text-on-dark)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }}
          title={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} className="md:size-5" />
        </button>

        {/* Avatar */}
        <Avatar
          {...userAvatar}
          sx={{
            ...userAvatar.sx,
            width: { xs: 30, md: 36 },
            height: { xs: 30, md: 36 },
            fontSize: { xs: 11, md: 13 },
            fontWeight: 700,
            color: 'var(--color-text-on-dark)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        />

        {/* Hamburguesa mobile */}
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center justify-center rounded-full p-2 transition-all duration-200 md:hidden hover:opacity-80"
          style={{ color: 'var(--color-text-on-dark)' }}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <Menu size={20} />
        </button>
       </div>
      {showCustomizer && (
        <StudentPersonalization onClose={() => setShowCustomizer(false)} />
      )}
    </div>
  )
}







