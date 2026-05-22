import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { filesApi } from '../../../../../domain/files/Filesapi'

interface DeleteButtonProps {
  id: string        
  onDeleted?: (id: string) => void
  iconOnly?: boolean
  className?: string
}

export function DeleteButton({
  id,
  onDeleted,
  iconOnly = false,
  className = '',
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const handleClick = () => {
    if (!confirmando) {
      setConfirmando(true)
      setTimeout(() => setConfirmando(false), 3000)
      return
    }
    handleConfirm()
  }

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await filesApi.eliminar(id)
      onDeleted?.(id)
    } catch {
      alert('No se pudo eliminar el archivo.')
    } finally {
      setLoading(false)
      setConfirmando(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={confirmando ? 'Confirmar eliminación' : 'Eliminar archivo'}
      title={confirmando ? '¿Confirmar?' : 'Eliminar'}
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold text-sm',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
        iconOnly ? 'w-9 h-9' : 'px-3 py-2',
        confirmando
          ? 'bg-red-600 text-white scale-105 focus:ring-red-400'
          : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
        loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <Trash2 size={15} />
      {!iconOnly && (loading ? 'Eliminando…' : confirmando ? '¿Confirmar?' : 'Eliminar')}
    </button>
  )
}