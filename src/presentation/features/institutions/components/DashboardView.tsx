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

const recentActivity = [
  { text: 'Juan Pérez completó módulo 3', time: 'hace 5 min' },
  { text: 'Nuevo docente registrado', time: 'hace 20 min' },
  { text: 'Curso de Inglés actualizado', time: 'hace 1h' },
  { text: 'María López obtuvo certificado', time: 'hace 2h' },
  { text: 'Nuevo PDF subido en Física', time: 'hace 3h' },
]

const topCursos = [
  { nombre: 'Matemáticas', pct: 88 },
  { nombre: 'Programación', pct: 74 },
  { nombre: 'Inglés', pct: 61 },
  { nombre: 'Física', pct: 45 },
  { nombre: 'Historia', pct: 30 },
]

const contentTypes = [
  { type: 'Video', pct: 45, color: 'rgb(59, 130, 246)' },
  { type: 'Texto', pct: 35, color: 'rgb(34, 197, 94)' },
  { type: 'PDF', pct: 20, color: 'rgb(248, 113, 113)' },
]

// Gráfica de líneas para sesiones
function SessionsChart() {
  const maxVal = Math.max(...sessionesSemanales.map((s) => s.val))
  
  const width = 300
  const height = 150
  const padding = 30
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Panel de control</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Bienvenido, últimas 24 horas</p>
        </div>
        <button className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 50%, var(--color-secondary) 100%)',
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
              <p className="text-sm font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
            
            {/* Body blanco */}
            <div className="p-5">
              <p className="text-4xl font-bold mb-3 transition-all duration-300 group-hover:scale-105 origin-left" style={{ color: 'var(--color-primary)' }}>{s.value}</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sessions Chart */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md" 
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Sesiones semanales</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'white' }}>
            <SessionsChart />
          </div>
        </div>

        {/* Content Pie Chart */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Tipo de contenido</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'white' }}>
            <ContentPieChart />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Cursos más visitados</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'white' }}>
            <div className="space-y-4">
              {topCursos.map((c, idx) => (
                <div key={c.nombre} className="group p-3 rounded-lg transition-all duration-200 hover:bg-muted/40 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium w-24 truncate" style={{ color: 'var(--color-foreground)' }}>{c.nombre}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-md transition-all duration-200 group-hover:scale-110" style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary)15' }}>{c.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-muted)' }}>
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

        {/* Recent Activity */}
        <div className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }}>
            <p className="text-sm font-semibold uppercase tracking-wider">Actividad reciente</p>
          </div>
          <div className="p-6" style={{ backgroundColor: 'white' }}>
            <div className="space-y-0 max-h-64 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-3xl mb-2 text-muted-foreground">-</div>
                  <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Sin actividad</p>
                </div>
              ) : (
                recentActivity.map((a, i) => (
                  <div key={i} className="group flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/40 cursor-pointer"
                    style={{
                      borderBottomColor: 'var(--color-border)',
                      borderBottomWidth: i < recentActivity.length - 1 ? '1px' : '0'
                    }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 transition-transform duration-200 group-hover:scale-150" style={{ backgroundColor: 'var(--color-primary)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-tight transition-colors" style={{ color: 'var(--color-foreground)' }}>{a.text}</p>
                      <p className="text-[10px] mt-1 transition-colors" style={{ color: 'var(--color-muted-foreground)' }}>{a.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
