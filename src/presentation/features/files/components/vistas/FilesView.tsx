// src/presentation/features/files/components/vistas/FilesView.tsx
import React, { useEffect, useState } from 'react'
import { filesApi, type Documento } from './../../../../../domain/files/Filesapi'
import { UploadButton } from '../buttons/UploadButton'
import { FileList } from '../FileList'
import { FilePreviewContainer } from './Filepreviewcontainer'
import { Eye } from 'lucide-react'

export function FilesView() {
  const [documents, setDocuments] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ID of the document currently open in the preview panel
  // null = no file selected, panel is hidden
  const [previewId, setPreviewId] = useState<string | null>(null)

  // ── Data fetching ──────────────────────────
  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const docs = await filesApi.listar()
      setDocuments(docs)
    } catch {
      setError('Could not load files.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocuments() }, [])

  // ── Handlers ──────────────────────────────
  // Remove deleted file from local state — no refetch needed
  const handleDeleted = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    // Close preview if the deleted file was open
    if (previewId === id) setPreviewId(null)
  }

  // Prepend uploaded file to the list — no refetch needed
  const handleUploaded = (doc: Documento) =>
    setDocuments((prev) => [doc, ...prev])

  // Toggle preview: clicking the same row again closes it
  const handleSelectPreview = (id: string) =>
    setPreviewId((prev) => (prev === id ? null : id))

  const selectedDoc = documents.find((d) => d.id === previewId) ?? null

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#223740]">File Repository</h1>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {documents.length} file{documents.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <UploadButton onUploaded={handleUploaded} />
        </div>

        {/* ── Loading spinner ── */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#AEEBF2] border-t-[#5A878C] animate-spin" />
          </div>
        )}

        {/* ── Fetch error ── */}
        {!loading && error && (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        )}

        {/* ── Main content: list + inline preview side by side on desktop ── */}
        {!loading && !error && (
          <div className={`flex flex-col ${previewId ? 'lg:flex-row' : ''} gap-4`}>

            {/* File list — full width when no preview, 40% when preview is open */}
            <div className={previewId ? 'lg:w-2/5' : 'w-full'}>
              <FileList
                documents={documents}
                heading="All files"
                onDeleted={handleDeleted}
              />
            </div>

            {/* Inline preview panel — only visible when a file is selected */}
            {previewId && selectedDoc && (
              <div className="lg:w-3/5 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

                {/* Preview panel header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Eye size={15} className="text-[#5A878C]" />
                    <span className="text-xs font-semibold text-[#223740] truncate max-w-[200px]">
                      {selectedDoc.nombre}
                    </span>
                  </div>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>

                {/* FilePreviewContainer in embedded mode — no backdrop, no close button */}
                <FilePreviewContainer
                  id={previewId}
                  onClose={() => setPreviewId(null)}
                  embedded
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}