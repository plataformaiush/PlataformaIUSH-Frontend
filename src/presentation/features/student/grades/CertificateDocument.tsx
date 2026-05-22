import { Award, Star } from 'lucide-react'
import { PlayandLearnLogo } from '@presentation/components/PlayandLearnLogo'

interface CertificateDocumentProps {
  studentName: string
  courseName: string
  completionDate: string
  hours: number
  courseId: string
}

const CERTIFICATE_COLORS: Record<string, { accent: string; light: string }> = {
  '2': { accent: '#E53E6D', light: '#fce7ef' },   // Diseño UX/UI
  default: { accent: 'var(--color-primary)', light: 'var(--color-tertiary)' },
}

export function CertificateDocument({
  studentName,
  courseName,
  completionDate,
  hours,
  courseId,
}: CertificateDocumentProps) {
  const palette = CERTIFICATE_COLORS[courseId] ?? CERTIFICATE_COLORS.default

  return (
    <div
      id="certificate-print"
      className="relative w-full bg-white overflow-hidden"
      style={{
        minHeight: 480,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        border: `3px solid ${palette.accent}`,
        borderRadius: 16,
      }}
    >
      {/* Banda superior */}
      <div
        className="h-3 w-full"
        style={{ background: `linear-gradient(90deg, var(--color-primary), ${palette.accent}, var(--color-tertiary))` }}
      />

      {/* Esquinas decorativas */}
      <Corner pos="top-left"    color={palette.accent} />
      <Corner pos="top-right"   color={palette.accent} />
      <Corner pos="bottom-left" color={palette.accent} />
      <Corner pos="bottom-right"color={palette.accent} />

      {/* Estrellas de fondo */}
      {[
        { top: '12%',  left: '5%',  size: 14, op: 0.12 },
        { top: '20%',  left: '90%', size: 10, op: 0.10 },
        { top: '70%',  left: '8%',  size: 12, op: 0.10 },
        { top: '80%',  left: '92%', size: 16, op: 0.12 },
        { top: '45%',  left: '2%',  size: 8,  op: 0.08 },
        { top: '50%',  left: '96%', size: 9,  op: 0.08 },
      ].map((s, i) => (
        <Star
          key={i}
          size={s.size}
          className="absolute"
          style={{ top: s.top, left: s.left, color: palette.accent, opacity: s.op, fill: palette.accent }}
        />
      ))}

      {/* Contenido central */}
      <div className="flex flex-col items-center text-center px-8 md:px-16 py-8 gap-4">

        {/* Encabezado institución */}
        <div className="flex items-center gap-2.5 mb-1">
          <PlayandLearnLogo size={38} theme="dark" variant="full" />
        </div>

        {/* Título del certificado */}
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-1"
            style={{ color: palette.accent }}
          >
            Certificado de finalización
          </p>
          <h1 className="text-lg md:text-xl font-black text-primary leading-tight">
            OTORGADO A
          </h1>
        </div>

        {/* Nombre del estudiante */}
        <div className="py-2 px-10 rounded-xl" style={{ background: palette.light }}>
          <p
            className="text-2xl md:text-3xl font-black tracking-wide"
            style={{ color: palette.accent }}
          >
            {studentName}
          </p>
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px" style={{ background: `${palette.accent}30` }} />
          <Award size={18} style={{ color: palette.accent }} />
          <div className="flex-1 h-px" style={{ background: `${palette.accent}30` }} />
        </div>

        {/* Por completar */}
        <div>
          <p className="text-xs text-secondary mb-1">Por haber completado satisfactoriamente</p>
          <p className="text-base md:text-lg font-bold text-primary leading-snug max-w-sm">
            "{courseName}"
          </p>
        </div>

        {/* Horas */}
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full"
          style={{ background: `${palette.accent}15`, color: palette.accent }}
        >
          <Star size={12} fill={palette.accent} />
          {hours} horas de formación
        </div>

        {/* Pie: fecha y firma */}
        <div className="flex justify-between w-full max-w-sm mt-2 pt-4"
             style={{ borderTop: `1px solid ${palette.accent}20` }}>
          <div className="text-left">
            <p className="text-[10px] text-secondary uppercase tracking-wider">Fecha</p>
            <p className="text-xs font-bold text-primary">{completionDate}</p>
          </div>
          <div className="text-right">
            <div
              className="w-20 h-0.5 mb-1 ml-auto"
              style={{ background: '#223740' }}
            />
            <p className="text-[10px] text-secondary uppercase tracking-wider">Director académico</p>
            <p className="text-xs font-bold text-primary">J.D. Fernández M.</p>
          </div>
        </div>

        {/* ID de verificación */}
        <p className="text-[9px] text-mid font-mono mt-1">
          ID: IUSH-{courseId.toUpperCase()}-{Date.now().toString(36).toUpperCase()}
        </p>
      </div>

      {/* Banda inferior */}
      <div
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, var(--color-tertiary), ${palette.accent}, var(--color-primary))` }}
      />
    </div>
  )
}

/* ── Esquina decorativa ─────────────────────────────────────────────────── */
function Corner({ pos, color }: { pos: string; color: string }) {
  const isTop    = pos.includes('top')
  const isLeft   = pos.includes('left')
  return (
    <div
      className="absolute w-8 h-8"
      style={{
        top:    isTop    ? 12 : undefined,
        bottom: !isTop   ? 12 : undefined,
        left:   isLeft   ? 12 : undefined,
        right:  !isLeft  ? 12 : undefined,
        borderTop:    isTop    ? `2px solid ${color}` : undefined,
        borderBottom: !isTop   ? `2px solid ${color}` : undefined,
        borderLeft:   isLeft   ? `2px solid ${color}` : undefined,
        borderRight:  !isLeft  ? `2px solid ${color}` : undefined,
        opacity: 0.5,
      }}
    />
  )
}
