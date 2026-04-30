const comparativo = [
  { metrica: 'Sesiones totales', actual: '12,480', anterior: '10,200', delta: '+22%', up: true },
  { metrica: 'Tiempo promedio', actual: '28 min', anterior: '24 min', delta: '+17%', up: true },
  { metrica: 'Contenidos vistos', actual: '48,300', anterior: '41,000', delta: '+18%', up: true },
  { metrica: 'Certificados', actual: '142', anterior: '98', delta: '+45%', up: true },
  { metrica: 'Nuevos usuarios', actual: '54', anterior: '61', delta: '-11%', up: false },
]

const sesiones = [
  { dia: 'Lun', val: 320 },
  { dia: 'Mar', val: 260 },
  { dia: 'Mié', val: 360 },
  { dia: 'Jue', val: 280 },
  { dia: 'Vie', val: 200 },
  { dia: 'Sáb', val: 80 },
  { dia: 'Dom', val: 40 },
]

const maxVal = Math.max(...sesiones.map((s) => s.val))

// Gráfica de línea suave para sesiones
function SessionLineChart() {
  const width = 400
  const height = 180
  const padding = 40
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2

  const points = sesiones.map((s, i) => {
    const x = padding + (i / (sesiones.length - 1)) * graphWidth
    const y = height - padding - ((s.val / maxVal) * graphHeight)
    return { x, y, val: s.val, dia: s.dia }
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
        const val = Math.round(pct * maxVal)
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
        <text key={i} x={p.x} y={height - 10} textAnchor="middle" className="text-[11px] fill-muted-foreground font-medium">
          {p.dia}
        </text>
      ))}

      {/* Y-axis label */}
      <text x={15} y={20} className="text-[11px] fill-muted-foreground font-medium">Sesiones</text>
    </svg>
  )
}

export function ReportesView() {
  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Reportes</h1>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Métricas de uso institucional</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { l: 'Sesiones este mes', v: '12,480', delta: '+22%', up: true },
          { l: 'Tiempo promedio', v: '28 min', delta: '+17%', up: true },
          { l: 'Certificados emitidos', v: '142', delta: '+45%', up: true },
        ].map((s) => (
          <div key={s.l} className="group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl"
            style={{ 
              background: 'white',
              borderColor: 'var(--color-border)',
              overflow: 'hidden'
            }}>
            {/* Header con color primario */}
            <div className="w-full p-3 transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: 'white'
              }}>
              <p className="text-sm font-semibold uppercase tracking-wider">{s.l}</p>
            </div>
            
            {/* Body blanco */}
            <div className="p-5">
              <p className="text-4xl font-bold mb-3 transition-all duration-300 group-hover:scale-105 origin-left" style={{ color: 'var(--color-primary)' }}>{s.v}</p>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-fit transition-all duration-300"
                style={{ backgroundColor: s.up ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)' }}>
                <span className={`text-sm font-bold ${s.up ? 'text-green-600' : 'text-red-600'}`}>
                  {s.up ? '↑' : '↓'} {s.delta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          borderColor: 'var(--color-border)'
        }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Tendencia de sesiones — últimos 7 días</p>
        </div>
        <div className="p-6" style={{ backgroundColor: 'white' }}>
          <SessionLineChart />
        </div>
      </div>

      {/* Bar chart */}
      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          borderColor: 'var(--color-border)'
        }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Sesiones por día</p>
        </div>
        <div className="p-6" style={{ backgroundColor: 'white' }}>
          <div className="flex items-end justify-between gap-3 h-48 mt-4">
            {sesiones.map((s) => (
              <div key={s.dia} className="flex-1 flex flex-col items-center gap-3 group">
                <div
                  className="w-full rounded-sm group-hover:shadow-lg transition-all"
                  style={{ 
                    height: `${Math.max(15, (s.val / maxVal) * 160)}px`,
                    background: `linear-gradient(to top, var(--color-primary), var(--color-secondary))`,
                    minWidth: '24px'
                  }}
                />
                <span className="text-[11px] font-semibold" style={{ color: 'var(--color-foreground)' }}>{s.dia}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          borderColor: 'var(--color-border)'
        }}>
        <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
          <p className="text-sm font-semibold uppercase tracking-wider">Comparativo mensual</p>
        </div>
        <div className="p-6" style={{ backgroundColor: 'white' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
                {['Métrica', 'Este mes', 'Anterior', 'Variación'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparativo.map((r, i) => (
                <tr key={r.metrica} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: i === comparativo.length - 1 ? '0' : '1px' }}>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--color-foreground)' }}>{r.metrica}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--color-foreground)' }}>{r.actual}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--color-muted-foreground)' }}>{r.anterior}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-semibold ${
                      r.up ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.up ? '↑' : '↓'} {r.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  )
}
