// src/presentation/features/files/components/vistas/Filepreviewcontainer.tsx

import React, { useEffect, useState } from 'react'
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'

import {
  filesApi,
  type Documento,
} from '../../../../../domain/files/Filesapi'

interface FilePreviewContainerProps {
  id?: string
  url?: string
  tipo?: string
  nombre?: string
  onClose: () => void
  embedded?: boolean
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 KB'

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isYouTube(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

function youTubeEmbed(url: string): string {
  const match = url.match(
    /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )

  return match
    ? `https://www.youtube.com/embed/${match[1]}`
    : url
}

function inferTipo(url: string): string {
  return (
    url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
  )
}

// ─────────────────────────────────────────────
// BODY
// ─────────────────────────────────────────────

function PreviewBody({
  doc,
  loading,
  error,
  pdfPage,
  setPdfPage,
}: {
  doc: Documento | null
  loading: boolean
  error: string
  pdfPage: number
  setPdfPage: React.Dispatch<
    React.SetStateAction<number>
  >
}) {
  const type = doc?.tipo?.toLowerCase() || ''

  const isPdf = type === 'pdf'

  const isImage = [
    'png',
    'jpg',
    'jpeg',
    'webp',
    'gif',
  ].includes(type)

  const isWord = ['doc', 'docx'].includes(type)

  const isExcel = ['xls', 'xlsx'].includes(type)

  const isYoutube =
    !!doc?.url && isYouTube(doc.url)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
        <div className="w-10 h-10 rounded-full border-2 border-[#AEEBF2] border-t-[#5A878C] animate-spin" />

        <p className="text-sm">
          Cargando archivo...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-red-500">
        <X size={32} />

        <p className="text-sm font-medium">
          {error}
        </p>
      </div>
    )
  }

  if (!doc) return null

  // ───────────────── PDF
  if (isPdf && doc.url) {
    return (
      <div className="flex flex-col h-full min-h-0 flex-1">
        <iframe
          src={`${doc.url}#page=${pdfPage}`}
          title={doc.nombre}
          className="w-full flex-1 border-0"
        />

        <div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 bg-white text-xs text-gray-500">
          <span>Página {pdfPage}</span>

          <div className="flex gap-1">
            <button
              onClick={() =>
                setPdfPage((p) => Math.max(1, p - 1))
              }
              disabled={pdfPage <= 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              onClick={() =>
                setPdfPage((p) => p + 1)
              }
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ───────────────── IMAGEN
  if (isImage && doc.url) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <img
          src={doc.url}
          alt={doc.nombre}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  // ───────────────── YOUTUBE
  if (isYoutube && doc.url) {
    return (
      <div className="w-full h-full bg-black">
        <iframe
          src={youTubeEmbed(doc.url)}
          title={doc.nombre}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // ───────────────── WORD
  if (isWord && doc.url) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          doc.url
        )}`}
        title={doc.nombre}
        className="w-full h-full border-0"
      />
    )
  }

  // ───────────────── EXCEL
  if (isExcel && doc.url) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          doc.url
        )}`}
        title={doc.nombre}
        className="w-full h-full border-0"
      />
    )
  }

  // ───────────────── FALLBACK
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-gray-400">
      <FileText size={40} />

      <p className="text-sm font-medium">
        No se puede visualizar este archivo.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export function FilePreviewContainer({
  id,
  url,
  tipo,
  nombre,
  onClose,
  embedded = false,
}: FilePreviewContainerProps) {
  const [doc, setDoc] =
    useState<Documento | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [pdfPage, setPdfPage] =
    useState(1)

  useEffect(() => {
    // ───────────────── URL DIRECTA
    if (url) {
      setDoc({
        id: 'preview-directo',
        nombre:
          nombre ||
          url.split('/').pop() ||
          'archivo',
        tipo: tipo || inferTipo(url),
        tamaño: 0,
        url,
      })

      setLoading(false)
      return
    }

    // ───────────────── API POR ID
    if (id) {
      setLoading(true)

      filesApi
        .obtenerPorId(id)
        .then((data) => {
          setDoc(data)
          setLoading(false)
        })
        .catch(() => {
          setError(
            'No se pudo cargar el archivo.'
          )

          setLoading(false)
        })
    }
  }, [id, url, tipo, nombre])

  const content = (
    <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#AEEBF2] flex items-center justify-center">
            <FileText
              size={15}
              className="text-[#223740]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-[#223740]">
              {doc?.nombre || 'Archivo'}
            </p>

            {doc && (
              <p className="text-[11px] text-gray-400 uppercase">
                {formatBytes(doc.tamaño)} ·{' '}
                {doc.tipo}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {doc?.url && (
            <a
              href={doc.url}
              download={doc.nombre}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <Download size={16} />
            </a>
          )}

          {!embedded && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PreviewBody
          doc={doc}
          loading={loading}
          error={error}
          pdfPage={pdfPage}
          setPdfPage={setPdfPage}
        />
      </div>
    </div>
  )

  // ───────────────── EMBEDDED
  if (embedded) {
    return (
      <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200">
        {content}
      </div>
    )
  }

  // ───────────────── MODAL
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor:
          'rgba(6,10,13,0.7)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {content}
      </div>
    </div>
  )
}