// src/presentation/features/files/components/vistas/vistasArchivos.tsx
import React, { useEffect, useState } from 'react'
import { filesApi, type Documento } from '../../../../../domain/files/Filesapi'
import { DeleteButton } from '../buttons/DeleteButton'
import { DownloadButton } from '../buttons/DownloadButton'
import { PreviewButton } from '../buttons/PreviewButton'
import { UploadButton } from '../buttons/UploadButton'
import { FileText, Image, Video, FileSpreadsheet, File } from 'lucide-react'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatFecha(fecha?: string): string {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const TIPO_CONFIG: Record<string, { icono: React.ReactNode; color: string; bg: string }> = {
  pdf:  { icono: <FileText size={18} />,       color: 'text-red-500',    bg: 'bg-red-50'    },
  docx: { icono: <FileText size={18} />,       color: 'text-blue-500',   bg: 'bg-blue-50'   },
  doc:  { icono: <FileText size={18} />,       color: 'text-blue-500',   bg: 'bg-blue-50'   },
  xlsx: { icono: <FileSpreadsheet size={18} />,color: 'text-green-600',  bg: 'bg-green-50'  },
  xls:  { icono: <FileSpreadsheet size={18} />,color: 'text-green-600',  bg: 'bg-green-50'  },
  png:  { icono: <Image size={18} />,          color: 'text-purple-500', bg: 'bg-purple-50' },
  jpg:  { icono: <Image size={18} />,          color: 'text-purple-500', bg: 'bg-purple-50' },
  jpeg: { icono: <Image size={18} />,          color: 'text-purple-500', bg: 'bg-purple-50' },
  mp4:  { icono: <Video size={18} />,          color: 'text-slate-500',  bg: 'bg-slate-100' },
}

function TipoIcono({ tipo }: { tipo: string }) {
  const t = tipo?.toLowerCase() || ''
  const cfg = TIPO_CONFIG[t] || { icono: <File size={18} />, color: 'text-gray-400', bg: 'bg-gray-100' }
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
      {cfg.icono}
    </div>
  )
}

function TipoBadge({ tipo }: { tipo: string }) {
  const cfg = TIPO_CONFIG[tipo?.toLowerCase()] || { color: 'text-gray-400', bg: 'bg-gray-100' }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
      {tipo?.toUpperCase()}
    </span>
  )
}

export function VistasArchivos() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargarDocumentos = async () => {
    try {
      setLoading(true)
      const docs = await filesApi.listar()
      setDocumentos(docs)
    } catch {
      setError('No se pudieron cargar los documentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarDocumentos() }, [])

  const handleDeleted = (id: string) =>
    setDocumentos((prev) => prev.filter((d) => d.id !== id))

  const handleUploaded = (doc: Documento) =>
    setDocumentos((prev) => [doc, ...prev])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[#223740]">Archivos del curso</h1>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {documentos.length} archivo{documentos.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <UploadButton onUploaded={handleUploaded} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#AEEBF2] border-t-[#5A878C] animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        )}

        {/* Vacío */}
        {!loading && !error && documentos.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <File size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay archivos. Sube el primero.</p>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && documentos.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Encabezado */}
            <div className="px-5 py-3 border-b border-gray-100">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Contenido multimedia
              </span>
            </div>

            {/* Filas — cada archivo es un <li> */}
            <ul className="divide-y divide-gray-50">
              {documentos.map((doc) => {
                const esVideo = doc.tipo?.toLowerCase() === 'mp4'
                return (
                  <li
                    key={doc.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Ícono por tipo */}
                    <TipoIcono tipo={doc.tipo} />

                    {/* Nombre + metadatos */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#223740] truncate">
                        {doc.nombre}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TipoBadge tipo={doc.tipo} />
                        <span className="text-[11px] text-gray-400">{formatBytes(doc.tamaño)}</span>
                        {doc.creadoEn && (
                          <span className="text-[11px] text-gray-400">{formatFecha(doc.creadoEn)}</span>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PreviewButton
                        id={doc.id}
                        label={esVideo ? 'Reproducir' : 'Ver'}
                        variant={esVideo ? 'play' : 'expand'}
                      />
                      <DownloadButton id={doc.id} nombreArchivo={doc.nombre} />
                      <DeleteButton id={doc.id} onDeleted={handleDeleted} iconOnly />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

      </div>
    </div>
  )
}