import { useHiddenNavStore } from '../sidebar/store/hiddenNavStore'
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

  const { hiddenNav } = useHiddenNavStore()
  const { logo } = useInstitution()

  const showLogo = onMobileMenuToggle ? !mobileMenuOpen : hiddenNav

  const user = tokenManager.getUser() as { nombre?: string } | null
  const userName = user?.nombre ?? 'Usuario IUSH'
  const userAvatar = stringAvatar(userName)
  const logoSrc = logo || logoDefault

  return (
    <div className='flex h-[70px] items-center justify-between px-3 md:px-4'
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-dark)'
      }}
    >
      {showLogo && (
        <img
          src={logoSrc}
          alt="Institution logo"
          className="w-17 max-w-[108px] object-contain"
        />
      )}

      <Stack direction="row" spacing={0.75} sx={{ marginLeft: 'auto', alignItems: 'center' }}>
        <button
          type="button"
          aria-label="Configuración"
          className="inline-flex cursor-pointer items-center justify-center rounded-full p-2 transition-colors hover:opacity-80"
          style={{
            color: 'var(--color-text-on-dark)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }}
        >
          <SettingsIcon sx={{ fontSize: 18 }} />
        </button>

        <Avatar {...userAvatar}
          sx={{
            ...userAvatar.sx,
            width: { xs: 30, md: 34 },
            height: { xs: 30, md: 34 },
            fontSize: { xs: 12, md: 13 },
            fontWeight: 700,
            color: 'var(--color-text-on-dark)'
          }}
        />

        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex items-center justify-center rounded-full p-2 transition-colors hover:opacity-80 md:hidden"
            style={{ color: 'var(--color-text-on-dark)' }}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <MenuOpenIcon
              sx={{ fontSize: 28 }}
              className={`${mobileMenuOpen ? 'rotate-180' : ''} transition-transform duration-300`}
            />
          </button>
        )}
      </Stack>
    </div>
  )
}

export default Header
