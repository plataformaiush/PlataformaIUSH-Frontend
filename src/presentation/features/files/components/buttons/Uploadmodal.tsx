import React, { useCallback, useRef, useState } from 'react'
import { Upload, RefreshCw, Check, X } from 'lucide-react'
import { filesApi, type Documento } from '../../../../../domain/files/Filesapi'

type Estado = 'idle' | 'subiendo' | 'exitoso' | 'error'

const TIPOS_ACEPTADOS = '.pdf,.docx,.xlsx,.png,.jpg'
const MAX_MB = 50

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onUploaded?: (doc: Documento) => void
}

export function UploadModal({ open, onClose, onUploaded }: UploadModalProps) {
  const [estado, setEstado] = useState<Estado>('idle')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [progreso, setProgreso] = useState(0)
  const [cargado, setCargado] = useState(0)
  const [docSubido, setDocSubido] = useState<Documento | null>(null)
  const [dragging, setDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validarArchivo = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const permitidos = ['pdf', 'docx', 'xlsx', 'png', 'jpg']
    if (!permitidos.includes(ext)) return `Tipo .${ext} no permitido`
    if (file.size > MAX_MB * 1024 * 1024) return `El archivo supera ${MAX_MB} MB`
    return null
  }

  const iniciarSubida = useCallback(async (file: File) => {
    const err = validarArchivo(file)
    if (err) { setErrorMsg(err); return }
    setArchivo(file)
    setProgreso(0)
    setCargado(0)
    setEstado('subiendo')
    setErrorMsg('')
    try {
      const doc = await filesApi.subir(file, (pct, loaded) => {
        setProgreso(pct)
        setCargado(loaded)
      })
      setDocSubido(doc)
      setEstado('exitoso')
      // ✅ Notifica al padre con el doc del POST — FilesView hará obtenerPorId internamente
      onUploaded?.(doc)
    } catch {
      setEstado('error')
      setErrorMsg('Error al subir el archivo. Intenta nuevamente.')
    }
  }, [onUploaded])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) iniciarSubida(file)
    },
    [iniciarSubida]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) iniciarSubida(file)
  }

  const reset = () => {
    setEstado('idle')
    setArchivo(null)
    setProgreso(0)
    setCargado(0)
    setDocSubido(null)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(6,10,13,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Subir archivo"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Subir archivo
          </span>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* ESTADO: idle */}
          {estado === 'idle' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                'flex flex-col items-center justify-center gap-3 rounded-2xl',
                'border-2 border-dashed px-6 py-10 cursor-pointer select-none',
                'transition-all duration-200',
                dragging
                  ? 'border-[#5A878C] bg-[#AEEBF2]/20 scale-[1.01]'
                  : 'border-gray-300 hover:border-[#5A878C] hover:bg-gray-50',
              ].join(' ')}
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Upload size={24} className="text-gray-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#223740] text-sm">Arrastra tu archivo aquí</p>
                <p className="text-xs text-gray-400 mt-0.5">o haz clic para seleccionar</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG'].map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-full bg-[#223740] text-white text-[10px] font-bold tracking-wide"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400">Tamaño máximo: {MAX_MB} MB</p>
              {errorMsg && (
                <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={TIPOS_ACEPTADOS}
                onChange={onInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* ESTADO: subiendo */}
          {estado === 'subiendo' && archivo && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center animate-spin">
                <RefreshCw size={24} className="text-[#5A878C]" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#223740] text-sm">Subiendo archivo...</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {archivo.name} · {formatBytes(archivo.size)}
                </p>
              </div>
              <div className="w-full">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#223740] rounded-full transition-all duration-300"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                  {progreso}% completado · {formatBytes(cargado)} subidos
                </p>
              </div>
            </div>
          )}

          {/* ESTADO: exitoso */}
          {estado === 'exitoso' && docSubido && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-[#5A878C] bg-[#AEEBF2]/10 px-6 py-10">
              <div className="w-14 h-14 rounded-2xl bg-[#5A878C] flex items-center justify-center">
                <Check size={24} className="text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#223740] text-sm">¡Archivo cargado!</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {docSubido.nombre} · {formatBytes(docSubido.tamaño)}
                </p>
              </div>
              <div className="w-full">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5A878C] rounded-full w-full" />
                </div>
                <p className="text-[11px] text-[#5A878C] mt-1.5 text-center font-medium">
                  Archivo disponible en el repositorio
                </p>
              </div>
              <button
                onClick={reset}
                className="text-xs text-gray-400 hover:text-[#223740] underline transition-colors"
              >
                Subir otro archivo
              </button>
            </div>
          )}

          {/* ESTADO: error */}
          {estado === 'error' && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-red-300 bg-red-50 px-6 py-10">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <X size={24} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-600 text-center">{errorMsg}</p>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-xl bg-[#223740] text-white text-sm font-semibold hover:bg-[#1a2c35] transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}