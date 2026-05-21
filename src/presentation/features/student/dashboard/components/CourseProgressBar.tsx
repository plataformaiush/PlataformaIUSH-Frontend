interface CourseProgressBarProps {
  value: number
  className?: string
}

export function CourseProgressBar({ value, className = '' }: CourseProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-secondary font-medium">Progreso</span>
        <span
          className={`text-xs font-bold ${clamped === 100 ? 'text-tertiary' : 'text-primary'}`}
        >
          {clamped}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-mid/30 overflow-hidden">
        <div
          className={[
            'h-full rounded-full transition-all duration-700 ease-out',
            clamped === 100
              ? 'bg-gradient-to-r from-secondary to-tertiary'
              : 'bg-gradient-to-r from-primary to-secondary',
          ].join(' ')}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso del curso: ${clamped}%`}
        />
      </div>
    </div>
  )
}
