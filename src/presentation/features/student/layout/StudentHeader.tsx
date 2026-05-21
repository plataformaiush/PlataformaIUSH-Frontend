import { useEffect, useState } from 'react'
import { Bell, Menu } from 'lucide-react'
import { PlayandLearnLogo } from '@presentation/components/PlayandLearnLogo'

const MOCK_STUDENT = {
  name: 'Ana García',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana',
}

interface StudentHeaderProps {
  onToggle: () => void
}

export function StudentHeader({ onToggle }: StudentHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 h-14 md:hidden',
        'bg-primary text-tertiary',
        'flex items-center justify-between px-4',
        'transition-shadow duration-200',
        scrolled ? 'shadow-lg' : '',
      ].join(' ')}
    >
      {/* Hamburguesa */}
      <button
        onClick={onToggle}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center
                   rounded-full hover:bg-white/10 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={22} className="text-tertiary" />
      </button>

      <PlayandLearnLogo size={34} theme="light" />

      <div className="flex items-center gap-3">
        <button
          className="min-w-[44px] min-h-[44px] flex items-center justify-center
                     rounded-full hover:bg-white/10 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={20} className="text-mid" />
        </button>

        <img
          src={MOCK_STUDENT.avatar}
          alt={`Avatar de ${MOCK_STUDENT.name}`}
          className="w-8 h-8 rounded-full object-cover border-2 border-mid"
        />
      </div>
    </header>
  )
}
