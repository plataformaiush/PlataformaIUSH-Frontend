import { FileX } from 'lucide-react'

interface NoContentAvailableProps {
  onClose: () => void
}

export function NoContentAvailable({ onClose }: NoContentAvailableProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-mid/10 flex items-center justify-center">
        <FileX size={32} className="text-mid" />
      </div>

      <div className="space-y-1.5">
        <p className="text-base font-bold text-primary">
          Contenido no disponible
        </p>
        <p className="text-sm text-secondary max-w-xs leading-relaxed">
          Este contenido aún no está listo. Inténtalo más tarde o continúa con otro.
        </p>
      </div>

      <button
        onClick={onClose}
        className="min-h-[44px] px-6 rounded-xl text-sm font-semibold
                   bg-primary text-tertiary hover:bg-secondary
                   active:scale-95 transition-all"
      >
        Cerrar
      </button>
    </div>
  )
}
