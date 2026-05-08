import { ArrowRight } from 'lucide-react'
import { CourseProgressBar } from './CourseProgressBar'
import { CompletionBadge } from './CompletionBadge'
import type { EnrolledCourse } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/student/types'

interface CourseCardProps {
  course: EnrolledCourse
  onClick: () => void
  onCertificate?: () => void
}

export function CourseCard({ course, onClick, onCertificate }: CourseCardProps) {
  const isComplete = course.progress === 100

  return (
    <article
      className="bg-surface rounded-2xl overflow-hidden shadow-sm flex flex-col
                 border border-mid/20 cursor-pointer
                 hover:shadow-md hover:shadow-primary/10
                 active:scale-[0.98] transition-all duration-200"
      onClick={onClick}
      aria-label={`Curso: ${course.title}`}
    >
      {/* Thumbnail 16:9 */}
      <div className="aspect-video w-full overflow-hidden bg-primary/10">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-3 md:p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm md:text-base font-semibold text-primary line-clamp-2 leading-snug min-h-[2.5rem] md:min-h-[3rem]">
          {course.title}
        </h3>

        <CourseProgressBar value={course.progress} />

        <div className="mt-auto" onClick={e => e.stopPropagation()}>
          {isComplete ? (
            <CompletionBadge onClick={onCertificate} />
          ) : (
            <button
              onClick={onClick}
              className="w-full min-h-[44px] flex items-center justify-center gap-2
                         bg-primary text-tertiary font-medium text-sm rounded-xl
                         hover:bg-secondary active:scale-95 transition-all duration-150"
            >
              Ver curso
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
