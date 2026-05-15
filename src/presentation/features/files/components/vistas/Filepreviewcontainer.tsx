// src/presentation/features/files/FilePreviewContainer.tsx
import React, { useEffect, useState } from 'react'
import { X, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { filesApi, type Documento } from '../../../../../domain/files/Filesapi'

interface FilePreviewContainerProps {
  /** ID del documento (se usará para GET /api/documentos/:id) */
  id: string
  onClose: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Determina si una URL es de YouTube */
function esYoutube(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

/** Convierte URL de YouTube a embed */
function youtubeEmbed(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

export function FilePreviewContainer({ id, onClose }: FilePreviewContainerProps) {
  const [doc, setDoc] = useState<Documento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfPage, setPdfPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    filesApi
      .obtenerPorId(id)
      .then((d) => { if (!cancelled) { setDoc(d); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError('No se pudo cargar el archivo.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [id])

  const tipo = doc?.tipo?.toLowerCase() || ''
  const esVideo = tipo === 'mp4' || (doc?.url && esYoutube(doc.url))
  const esImagen = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(tipo)
  const esPdf = tipo === 'pdf'
  const esExcel = ['xlsx', 'xls'].includes(tipo)
  const descargarUrl = filesApi.descargarUrl(id)

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(6,10,13,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          {doc ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#AEEBF2] flex items-center justify-center flex-shrink-0">
                <FileText size={15} className="text-[#223740]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#223740] truncate">{doc.nombre}</p>
                <p className="text-[11px] text-gray-400 uppercase">
                  {formatBytes(doc.tamaño)} · {doc.tipo?.toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Cargando…</span>
          )}
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {doc && (
              <a
                href={descargarUrl}
                download={doc.nombre}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-[#223740]"
                aria-label="Descargar"
              >
                <Download size={16} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-[320px]">
          {/* Cargando */}
          {loading && (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-10 h-10 rounded-full border-2 border-[#AEEBF2] border-t-[#5A878C] animate-spin" />
              <p className="text-sm">Cargando archivo…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-2 text-red-500 p-8">
              <X size={32} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* PDF — iframe embed */}
          {!loading && !error && esPdf && doc?.url && (
            <div className="w-full h-full flex flex-col">
              <iframe
                src={`${doc.url}#page=${pdfPage}`}
                title={doc.nombre}
                className="w-full flex-1 border-0"
                style={{ minHeight: '420px' }}
              />
              {/* Controles de página básicos */}
              <div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 bg-white text-xs text-gray-500">
                <span>Página {pdfPage}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    disabled={pdfPage <= 1}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setPdfPage((p) => p + 1)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* IMAGEN */}
          {!loading && !error && esImagen && doc?.url && (
            <img
              src={doc.url}
              alt={doc.nombre}
              className="max-w-full max-h-full object-contain p-4"
            />
          )}

          {/* VIDEO MP4 */}
          {!loading && !error && esVideo && doc?.url && !esYoutube(doc.url) && (
            <video
              src={doc.url}
              controls
              className="w-full max-h-[520px] bg-black"
            >
              Tu navegador no soporta video.
            </video>
          )}

          {/* VIDEO YOUTUBE */}
          {!loading && !error && esVideo && doc?.url && esYoutube(doc.url) && (
            <div className="w-full aspect-video">
              <iframe
                src={youtubeEmbed(doc.url)}
                title={doc.nombre}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* EXCEL — Google Sheets viewer o mensaje */}
          {!loading && !error && esExcel && doc?.url && (
            <div className="w-full h-full flex flex-col">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.url)}`}
                title={doc.nombre}
                className="w-full flex-1 border-0"
                style={{ minHeight: '420px' }}
              />
            </div>
          )}

          {/* Sin URL */}
          {!loading && !error && doc && !doc.url && (
            <div className="flex flex-col items-center gap-3 p-8 text-gray-400">
              <FileText size={40} />
              <p className="text-sm font-medium text-center">
                Vista previa no disponible para este tipo de archivo.
              </p>
              <a
                href={descargarUrl}
                download={doc.nombre}
                className="mt-2 px-4 py-2 rounded-xl bg-[#223740] text-white text-sm font-semibold hover:bg-[#1a2c35] transition-colors"
              >
                Descargar archivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}