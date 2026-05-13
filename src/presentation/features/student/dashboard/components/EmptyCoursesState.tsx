import { BookOpen, Compass, Sparkles } from 'lucide-react'
import type { EnrolledCourse } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/student/types'

/* Cursos de demo que se cargan al hacer clic en "Explorar catálogo" */
export const DEMO_COURSES: EnrolledCourse[] = [
  {
    id: '1',
    title: 'Introducción a la Programación con Python',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80',
    progress: 65,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    title: 'Diseño UX/UI: Principios Fundamentales',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
    progress: 100,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    title: 'Bases de Datos Relacionales con SQL',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80',
    progress: 30,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '4',
    title: 'Desarrollo Web con React y TypeScript',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80',
    progress: 0,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '5',
    title: 'Marketing Digital y Redes Sociales',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80',
    progress: 85,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: '6',
    title: 'Estadística Aplicada para Negocios',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    progress: 45,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
]

interface EmptyCoursesStateProps {
  onEnroll: () => void
}

export function EmptyCoursesState({ onEnroll }: EmptyCoursesStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">

      {/* Ilustración */}
      <div className="relative mb-8">
        {/* Círculo exterior decorativo */}
        <div className="w-40 h-40 rounded-full bg-primary/8 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-primary/12 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <BookOpen size={36} className="text-tertiary" />
            </div>
          </div>
        </div>

        {/* Destellos decorativos */}
        <span className="absolute top-2 right-2 text-tertiary opacity-70">
          <Sparkles size={20} />
        </span>
        <span className="absolute bottom-4 left-0 text-secondary opacity-60">
          <Sparkles size={14} />
        </span>
      </div>

      {/* Texto principal */}
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
        Aún no tienes cursos
      </h2>
      <p className="text-secondary text-sm md:text-base max-w-sm leading-relaxed mb-2">
        No has seleccionado ningún curso todavía. Explora el catálogo y empieza tu
        camino de aprendizaje hoy.
      </p>
      <p className="text-mid text-xs md:text-sm max-w-xs mb-8">
        Una vez matriculado, tus cursos en progreso aparecerán aquí.
      </p>

      {/* CTA */}
      <button
        onClick={onEnroll}
        className="flex items-center gap-2.5 min-h-[48px] px-8 rounded-2xl
                   bg-primary text-tertiary font-semibold text-base
                   hover:bg-secondary active:scale-95 transition-all duration-200
                   shadow-lg shadow-primary/25"
      >
        <Compass size={20} />
        Explorar catálogo
      </button>

      {/* Features mini-list */}
      <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-md">
        {[
          { emoji: '🎯', label: 'A tu ritmo' },
          { emoji: '📱', label: 'Desde cualquier dispositivo' },
          { emoji: '🏆', label: 'Certificado al terminar' },
        ].map(({ emoji, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">{emoji}</span>
            <span className="text-[11px] md:text-xs text-secondary text-center font-medium leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
