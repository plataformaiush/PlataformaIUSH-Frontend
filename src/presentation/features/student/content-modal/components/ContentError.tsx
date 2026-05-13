import { AlertCircle, RefreshCw } from 'lucide-react'

interface ContentErrorProps {
  onRetry: () => void
}

export function ContentError({ onRetry }: ContentErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
      <AlertCircle size={40} className="text-secondary opacity-60" />
      <div>
        <p className="font-semibold text-primary">No se pudo cargar el contenido</p>
        <p className="text-sm text-secondary mt-1">Verifica tu conexión e intenta de nuevo</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 min-h-[44px] px-5 rounded-xl
                   bg-primary text-tertiary text-sm font-medium
                   hover:bg-secondary active:scale-95 transition-all"
      >
        <RefreshCw size={16} />
        Reintentar
      </button>
    </div>
  )
}
