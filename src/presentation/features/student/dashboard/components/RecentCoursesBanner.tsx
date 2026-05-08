import { ArrowRight, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CourseProgressBar } from './CourseProgressBar'
import type { EnrolledCourse } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/student/types'

interface RecentCoursesBannerProps {
  courses: EnrolledCourse[]
}

export function RecentCoursesBanner({ courses }: RecentCoursesBannerProps) {
  const navigate = useNavigate()

  if (courses.length === 0) return null

  return (
    <section aria-labelledby="recent-heading">
      <h2
        id="recent-heading"
        className="text-base md:text-lg font-bold text-primary mb-3"
      >
        Continuar aprendiendo
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => navigate(`/student/courses/${course.id}`)}
            className="flex-1 flex items-center gap-3 p-3 md:p-4
                       bg-primary rounded-2xl text-left
                       hover:bg-primary/90 active:scale-[0.98]
                       transition-all duration-150 min-h-[72px]"
            aria-label={`Continuar ${course.title}, ${course.progress}% completado`}
          >
            {/* Thumbnail pequeño */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 bg-secondary/20">
              <img
                src={course.thumbnail}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-sm font-semibold text-tertiary line-clamp-1">
                {course.title}
              </p>
              <CourseProgressBar value={course.progress} />
            </div>

            {/* Ícono continuar */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-tertiary/20
                            flex items-center justify-center">
              {course.progress > 0
                ? <Play size={14} className="text-tertiary translate-x-0.5" />
                : <ArrowRight size={14} className="text-tertiary" />
              }
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
