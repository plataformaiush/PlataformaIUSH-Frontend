interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  up?: boolean
}

export function StatCard({ label, value, delta, up }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl"
      style={{
        background: 'var(--color-muted)',
        borderColor: 'var(--color-border)',
        overflow: 'hidden'
      }}>
      {/* Header con color primario */}
      <div className="w-full p-3 transition-all duration-300"
        style={{ 
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: 'var(--color-text-on-dark)'
        }}>
        <p className="text-sm font-semibold uppercase tracking-wider">{label}</p>
      </div>
      
      {/* Body */}
      <div className="p-5">
        <p className="text-4xl font-bold mb-3 transition-all duration-300 group-hover:scale-105 origin-left" style={{ color: 'var(--color-foreground)' }}>{value}</p>
        {delta && up !== undefined && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-fit transition-all duration-300"
            style={{ backgroundColor: up ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)' }}>
            <span className={`text-sm font-bold ${up ? 'text-green-600' : 'text-red-600'}`}>
              {up ? '↑' : '↓'} {delta}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
