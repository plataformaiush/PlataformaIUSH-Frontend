import { SesionDia } from './chartUtils'

interface SessionsChartProps {
  data: SesionDia[]
}

export function SessionsChart({ data }: SessionsChartProps) {
  if (!data || data.length === 0) return null

  const maxVal = Math.max(...data.map((s) => s.sesiones), 1)
  
  const width = 1000
  const height = 220
  const padding = 30
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2

  const points = data.map((s, i) => {
    const x = data.length === 1 ? width / 2 : padding + (i / (data.length - 1)) * graphWidth
    const y = height - padding - ((s.sesiones / maxVal) * graphHeight)
    const [year, month, day] = s.dia.split('-').map(Number)
    const dia = new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 3)
    return { x, y, val: s.sesiones, dia }
  })

  let pathD = `M ${points[0].x} ${points[0].y}`
  if (points.length > 1) {
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2
      const yc = (points[i].y + points[i - 1].y) / 2
      pathD += ` Q ${xc} ${yc}, ${points[i].x} ${points[i].y}`
    }
  }

  return (
    <svg width="100%" height="220" viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sessionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = height - padding - (pct * graphHeight)
        const val = Math.round(pct * maxVal)
        return (
          <g key={i}>
            <line x1={padding + 5} y1={y} x2={width - padding} y2={y} stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="6,4" vectorEffect="non-scaling-stroke" />
            <text x={padding - 12} y={y + 6} textAnchor="end" fontSize="13" fontFamily="'Courier New', monospace" fontWeight="700" fill="#6B7280" letterSpacing="1">
              {val}
            </text>
          </g>
        )
      })}

      {/* Area under curve */}
      <path d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#sessionGradient)" />

      {/* Line background (lighter) */}
      <path d={pathD} stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" vectorEffect="non-scaling-stroke" />

      {/* Main Line */}
      <path d={pathD} stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="6" fill="#3B82F6" opacity="0.18" />
          <circle cx={p.x} cy={p.y} r="4" fill="#3B82F6" stroke="white" strokeWidth="2.5" />
        </g>
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={height - 8} textAnchor="middle" fontSize="13" fontFamily="'Courier New', monospace" fontWeight="700" fill="#374151" letterSpacing="0.5">
          {p.dia.toUpperCase()}
        </text>
      ))}

      {/* Y-axis label */}
      <text x={12} y={22} fontSize="13" fontFamily="'Courier New', monospace" fontWeight="700" fill="#6B7280" letterSpacing="0.5">
        Sesiones
      </text>
    </svg>
  )
}
