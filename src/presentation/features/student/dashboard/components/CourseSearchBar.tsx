import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

interface CourseSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function CourseSearchBar({
  onSearch,
  placeholder = 'Buscar cursos...',
}: CourseSearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(value.trim()), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value, onSearch])

  return (
    <div className="relative flex items-center">
      <Search
        size={18}
        className="absolute left-3.5 text-secondary pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-xl border border-mid/30
                   bg-surface text-neutral text-base
                   placeholder:text-secondary/60
                   focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                   transition-colors"
        aria-label="Buscar cursos"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 min-w-[28px] min-h-[28px] flex items-center
                     justify-center rounded-full hover:bg-mid/20 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X size={16} className="text-secondary" />
        </button>
      )}
    </div>
  )
}
