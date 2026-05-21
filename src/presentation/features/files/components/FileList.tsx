// src/presentation/features/files/components/FileList.tsx
import React from 'react'
import { type Documento } from '../../../../domain/files/Filesapi'
import { DeleteButton } from './buttons/DeleteButton'
import { DownloadButton } from './buttons/DownloadButton'
import { PreviewButton } from './buttons/PreviewButton'
import { FileText, Image, Video, FileSpreadsheet, File } from 'lucide-react'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date?: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─────────────────────────────────────────────
// File type visual config
// ─────────────────────────────────────────────
const FILE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pdf:  { icon: <FileText size={18} />,        color: 'text-red-500',    bg: 'bg-red-50'    },
  docx: { icon: <FileText size={18} />,        color: 'text-blue-500',   bg: 'bg-blue-50'   },
  doc:  { icon: <FileText size={18} />,        color: 'text-blue-500',   bg: 'bg-blue-50'   },
  xlsx: { icon: <FileSpreadsheet size={18} />, color: 'text-green-600',  bg: 'bg-green-50'  },
  xls:  { icon: <FileSpreadsheet size={18} />, color: 'text-green-600',  bg: 'bg-green-50'  },
  png:  { icon: <Image size={18} />,           color: 'text-purple-500', bg: 'bg-purple-50' },
  jpg:  { icon: <Image size={18} />,           color: 'text-purple-500', bg: 'bg-purple-50' },
  jpeg: { icon: <Image size={18} />,           color: 'text-purple-500', bg: 'bg-purple-50' },
  mp4:  { icon: <Video size={18} />,           color: 'text-slate-500',  bg: 'bg-slate-100' },
}

function FileTypeIcon({ type }: { type: string }) {
  const cfg = FILE_TYPE_CONFIG[type?.toLowerCase()] ?? {
    icon: <File size={18} />,
    color: 'text-gray-400',
    bg: 'bg-gray-100',
  }
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
    </div>
  )
}

function FileTypeBadge({ type }: { type: string }) {
  const cfg = FILE_TYPE_CONFIG[type?.toLowerCase()] ?? { color: 'text-gray-400', bg: 'bg-gray-100' }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
      {type?.toUpperCase()}
    </span>
  )
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface FileListProps {
  documents: Documento[]
  heading?: string
  onDeleted: (id: string) => void
  showDelete?: boolean
}

export function FileList({
  documents,
  heading = 'Course files',
  onDeleted,
  showDelete = true,
}: FileListProps) {

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <File size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No files yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Section heading */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          {heading}
        </span>
        <span className="text-[10px] text-gray-300">
          · {documents.length} file{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* File rows */}
      <ul className="divide-y divide-gray-50">
        {documents.map((doc) => {
          const isVideo = doc.tipo?.toLowerCase() === 'mp4'

          return (
            <li
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
            >
              {/* Icon + metadata */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileTypeIcon type={doc.tipo} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-primary)] truncate">
                    {doc.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <FileTypeBadge type={doc.tipo} />
                    <span className="text-[11px] text-gray-400">
                      {formatBytes(doc.tamaño)}
                    </span>
                    {doc.creadoEn && (
                      <span className="text-[11px] text-gray-400">
                        {formatDate(doc.creadoEn)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <PreviewButton
                  id={doc.id}
                  label={isVideo ? 'Reproducir' : 'Ver'}
                  variant={isVideo ? 'play' : 'expand'}
                />
                <DownloadButton id={doc.id} fileName={doc.nombre} />
                {showDelete && (
                  <DeleteButton id={doc.id} onDeleted={onDeleted} iconOnly />
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}