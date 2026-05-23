import { SesionDia } from './chartUtils'

interface SessionLineChartProps {
  data: SesionDia[]
}

export function SessionLineChart({ data }: SessionLineChartProps) {
  const width = 1000
  const height = 180
  const padding = 15
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2

  const chartMaxVal = Math.max(...data.map((s) => s.sesiones), 1)
  const points = data.map((s, i) => {
    const x = data.length === 1 ? width / 2 : padding + (i / (data.length - 1)) * graphWidth
    const y = height - padding - ((s.sesiones / chartMaxVal) * graphHeight)
    return { x, y, val: s.sesiones, dia: s.dia }
  })

  // Crear curva suave con quadratic Bezier
  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2
    const yc = (points[i].y + points[i - 1].y) / 2
    pathD += ` Q ${xc} ${yc}, ${points[i].x} ${points[i].y}`
  }

  return (
    <svg width="100%" height="180" viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = height - padding - (pct * graphHeight)
        const val = Math.round(pct * chartMaxVal)
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgb(226, 232, 240)" strokeWidth="1" strokeDasharray="4" />
            <text x={padding - 10} y={y + 3} textAnchor="end" className="text-[10px] fill-muted-foreground">{val}</text>
          </g>
        )
      })}

      {/* Area under curve */}
      <path d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#lineGradient)" />

      {/* Line */}
      <path d={pathD} stroke="rgb(59, 130, 246)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="rgb(59, 130, 246)" stroke="white" strokeWidth="2" />
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={height } textAnchor="middle" className="text-[11px] fill-muted-foreground font-medium">
          {p.dia}
        </text>
      ))}

      {/* Y-axis label */}
      <text x={15} y={9} className="text-[11px] fill-muted-foreground font-medium">Sesiones</text>
    </svg>
  )
}
