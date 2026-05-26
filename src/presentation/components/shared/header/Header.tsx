import { useInstitution } from '../../../../context/InstitutionContext'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import SettingsIcon from '@mui/icons-material/Settings'
import logoDefault from '../img/ProfunSoft.png'
import { tokenManager } from '../../../../presentation/services/tokenManager'

interface HeaderProps{
  onMobileMenuToggle?: () => void
  mobileMenuOpen?: boolean
}

const stringAvatar = (name: string) => {
  const nameParts = name.trim().split(/\s+/)
  const firstInitial = nameParts[0]?.[0] ?? 'U'
  const secondInitial = nameParts[1]?.[0] ?? ''

  return {
    sx: {
      bgcolor: 'var(--color-secondary)',
      color: 'var(--color-text-on-dark)'
    },
    children: `${firstInitial}${secondInitial}`.toUpperCase(),
  }
}

const Header = ({ onMobileMenuToggle, mobileMenuOpen = false }: HeaderProps) => {

  const { logo } = useInstitution()

  const showLogo = false

  const user = tokenManager.getUser() as { nombre?: string } | null
  const userName = user?.nombre ?? 'Usuario IUSH'
  const userAvatar = stringAvatar(userName)
  const logoSrc = logo || logoDefault

  return (
    <div className='flex h-[70px] items-center justify-between px-4 md:px-6'
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-dark)'
      }}
    >
      {showLogo && (
        <img
          src={logoSrc}
          alt="Institution logo"
          className="h-10 w-auto object-contain"
        />
      )}

      <Stack direction="row" spacing={2} sx={{ marginLeft: 'auto', alignItems: 'center' }}>
        <button
          type="button"
          aria-label="Configuración"
          className="inline-flex cursor-pointer items-center justify-center rounded-xl p-2.5 transition-all hover:opacity-80"
          style={{
            color: 'var(--color-text-on-dark)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <SettingsIcon sx={{ fontSize: 20 }} />
        </button>

        <Avatar {...userAvatar}
          sx={{
            ...userAvatar.sx,
            width: { xs: 36, md: 40 },
            height: { xs: 36, md: 40 },
            fontSize: { xs: 13, md: 14 },
            fontWeight: 700,
            color: 'var(--color-text-on-dark)'
          }}
        />

        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex items-center justify-center rounded-xl p-2.5 transition-all hover:opacity-80 md:hidden"
            style={{ color: 'var(--color-text-on-dark)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <MenuOpenIcon
              sx={{ fontSize: 24 }}
              className={`${mobileMenuOpen ? 'rotate-180' : ''} transition-transform duration-300`}
            />
          </button>
        )}
      </Stack>
    </div>
  )
}

export default Header
