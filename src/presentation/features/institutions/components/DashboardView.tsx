const stats = [
  { label: 'Estudiantes', value: '1,284', delta: '+12 este mes', up: true },
  { label: 'Docentes', value: '48', delta: '4 inactivos', up: false },
  { label: 'Cursos activos', value: '32', delta: '+3 este mes', up: true },
  { label: 'Contenidos', value: '510', delta: '+28 este mes', up: true },
]

const sessionesSemanales = [
  { dia: 'Lun', val: 280 },
  { dia: 'Mar', val: 240 },
  { dia: 'Mié', val: 320 },
  { dia: 'Jue', val: 260 },
  { dia: 'Vie', val: 180 },
  { dia: 'Sáb', val: 120 },
  { dia: 'Dom', val: 90 },
]

const topCursos = [
  { nombre: 'Matemáticas', pct: 88 },
  { nombre: 'Programación', pct: 74 },
  { nombre: 'Inglés', pct: 61 },
  { nombre: 'Física', pct: 45 },
  { nombre: 'Historia', pct: 30 },
]

const topDocentes = [
  { nombre: 'Carlos Ruiz', estudiantes: 320, cursos: 3 },
  { nombre: 'Pedro Suárez', estudiantes: 280, cursos: 2 },
  { nombre: 'María Torres', estudiantes: 210, cursos: 2 },
  { nombre: 'Luis Gómez', estudiantes: 180, cursos: 1 },
  { nombre: 'Camila Reyes', estudiantes: 140, cursos: 2 },
]

const contentTypes = [
  { type: 'Video', pct: 45, color: 'var(--color-primary)' },
  { type: 'Texto', pct: 35, color: 'var(--color-secondary)' },
  { type: 'PDF', pct: 20, color: 'var(--color-tertiary)' },
]

// Gráfica de líneas para sesiones
function SessionsChart() {
  const maxVal = Math.max(...sessionesSemanales.map((s) => s.val))
  
  const width = 700
  const height = 150
  const padding = 10
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2

  const points = sessionesSemanales.map((s, i) => {
    const x = padding + (i / (sessionesSemanales.length - 1)) * graphWidth
    const y = height - padding - ((s.val / maxVal) * graphHeight)
    return { x, y, val: s.val, dia: s.dia }
  })

  // Curva suave
  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2
    const yc = (points[i].y + points[i - 1].y) / 2
    pathD += ` Q ${xc} ${yc}, ${points[i].x} ${points[i].y}`
  }

  return (
    <svg width="100%" height="150" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sessionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
        </filter>
      </defs>
      
      {/* Area with shadow */}
      <path d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#sessionGradient)" filter="url(#shadow)" />
      
      {/* Line with glow */}
      <path d={pathD} stroke="var(--color-primary)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path d={pathD} stroke="var(--color-primary)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Points with hover effect */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" opacity="0.2" />
          <circle cx={p.x} cy={p.y} r="3" fill="var(--color-primary)" />
        </g>
      ))}
      
      {/* Labels */}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={height - 10} textAnchor="middle" className="text-[9px]" fontSize="10" fill="var(--color-muted-foreground)">
          {p.dia}
        </text>
      ))}
    </svg>
  )
}

// Gráfica de dona para tipo de contenido
function ContentPieChart() {
  let currentAngle = -90
  const radius = 50
  const innerRadius = 32
  const centerX = 70
  const centerY = 70

  const slices = contentTypes.map((item) => {
    const sliceAngle = (item.pct / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle

    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    
    const ix1 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180)
    const iy1 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180)
    const ix2 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180)
    const iy2 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180)
    
    const largeArc = sliceAngle > 180 ? 1 : 0

    return {
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`,
      color: item.color,
      label: item.type,
      pct: item.pct,
    }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0 drop-shadow-sm">
        {slices.map((slice, i) => (
          <path key={i} d={slice.path} fill={slice.color} opacity="0.9" stroke="white" strokeWidth="2" className="transition-opacity duration-300 hover:opacity-100" />
        ))}
        <text x="70" y="73" textAnchor="middle" className="text-xs font-bold" fill="var(--color-foreground)">
          100%
        </text>
      </svg>
      <div className="space-y-3">
        {contentTypes.map((c) => (
          <div key={c.type} className="group flex items-center gap-2.5 p-2 rounded-lg transition-all duration-200 hover:bg-muted/40 cursor-pointer">
            <div className="w-3 h-3 rounded-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-125" style={{ backgroundColor: c.color }} />
            <div className="flex-1">
              <p className="text-xs font-medium transition-colors" style={{ color: 'var(--color-foreground)' }}>{c.type}</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-md transition-all duration-200 group-hover:scale-110" style={{ color: c.color, backgroundColor: `${c.color}15` }}>{c.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardView() {
  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Panel de control</h1>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Bienvenido, últimas 24 horas</p>
        </div>
        <button className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 50%, var(--color-secondary) 100%)',
            color: 'var(--color-text-on-dark)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
          Descargar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl"
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
              <p className="text-sm font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
            
            {/* Body blanco */}
            <div className="p-5">
              <p className="text-4xl font-bold mb-3 transition-all duration-300 group-hover:scale-105 origin-left" style={{ color: 'var(--color-foreground)' }}>{s.value}</p>
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

      {/* Alertas de atención */}
      <div className="border-2 border-amber-300 rounded-xl bg-amber-50 p-6 shadow-md"
        style={{ borderColor: 'var(--color-warning)', backgroundColor: 'var(--color-muted)' }}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>Elementos que requieren atención</h3>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--color-muted-foreground)' }}>Hay algunos problemas que podrían afectar la plataforma</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/60 rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>4</p>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Docentes inactivos</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>3</p>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Cursos sin inscripciones</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>6</p>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Cursos sin contenido</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sessions Chart */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md" 
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Sesiones semanales</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <SessionsChart />
          </div>
        </div>

        {/* Content Pie Chart */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Tipo de contenido</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <ContentPieChart />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Cursos con mayor completitud</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <div className="space-y-4">
              {topCursos.map((c, idx) => (
                <div key={c.nombre} className="group p-3 rounded-lg transition-all duration-200 hover:bg-muted/40 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium w-24 truncate" style={{ color: 'var(--color-foreground)' }}>{c.nombre}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-md transition-all duration-200 group-hover:scale-110" style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary)15' }}>{c.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ 
                      background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                      width: `${c.pct}%`,
                      boxShadow: `0 0 10px rgba(0, 0, 0, 0.1)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Teachers */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))', color: 'var(--color-text-on-dark)' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Top docentes</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <div className="space-y-4">
              {topDocentes.map((d, idx) => (
                <div key={d.nombre} className="group p-3 rounded-lg transition-all duration-200 hover:bg-muted/40 cursor-pointer border" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>{idx + 1}. {d.nombre}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted-foreground)' }}>{d.cursos} {d.cursos === 1 ? 'curso' : 'cursos'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>{d.estudiantes}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>estudiantes</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ 
                      background: `linear-gradient(to right, var(--color-secondary), var(--color-primary))`,
                      width: `${(d.estudiantes / 320) * 100}%`,
                      boxShadow: `0 0 10px rgba(0, 0, 0, 0.1)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
