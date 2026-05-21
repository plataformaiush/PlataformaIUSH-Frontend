import { Award } from 'lucide-react'

interface CompletionBadgeProps {
  onClick?: () => void
}

export function CompletionBadge({ onClick }: CompletionBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="w-full min-h-[44px] flex items-center justify-center gap-2
                 bg-gradient-to-r from-secondary to-tertiary
                 text-primary font-semibold text-sm rounded-xl
                 hover:opacity-90 active:scale-95 transition-all duration-150
                 shadow-md shadow-secondary/30"
      aria-label="Obtener certificado del curso"
    >
      <Award size={18} />
      Obtener Certificado
    </button>
  )
}
