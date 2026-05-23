import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Award, Download, X, Trophy, BookOpen, ChevronRight } from 'lucide-react'
import { studentService, type MisCursos, type Certificado, type CursoInscritoBackend } from '../services/studentService'
import { tokenManager } from '../../../services/tokenManager'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

interface CertModalProps {
  certificateId: string
  courseName: string
  onClose: () => void
}

function injectBodyReset(raw: string): string {
  const style = `<style>html,body{margin:0!important;padding:0!important;background:white;}</style>`
  return raw.includes('</head>')
    ? raw.replace('</head>', `${style}</head>`)
    : style + raw
}

function CertificateModal({ certificateId, courseName, onClose }: CertModalProps) {
  const hiddenFrameRef = useRef<HTMLIFrameElement>(null)
  const [rawHtml, setRawHtml] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    studentService.previewCertificado(certificateId)
      .then(setRawHtml)
      .catch(() => setLoadError(true))
  }, [certificateId])

  const handleDownloadPdf = async () => {
    if (downloading || !rawHtml) return
    setDownloading(true)
    try {
      // Get downloadable HTML (marks as downloaded in DB)
      const blob = await studentService.descargarCertificado(certificateId)
      const fullHtml = injectBodyReset(await blob.text())

      // Write into the hidden off-screen iframe
      const frame = hiddenFrameRef.current
      if (!frame) return
      const frameDoc = frame.contentDocument!
      frameDoc.open()
      frameDoc.write(fullHtml)
      frameDoc.close()

      // Wait for fonts/images to render
      await new Promise<void>(resolve => setTimeout(resolve, 900))

      const body = frameDoc.body
      const sw = frameDoc.documentElement.scrollWidth
      const sh = frameDoc.documentElement.scrollHeight

      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: sw,
        height: sh,
        windowWidth: sw,
        windowHeight: sh,
      })

      const { jsPDF } = await import('jspdf')
      const imgW = canvas.width
      const imgH = canvas.height
      const pdf = new jsPDF({
        orientation: imgW > imgH ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgW, imgH],
        compress: true,
      })
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, imgW, imgH)
      pdf.save(`certificado-${courseName.replace(/\s+/g, '-')}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-100 bg-neutral/70 backdrop-blur-sm
                 flex items-end md:items-center md:justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Hidden off-screen iframe for PDF capture */}
      <iframe
        ref={hiddenFrameRef}
        title="pdf-capture"
        className="absolute border-0"
        style={{ left: '-9999px', top: 0, width: '1100px', height: '800px', visibility: 'hidden' }}
        sandbox="allow-same-origin"
      />

      <div
        className="flex flex-col bg-surface-muted w-full max-h-[92dvh]
                   rounded-t-2xl md:rounded-2xl
                   md:w-170 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-primary shrink-0 rounded-t-2xl md:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-tertiary/80" />
            <span className="text-sm font-semibold text-tertiary">Tu certificado</span>
          </div>
          <button
            onClick={onClose}
            className="min-w-9 min-h-9 flex items-center justify-center
                       rounded-full hover:bg-white/10 text-mid hover:text-tertiary transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificado — scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-4">
          {loadError ? (
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <Award size={36} className="text-mid opacity-40" />
              <p className="font-semibold text-primary text-sm">No se pudo cargar el certificado</p>
              <p className="text-xs text-secondary">Intenta de nuevo más tarde.</p>
            </div>
          ) : rawHtml === null ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
              <iframe
                title={`Certificado — ${courseName}`}
                srcDoc={rawHtml}
                className="w-full border-0 block"
                style={{ height: '560px' }}
                sandbox="allow-same-origin"
                scrolling="yes"
              />
            </div>
          )}
        </div>

        {/* Acción */}
        <div className="px-4 py-3 border-t border-mid/20 shrink-0 bg-surface-muted">
          <button
            onClick={handleDownloadPdf}
            disabled={!rawHtml || downloading}
            className="w-full flex items-center justify-center gap-2 min-h-11
                       rounded-xl bg-primary text-tertiary font-semibold text-sm
                       hover:bg-secondary active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {downloading ? 'Generando PDF…' : 'Descargar PDF'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function StudentGradesPage() {
  const navigate = useNavigate()

  const [cursos, setCursos] = useState<MisCursos[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCertId, setActiveCertId] = useState<{ id: string; courseName: string } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const user = tokenManager.getUser() as { id?: string } | null
        const userId = user?.id ?? ''

        const [cursosData, certsData, inscritosData] = await Promise.all([
          studentService.getMisCursos(),
          studentService.getMisCertificados().catch(() => [] as Certificado[]),
          userId
            ? studentService.getMisCursosInscritos(userId).catch(() => [] as CursoInscritoBackend[])
            : Promise.resolve([] as CursoInscritoBackend[]),
        ])

        // Merge: cursos del endpoint de progreso + cursos marcados completado=true
        // en inscripciones pero que el endpoint de progreso reporta 0% (inconsistencia del backend)
        const cursosMap = new Map((cursosData ?? []).map(c => [c.idCurso, c]))
        for (const inscrito of inscritosData ?? []) {
          if (!inscrito.completado) continue
          if (cursosMap.has(inscrito.id_curso)) {
            // Corregir el porcentaje si está mal reportado
            const existing = cursosMap.get(inscrito.id_curso)!
            if (existing.porcentajeProgreso < 100) {
              cursosMap.set(inscrito.id_curso, { ...existing, porcentajeProgreso: 100 })
            }
          } else {
            // Curso completado que no aparece en el endpoint de progreso
            cursosMap.set(inscrito.id_curso, {
              idCurso: inscrito.id_curso,
              titulo: inscrito.titulo,
              descripcion: inscrito.descripcion,
              thumbnail: inscrito.thumbnail,
              modulosTotal: inscrito.modulos_total,
              modulosCompletados: inscrito.modulos_total,
              porcentajeProgreso: 100,
            })
          }
        }

        setCursos(Array.from(cursosMap.values()))
        setCertificados(certsData ?? [])
      } catch {
        setError('No se pudo cargar la información. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const completedCourses = cursos.filter(c => c.porcentajeProgreso >= 100)
  const inProgressCourses = cursos.filter(c => c.porcentajeProgreso > 0 && c.porcentajeProgreso < 100)

  const getCert = (courseId: string) => certificados.find(c => c.courseId === courseId)
  const getCertDate = (courseId: string) => {
    const cert = getCert(courseId)
    return cert?.issuedAt ? formatDate(cert.issuedAt) : '—'
  }

  const handleOpenCert = (course: MisCursos) => {
    const cert = getCert(course.idCurso)
    if (cert) setActiveCertId({ id: cert.id, courseName: course.titulo })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

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
              className="flex items-center gap-1.5 mt-1 min-h-11 px-6 rounded-xl
                         bg-primary text-tertiary text-sm font-semibold
                         hover:bg-secondary active:scale-95 transition-all"
            >
              Ir a mis cursos
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {completedCourses.map(course => {
              const cert = getCert(course.idCurso)
              return (
                <div
                  key={course.idCurso}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl
                             border border-mid/20 shadow-sm"
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.titulo}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-primary line-clamp-1">
                      {course.titulo}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      Completado el {getCertDate(course.idCurso)}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1.5
                                     text-[10px] font-semibold px-2 py-0.5 rounded-full
                                     bg-green-100 text-green-700">
                      ✓ 100% completado
                    </span>
                  </div>
                  {cert ? (
                    <button
                      onClick={() => handleOpenCert(course)}
                      className="flex items-center gap-1.5 min-h-11 px-4 rounded-xl shrink-0
                                 bg-linear-to-r from-secondary to-tertiary
                                 text-primary text-xs font-bold
                                 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    >
                      <Award size={14} />
                      <span className="hidden sm:inline">Certificado</span>
                    </button>
                  ) : (
                    <div
                      title="El certificado se está generando, intenta más tarde"
                      className="flex items-center gap-1.5 min-h-11 px-4 rounded-xl shrink-0
                                 bg-amber-50 border border-amber-200
                                 text-amber-600 text-xs font-semibold cursor-default"
                    >
                      <Award size={14} />
                      <span className="hidden sm:inline">Pendiente</span>
                    </div>
                  )}
                </div>
              )
            })}
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
                key={course.idCurso}
                onClick={() => navigate(`/student/courses/${course.idCurso}`)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl
                           border border-mid/20 shadow-sm text-left
                           hover:border-secondary/40 active:scale-[0.99] transition-all"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.titulo}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-primary line-clamp-1">
                    {course.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-mid/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-primary to-secondary
                                   transition-all duration-700"
                        style={{ width: `${course.porcentajeProgreso}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-secondary shrink-0">
                      {course.porcentajeProgreso}%
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
      {activeCertId && (
        <CertificateModal
          certificateId={activeCertId.id}
          courseName={activeCertId.courseName}
          onClose={() => setActiveCertId(null)}
        />
      )}
    </div>
  )
}
