import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Award, Download, X, Trophy, BookOpen, ChevronRight } from 'lucide-react'
import { useStudentProgressStore } from '../../../stores/studentProgressStore'
import { CertificateDocument } from './CertificateDocument'
import { DEMO_COURSES } from '../dashboard/components/EmptyCoursesState'
import { trackCertificadoObtenido } from '../../reports/events/TagManagerEvents'

const STUDENT_NAME = 'Ana García'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const COURSE_HOURS: Record<string, number> = {
  '1': 40, '2': 32, '3': 48, '4': 60, '5': 24, '6': 36,
}

interface CertModalProps {
  courseId: string
  courseName: string
  completionDate: string
  onClose: () => void
}

function CertificateModal({ courseId, courseName, completionDate, onClose }: CertModalProps) {
  const hours = COURSE_HOURS[courseId] ?? 30

  const handlePrint = () => {
    trackCertificadoObtenido(courseName) //Trackeamos la función de descargar certificado

    const el = document.getElementById('certificate-print')
    if (!el) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!doctype html><html><head>
        <meta charset="UTF-8"/>
        <title>Certificado — ${courseName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: white; display: flex; justify-content: center;
                 align-items: center; min-height: 100vh;
                 font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
          @media print { body { margin: 0; } }
        </style>
      </head><body>
        ${el.outerHTML}
      </body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-neutral/70 backdrop-blur-sm
                 flex items-end md:items-center md:justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col bg-surface-muted w-full max-h-[95dvh]
                   rounded-t-2xl md:rounded-2xl
                   md:w-[90vw] md:max-w-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary shrink-0">
          <span className="text-sm font-semibold text-tertiary">Tu certificado</span>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center
                       rounded-full hover:bg-white/10 text-mid hover:text-tertiary transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificado */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <CertificateDocument
            studentName={STUDENT_NAME}
            courseName={courseName}
            completionDate={completionDate}
            hours={hours}
            courseId={courseId}
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-3 px-4 py-3 border-t border-mid/20 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px]
                       rounded-xl bg-primary text-tertiary font-semibold text-sm
                       hover:bg-secondary active:scale-95 transition-all"
          >
            <Download size={18} />
            Descargar / Imprimir
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function StudentGradesPage() {
  const navigate = useNavigate()
  const enrolledCourses = useStudentProgressStore(s => s.enrolledCourses)
  const [activeCert, setActiveCert] = useState<{
    courseId: string; courseName: string; date: string
  } | null>(null)

  const completedCourses = (enrolledCourses.length > 0 ? enrolledCourses : DEMO_COURSES)
    .filter(c => c.progress === 100)

  const inProgressCourses = (enrolledCourses.length > 0 ? enrolledCourses : DEMO_COURSES)
    .filter(c => c.progress > 0 && c.progress < 100)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-primary">Mis logros</h1>
        <p className="text-sm text-secondary mt-0.5">
          Cursos completados y certificados disponibles
        </p>
      </div>

      {/* Completados */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-secondary" />
          <h2 className="text-base font-bold text-primary">
            Cursos completados ({completedCourses.length})
          </h2>
        </div>

        {completedCourses.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-center
                          bg-white rounded-2xl border border-mid/20">
            <Award size={36} className="text-mid opacity-50" />
            <p className="font-semibold text-primary">Aún no has completado ningún curso</p>
            <p className="text-sm text-secondary max-w-xs">
              Sigue aprendiendo y cuando llegues al 100% en un curso podrás obtener tu certificado.
            </p>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-1.5 mt-1 min-h-[44px] px-6 rounded-xl
                         bg-primary text-tertiary text-sm font-semibold
                         hover:bg-secondary active:scale-95 transition-all"
            >
              Ir a mis cursos
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {completedCourses.map(course => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl
                           border border-mid/20 shadow-sm"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-primary line-clamp-1">
                    {course.title}
                  </p>
                  <p className="text-xs text-secondary mt-0.5">
                    Completado el {formatDate(course.lastAccessedAt)}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5
                                   text-[10px] font-semibold px-2 py-0.5 rounded-full
                                   bg-green-100 text-green-700">
                    ✓ 100% completado
                  </span>
                </div>
                <button
                  onClick={() => setActiveCert({
                    courseId: course.id,
                    courseName: course.title,
                    date: formatDate(course.lastAccessedAt),
                  })}
                  className="flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl shrink-0
                             bg-gradient-to-r from-secondary to-tertiary
                             text-primary text-xs font-bold
                             hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <Award size={14} />
                  <span className="hidden sm:inline">Certificado</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* En progreso */}
      {inProgressCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-secondary" />
            <h2 className="text-base font-bold text-primary">
              En progreso ({inProgressCourses.length})
            </h2>
          </div>
          <div className="space-y-3">
            {inProgressCourses.map(course => (
              <button
                key={course.id}
                onClick={() => navigate(`/student/courses/${course.id}`)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl
                           border border-mid/20 shadow-sm text-left
                           hover:border-secondary/40 active:scale-[0.99] transition-all"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-primary line-clamp-1">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-mid/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary
                                   transition-all duration-700"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-secondary shrink-0">
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-mid shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Modal certificado */}
      {activeCert && (
        <CertificateModal
          courseId={activeCert.courseId}
          courseName={activeCert.courseName}
          completionDate={activeCert.date}
          onClose={() => setActiveCert(null)}
        />
      )}
    </div>
  )
}
