// src/presentation/features/files/components/vistas/Filepreviewcontainer.tsx

import React, {
  useEffect,
  useState,
} from 'react'

import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'

import * as XLSX from 'xlsx'
import { renderAsync } from 'docx-preview'

import {
  filesApi,
  type Documento,
} from '../../../../../domain/files/Filesapi'

type FilePreviewContainerProps = {
  tipo?: string
  nombre?: string
  onClose: () => void
  embedded?: boolean
} & (
  | { id: string; url?: never }
  | { url: string; id?: never }
)

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

function isUrl(value: string): boolean {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://')
  )
}

function inferTipo(url: string): string {
  if (isYouTube(url)) return 'youtube'

  return (
    url.split('.').pop()?.split('?')[0]?.toLowerCase() ||
    ''
  )
}

// ─────────────────────────────────────────────
// HOOK: convierte una URL con Content-Disposition: attachment
// en un blob URL que el navegador puede renderizar inline
// ─────────────────────────────────────────────

function useBlobUrl(url: string | undefined): { blobUrl: string; blobLoading: boolean; blobError: string } {
  const [blobUrl, setBlobUrl] = useState('')
  const [blobLoading, setBlobLoading] = useState(false)
  const [blobError, setBlobError] = useState('')

  useEffect(() => {
    if (!url) return

    let objectUrl = ''
    setBlobLoading(true)
    setBlobError('')
    setBlobUrl('')

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
        setBlobLoading(false)
      })
      .catch((err) => {
        console.error('useBlobUrl error:', err)
        setBlobError('No se pudo cargar el archivo.')
        setBlobLoading(false)
      })

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url])

  return { blobUrl, blobLoading, blobError }
}

// ─────────────────────────────────────────────
// PDF VIEWER (blob URL para evitar Content-Disposition: attachment)
// ─────────────────────────────────────────────

function PdfViewer({
  url,
  pdfPage,
  setPdfPage,
}: {
  url: string
  pdfPage: number
  setPdfPage: React.Dispatch<React.SetStateAction<number>>
}) {
  const { blobUrl, blobLoading, blobError } = useBlobUrl(url)

  if (blobLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-tertiary)] border-t-[var(--color-primary)] animate-spin" />
        <p className="text-sm">Cargando PDF...</p>
      </div>
    )
  }

  if (blobError) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-red-500">
        <X size={32} />
        <p className="text-sm font-medium">{blobError}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      <iframe
        src={`${blobUrl}#page=${pdfPage}`}
        title="PDF"
        className="w-full flex-1 border-0"
      />
      <div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 bg-white text-xs text-gray-500">
        <span>Página {pdfPage}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
            disabled={pdfPage <= 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
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
  )
}

// ─────────────────────────────────────────────
// EXCEL VIEWER (SheetJS)
// ─────────────────────────────────────────────

function ExcelViewer({ url }: { url: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [activeSheet, setActiveSheet] = useState('')
  const [data, setData] = useState<any[][]>([])
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)

  useEffect(() => {
    async function loadExcel() {
      try {
        setLoading(true)
        const response = await fetch(url)
        if (!response.ok) throw new Error('No se pudo descargar el archivo')
        const arrayBuffer = await response.arrayBuffer()
        const wb = XLSX.read(arrayBuffer, { type: 'array' })
        setWorkbook(wb)
        setSheetNames(wb.SheetNames)
        const firstSheet = wb.SheetNames[0]
        setActiveSheet(firstSheet)
        const json = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], {
          header: 1,
          defval: '',
        }) as any[][]
        setData(json)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar el archivo Excel.')
        setLoading(false)
      }
    }
    loadExcel()
  }, [url])

  function changeSheet(sheetName: string) {
    if (!workbook) return
    setActiveSheet(sheetName)
    const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: '',
    }) as any[][]
    setData(json)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-tertiary)] border-t-[var(--color-primary)] animate-spin" />
        <p className="text-sm">Cargando Excel...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-red-500">
        <X size={32} />
        <p className="text-sm font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white">
      <div className="flex gap-2 p-3 border-b border-gray-200 overflow-x-auto bg-gray-50">
        {sheetNames.map((sheet) => (
          <button
            key={sheet}
            onClick={() => changeSheet(sheet)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
              activeSheet === sheet
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {sheet}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-200 px-3 py-2 whitespace-nowrap"
                  >
                    {cell?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// WORD VIEWER (docx-preview)
// ─────────────────────────────────────────────

function WordViewer({ url }: { url: string }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDocx() {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('No se pudo descargar el documento')
        const blob = await response.blob()
        if (!containerRef.current) return
        containerRef.current.innerHTML = ''
        await renderAsync(blob, containerRef.current, undefined, {
          className: 'docx-preview',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
        })
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar el documento Word.')
        setLoading(false)
      }
    }
    loadDocx()
  }, [url])

  return (
    <div className="relative w-full h-full overflow-auto bg-[#525659] p-6">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80">
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 border-t-[var(--color-tertiary)] animate-spin" />
          <p className="text-sm text-gray-500">Cargando documento...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white text-red-500">
          <X size={32} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      <div ref={containerRef} className="flex justify-center" />
    </div>
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
  setPdfPage: React.Dispatch<React.SetStateAction<number>>
}) {
  const type = doc?.tipo?.toLowerCase() || ''

  const isPdf = type === 'pdf'
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(type)
  const isWord = ['doc', 'docx'].includes(type)
  const isExcel = ['xls', 'xlsx'].includes(type)
  const isYoutube = type === 'youtube' || (!!doc?.url && isYouTube(doc.url))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
        <div className="w-10 h-10 rounded-full border-2 border-gray-300 border-t-[var(--color-tertiary)] animate-spin" />
        <p className="text-sm">Cargando archivo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-red-500">
        <X size={32} />
        <p className="text-sm font-medium">{error}</p>
      </div>
    )
  }

  if (!doc) return null

  // ───────────────── YOUTUBE (primero, antes de cualquier otro tipo)
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

  // ───────────────── PDF (via blob URL para evitar Content-Disposition: attachment)
  if (isPdf && doc.url) {
    return (
      <PdfViewer
        url={doc.url}
        pdfPage={pdfPage}
        setPdfPage={setPdfPage}
      />
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

  // ───────────────── WORD
  if (isWord && doc.url) {
    return <WordViewer url={doc.url} />
  }

  // ───────────────── EXCEL
  if (isExcel && doc.url) {
    return <ExcelViewer url={doc.url} />
  }

  // ───────────────── FALLBACK
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-gray-400">
      <FileText size={40} />
      <p className="text-sm font-medium">No se puede visualizar este archivo.</p>
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
  const [doc, setDoc] = useState<Documento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfPage, setPdfPage] = useState(1)

  useEffect(() => {
    // ── 1. Prop `url` explícita → siempre directa, sin API
    if (url) {
      setDoc({
        id: 'preview-directo',
        nombre: nombre || url.split('/').pop() || 'archivo',
        tipo: tipo || inferTipo(url),
        tamaño: 0,
        url,
      })
      setLoading(false)
      return
    }

    if (id) {
      // ── 2. `id` es una URL → visualizar directamente, sin API
      if (isUrl(id)) {
        setDoc({
          id: 'preview-directo',
          nombre: nombre || id.split('/').pop() || 'archivo',
          tipo: tipo || inferTipo(id),
          tamaño: 0,
          url: id,
        })
        setLoading(false)
        return
      }

      // ── 3. `id` es un ID real → consumir la API
      setLoading(true)
      setError('')

      filesApi
        .obtenerPorId(id)
        .then((data) => {
          setDoc(data)
          setLoading(false)
        })
        .catch(() => {
          setError('No se pudo cargar el archivo.')
          setLoading(false)
        })
    }
  }, [id, url, tipo, nombre])

  const content = (
    <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-tertiary)] flex items-center justify-center">
            <FileText size={15} className="text-[var(--color-primary)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-[var(--color-primary)]">
              {doc?.nombre || 'Archivo'}
            </p>
            {doc && (
              <p className="text-[11px] text-gray-400 uppercase">
                {formatBytes(doc.tamaño)} · {doc.tipo}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {doc?.url && doc.tipo !== 'youtube' && !isYouTube(doc.url) && (
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

  if (embedded) {
    return (
      <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200">
        {content}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(6,10,13,0.7)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
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