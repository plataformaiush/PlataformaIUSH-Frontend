/**
 * Skeleton loaders compartidos para CourseListPage, ModuleListPage y ContentListPage.
 * Usan el utilitario `animate-pulse` de Tailwind.
 */

interface TableRowSkeletonProps {
  cols: number
  rows?: number
}

/**
 * Filas vacías estilo "shimmer" para tablas. Mantiene la misma estructura visual
 * que las filas reales para evitar layout shift al cargar.
 */
export const TableRowSkeleton = ({ cols, rows = 5 }: TableRowSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="animate-pulse" style={{ borderBottom: '1px solid #E5E7EB' }}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-5">
              <div className="h-3 rounded-md" style={{ backgroundColor: '#E5E7EB', width: colIdx === 0 ? '70%' : '50%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface StatCardSkeletonProps {
  count?: number
}

/**
 * Skeleton para las tarjetas de estadísticas (CourseListPage).
 */
export const StatCardSkeleton = ({ count = 3 }: StatCardSkeletonProps) => {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-6 rounded-2xl border animate-pulse"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-3 flex-1">
              <div className="h-3 rounded-md w-24" style={{ backgroundColor: '#E5E7EB' }} />
              <div className="h-7 rounded-md w-16" style={{ backgroundColor: '#E5E7EB' }} />
            </div>
            <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: '#E5E7EB' }} />
          </div>
          <div className="h-2 rounded-md w-32" style={{ backgroundColor: '#E5E7EB' }} />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para encabezado de página (badge + título + descripción).
 */
export const PageHeaderSkeleton = () => {
  return (
    <div className="mb-8 animate-pulse">
      <div className="h-5 w-32 rounded-full mb-3" style={{ backgroundColor: '#E5E7EB' }} />
      <div className="h-8 w-64 rounded-md mb-2" style={{ backgroundColor: '#E5E7EB' }} />
      <div className="h-4 w-96 rounded-md" style={{ backgroundColor: '#E5E7EB' }} />
    </div>
  )
}
