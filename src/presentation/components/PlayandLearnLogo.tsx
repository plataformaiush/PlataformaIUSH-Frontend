interface LogoProps {
  /** Altura del ícono en px */
  size?: number
  /** 'full' = ícono + texto | 'icon' = solo ícono */
  variant?: 'full' | 'icon'
  /** 'light' = texto blanco (para fondo oscuro) | 'dark' = texto oscuro */
  theme?: 'light' | 'dark'
  className?: string
}

export function PlayandLearnLogo({
  size    = 36,
  variant = 'full',
  theme   = 'light',
  className = '',
}: LogoProps) {
  const textColor  = theme === 'light' ? '#FFFFFF' : '#223740'
  const accentColor = theme === 'light' ? '#84B9BF' : '#58838C'

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>

      {/* ── Ícono ─────────────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pl-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#223740" />
            <stop offset="100%" stopColor="#58838C" />
          </linearGradient>
          <linearGradient id="pl-shine" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fondo redondeado con gradiente */}
        <rect width="44" height="44" rx="11" fill="url(#pl-bg)" />

        {/* Brillo sutil en la parte superior */}
        <rect width="44" height="22" rx="11" fill="url(#pl-shine)" />

        {/* Triángulo de play (izquierda) */}
        <polygon
          points="9,11 9,29 23,20"
          fill="white"
          opacity="0.95"
        />

        {/* Líneas de contenido (derecha) — simulan texto/aprendizaje */}
        <line x1="27" y1="13" x2="38" y2="13" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="27" y1="20" x2="38" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="27" y1="27" x2="34" y2="27" stroke="white" strokeWidth="2.8" strokeLinecap="round" />

        {/* Separador diagonal sutil entre play y líneas */}
        <line x1="24" y1="10" x2="24" y2="30" stroke="white" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />

        {/* Puntos de progreso en la base */}
        <circle cx="12" cy="37" r="2"   fill="#AEEBF2" opacity="0.55" />
        <circle cx="19" cy="37" r="2"   fill="#AEEBF2" opacity="0.75" />
        <circle cx="26" cy="37" r="2"   fill="#AEEBF2" opacity="0.90" />
        <circle cx="33" cy="37" r="2.2" fill="white"  />
      </svg>

      {/* ── Wordmark ──────────────────────────────────────────────── */}
      {variant === 'full' && (
        <div className="flex items-baseline gap-0 leading-none">
          <span
            style={{ color: textColor, fontSize: size * 0.52, letterSpacing: '-0.01em' }}
            className="font-light tracking-tight"
          >
            Play
          </span>
          <span
            style={{ color: accentColor, fontSize: size * 0.34 }}
            className="font-light italic mx-0.5 opacity-90"
          >
            &amp;
          </span>
          <span
            style={{ color: textColor, fontSize: size * 0.52, letterSpacing: '-0.01em' }}
            className="font-extrabold tracking-tight"
          >
            Learn
          </span>
        </div>
      )}
    </div>
  )
}
