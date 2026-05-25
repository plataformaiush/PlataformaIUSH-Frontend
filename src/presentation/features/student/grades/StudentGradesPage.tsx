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

function injectCleanStyles(raw: string): string {
  // Remove body padding/flex so the certificate-wrapper (1240×1754) sits at top-left
  // and scrollWidth/scrollHeight accurately reflect natural cert dimensions.
  const style = `<style>
    html, body { margin: 0 !important; padding: 0 !important; }
    body { display: block !important; }
  </style>`
  return raw.includes('</head>')
    ? raw.replace('</head>', `${style}</head>`)
    : style + raw
}

function CertificateModal({ certificateId, courseName, onClose }: CertModalProps) {
  const hiddenFrameRef = useRef<HTMLIFrameElement>(null)
  const containerRef  = useRef<HTMLDivElement>(null)
  const [rawHtml, setRawHtml]         = useState<string | null>(null)
  const [loadError, setLoadError]     = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [certScale, setCertScale]     = useState<{ scale: number; mL: number; mT: number } | null>(null)

  // Certificate template fixed dimensions (from CertificateService.js)
  const CERT_W = 1240
  const CERT_H = 1754

  useEffect(() => {
    studentService.previewCertificado(certificateId)
      .then(setRawHtml)
      .catch(() => setLoadError(true))
  }, [certificateId])

  // ResizeObserver: recalculate scale whenever the container is resized
  useEffect(() => {
    if (!rawHtml) return
    const container = containerRef.current
    if (!container) return

    const recalc = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width <= 0 || height <= 0) return
      const scale = Math.min(width / CERT_W, height / CERT_H)
      setCertScale({
        scale,
        mL: Math.max(0, (width  - CERT_W * scale) / 2),
        mT: Math.max(0, (height - CERT_H * scale) / 2),
      })
    }

    const obs = new ResizeObserver(recalc)
    obs.observe(container)
    recalc()
    return () => obs.disconnect()
  }, [rawHtml])

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
      className="fixed inset-0 z-200 bg-black/60 backdrop-blur-sm
                 flex items-center justify-center p-4 md:p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Hidden off-screen iframe for PDF capture */}
      <iframe
        ref={hiddenFrameRef}
        title="pdf-capture"
        className="absolute border-0"
        style={{ left: '-9999px', top: 0, width: `${CERT_W}px`, height: `${CERT_H}px`, visibility: 'hidden' }}
        sandbox="allow-same-origin"
      />

      {/* Modal — large, viewport-height-bound */}
      <div className="flex flex-col w-full max-w-2xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden bg-surface-muted">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-primary shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Award size={16} className="text-tertiary/80 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-tertiary leading-tight">Tu certificado</p>
              <p className="text-[11px] text-tertiary/70 leading-tight mt-0.5 truncate">{courseName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 min-w-9 min-h-9 flex items-center justify-center
                       rounded-full hover:bg-white/10 text-mid hover:text-tertiary transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate area — fills all remaining height, cert auto-scales to fit */}
        <div
          ref={containerRef}
          className="flex-1 bg-gray-200 relative overflow-hidden"
        >
          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
              <Award size={36} className="text-mid opacity-40" />
              <p className="font-semibold text-primary text-sm">No se pudo cargar el certificado</p>
              <p className="text-xs text-secondary">Intenta de nuevo más tarde.</p>
            </div>
          ) : rawHtml === null || !certScale ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary" />
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              left: certScale.mL,
              top: certScale.mT,
              width: CERT_W,
              height: CERT_H,
              transform: `scale(${certScale.scale})`,
              transformOrigin: 'top left',
              boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
            }}>
              <iframe
                title={`Certificado — ${courseName}`}
                srcDoc={injectCleanStyles(rawHtml)}
                className="border-0 block"
                style={{ width: CERT_W, height: CERT_H }}
                sandbox="allow-same-origin"
                scrolling="no"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-mid/20 bg-surface-muted shrink-0">
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

        const [certsData, inscritosData] = await Promise.all([
          studentService.getMisCertificados().catch(() => [] as Certificado[]),
          userId
            ? studentService.getMisCursosInscritos(userId).catch(() => [] as CursoInscritoBackend[])
            : Promise.resolve([] as CursoInscritoBackend[]),
        ])

        // Build course list from inscripciones — tiene el fallback COALESCE correcto para todos los cursos
        const allCursos: MisCursos[] = (inscritosData ?? []).map(inscrito => ({
          idCurso:            inscrito.id_curso,
          titulo:             inscrito.titulo,
          descripcion:        inscrito.descripcion,
          thumbnail:          inscrito.thumbnail,
          modulosTotal:       inscrito.modulos_total,
          modulosCompletados: inscrito.contenidos_completados,
          porcentajeProgreso: Math.round(parseFloat(inscrito.porcentaje_progreso || '0')),
        }))

        let certs = certsData ?? []

        // Sync progreso_curso para todos los cursos al 100% que aún no tienen certificado
        if (userId) {
          const certCourseIds = new Set(certs.map(c => c.courseId))
          const needsSync = allCursos.filter(
            c => c.porcentajeProgreso >= 100 && !certCourseIds.has(c.idCurso)
          )
          if (needsSync.length > 0) {
            const syncResults = await Promise.allSettled(
              needsSync.map(c => studentService.sincronizarProgreso(userId, c.idCurso))
            )
            const newCerts = syncResults
              .flatMap(r => (r.status === 'fulfilled' && r.value.certificado ? [r.value.certificado] : []))
            if (newCerts.length > 0) {
              certs = [...certs, ...newCerts]
            }
          }
        }

        setCursos(allCursos)
        setCertificados(certs)
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
