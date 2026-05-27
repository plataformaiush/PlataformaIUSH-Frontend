import { CSSProperties, ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortableRowProps {
  id: string
  disabled?: boolean
  children: ReactNode
  /**
   * Número de columnas que pinta el contenido (sin contar la columna del handle).
   * Solo se usa por consistencia visual: el handle ocupa una columna adicional.
   */
  showHandle?: boolean
}

/**
 * Fila de tabla sortable basada en @dnd-kit/sortable.
 * Renderiza una celda con el "drag handle" seguida del contenido (un fragmento de <td>s).
 */
export const SortableRow = ({ id, disabled, children, showHandle = true }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#F0FDFA' : undefined,
    borderBottom: '1px solid #E5E7EB',
  }

  return (
    <tr ref={setNodeRef} style={style} className="transition-colors hover:bg-gray-50">
      {showHandle && (
        <td className="px-3 py-5 w-10">
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={disabled}
            aria-label="Arrastrar para reordenar"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-grab active:cursor-grabbing disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            style={{ color: '#6B7280' }}
            title={disabled ? 'Reordenar deshabilitado' : 'Arrastrar para reordenar'}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </td>
      )}
      {children}
    </tr>
  )
}

export default SortableRow
