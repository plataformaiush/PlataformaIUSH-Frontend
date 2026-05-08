import { Sparkles, BookCheck, TrendingUp } from 'lucide-react'
import type { StudentStats } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/student/types'

const PHRASES: { text: string; author?: string }[] = [
  { text: 'El secreto para avanzar es empezar.', author: 'Mark Twain' },
  { text: 'No tienes que ser grande para empezar, pero tienes que empezar para ser grande.' },
  { text: 'El mejor momento para empezar era ayer. El segundo mejor momento es ahora.' },
  { text: 'El movimiento crea la motivación. No esperes sentirte listo — empieza.' },
  { text: 'Haz hoy lo que tu yo del futuro te agradecerá.' },
  { text: 'Un pequeño progreso cada día se convierte en un gran resultado.' },
  { text: 'No compitas con los demás — compite con quien eras ayer.' },
]

const CIRC = 2 * Math.PI * 18 // circunferencia r=18

interface RingProps {
  pct: number
  color: string
  icon: React.ReactNode
}

function Ring({ pct, color, icon }: RingProps) {
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg width="48" height="48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r="18" fill="none" stroke={`${color}28`} strokeWidth="4" />
        <circle
          cx="24" cy="24" r="18"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * CIRC} ${CIRC}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {icon}
      </div>
    </div>
  )
}

interface StudentStatsBarProps {
  stats: StudentStats
}

export function StudentStatsBar({ stats }: StudentStatsBarProps) {
  const phrase     = PHRASES[new Date().getDay() % PHRASES.length]
  const completionPct = stats.totalCourses > 0
    ? Math.round((stats.completedCourses / stats.totalCourses) * 100)
    : 0

  return (
    <div className="space-y-3">

      {/* Frase motivadora */}
      <div className="flex gap-3 items-start px-4 py-3.5 rounded-2xl
                      bg-primary/5 border border-primary/10">
        <Sparkles size={16} className="text-secondary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-primary italic leading-relaxed">
            "{phrase.text}"
          </p>
          {phrase.author && (
            <p className="text-xs text-secondary mt-1 not-italic font-medium">
              — {phrase.author}
            </p>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">

        {/* Cursos completados */}
        <div className="flex items-center gap-3 p-4 rounded-2xl
                        bg-surface border border-mid/20 shadow-sm">
          <Ring
            pct={completionPct}
            color="#223740"
            icon={<BookCheck size={16} className="text-primary" />}
          />
          <div className="min-w-0">
            <p className="text-xl font-black text-primary leading-none">
              {stats.completedCourses}
              <span className="text-sm font-semibold text-secondary">
                /{stats.totalCourses}
              </span>
            </p>
            <p className="text-[11px] text-secondary mt-0.5 leading-tight">
              Cursos completados
            </p>
          </div>
        </div>

        {/* Avance promedio */}
        <div className="flex items-center gap-3 p-4 rounded-2xl
                        bg-surface border border-mid/20 shadow-sm">
          <Ring
            pct={stats.avgProgress}
            color="#58838C"
            icon={<TrendingUp size={16} className="text-secondary" />}
          />
          <div className="min-w-0">
            <p className="text-xl font-black text-primary leading-none">
              {stats.avgProgress}
              <span className="text-sm font-semibold text-secondary">%</span>
            </p>
            <p className="text-[11px] text-secondary mt-0.5 leading-tight">
              Avance promedio
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
