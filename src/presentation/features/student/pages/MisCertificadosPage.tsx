import { useState, useEffect } from 'react'
import { studentService, Certificado, Calificacion } from '../services/studentService'
import { Trophy, Award, Download } from 'lucide-react'

export default function MisCertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [loadingCert, setLoadingCert] = useState(true)
  const [loadingCalif, setLoadingCalif] = useState(true)
  const [errorCert, setErrorCert] = useState<string | null>(null)
  const [errorCalif, setErrorCalif] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'certificados' | 'calificaciones'>('certificados')

  useEffect(() => {
    const fetchCertificados = async () => {
      try {
        setLoadingCert(true)
        const data = await studentService.getMisCertificados()
        setCertificados(data)
        setErrorCert(null)
      } catch (err) {
        setErrorCert(err instanceof Error ? err.message : 'Error al cargar certificados')
        console.error('Error:', err)
      } finally {
        setLoadingCert(false)
      }
    }

    fetchCertificados()
  }, [])

  useEffect(() => {
    const fetchCalificaciones = async () => {
      try {
        setLoadingCalif(true)
        const data = await studentService.getMisCalificaciones()
        setCalificaciones(data)
        setErrorCalif(null)
      } catch (err) {
        setErrorCalif(err instanceof Error ? err.message : 'Error al cargar calificaciones')
        console.error('Error:', err)
      } finally {
        setLoadingCalif(false)
      }
    }

    fetchCalificaciones()
  }, [])

  const handleDescargarCertificado = (certificado: Certificado) => {
    const url = `/certificates/${certificado.userId}/course/${certificado.courseId}/download`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 pb-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="p-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Mis Logros
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
          Certificados y calificaciones obtenidas
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('certificados')}
            className={`py-3 px-4 font-semibold text-sm transition-colors ${
              activeTab === 'certificados'
                ? 'border-b-2'
                : 'text-muted-foreground'
            }`}
            style={{
              color: activeTab === 'certificados' ? 'var(--color-primary)' : undefined,
              borderColor: activeTab === 'certificados' ? 'var(--color-primary)' : undefined,
            }}
          >
            <Award size={18} className="inline mr-2" />
            Certificados ({certificados.length})
          </button>
          <button
            onClick={() => setActiveTab('calificaciones')}
            className={`py-3 px-4 font-semibold text-sm transition-colors ${
              activeTab === 'calificaciones'
                ? 'border-b-2'
                : 'text-muted-foreground'
            }`}
            style={{
              color: activeTab === 'calificaciones' ? 'var(--color-primary)' : undefined,
              borderColor: activeTab === 'calificaciones' ? 'var(--color-primary)' : undefined,
            }}
          >
            <Trophy size={18} className="inline mr-2" />
            Calificaciones ({calificaciones.length})
          </button>
        </div>
      </div>

      {/* Contenido Certificados */}
      {activeTab === 'certificados' && (
        <div className="px-6 space-y-4">
          {loadingCert ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Cargando certificados...</p>
            </div>
          ) : errorCert ? (
            <div className="text-center py-8 text-red-600">
              <p>{errorCert}</p>
            </div>
          ) : certificados.length === 0 ? (
            <div className="text-center py-8">
              <Award size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-muted-foreground)' }} />
              <p style={{ color: 'var(--color-muted-foreground)' }}>
                Aún no has obtenido certificados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificados.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-muted)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                        {cert.courseName}
                      </h3>
                      <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
                        Emitido: {new Date(cert.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <Award size={32} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <button
                    onClick={() => handleDescargarCertificado(cert)}
                    className="mt-4 w-full py-2 rounded text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Download size={16} />
                    Descargar PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenido Calificaciones */}
      {activeTab === 'calificaciones' && (
        <div className="px-6 space-y-4">
          {loadingCalif ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Cargando calificaciones...</p>
            </div>
          ) : errorCalif ? (
            <div className="text-center py-8 text-red-600">
              <p>{errorCalif}</p>
            </div>
          ) : calificaciones.length === 0 ? (
            <div className="text-center py-8">
              <Trophy size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-muted-foreground)' }} />
              <p style={{ color: 'var(--color-muted-foreground)' }}>
                Aún no tienes calificaciones
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {calificaciones.map((calif) => (
                <div
                  key={calif.id}
                  className="rounded-lg border p-4 flex items-center justify-between"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-muted)',
                  }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      Curso ID: {calif.courseId}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                      {new Date(calif.creacion).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="text-2xl font-bold px-4 py-2 rounded"
                    style={{
                      backgroundColor: calif.grade >= 7 ? 'var(--color-primary)' : 'var(--color-secondary)',
                      color: 'var(--color-text-on-dark)',
                    }}
                  >
                    {calif.grade.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

