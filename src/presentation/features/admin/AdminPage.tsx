import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAdminDashboard } from './hooks/useAdminDashboard'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface StatPillProps {
  num: string
  label: string
  delta: string
  deltaUp: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-widest mt-1 mb-2">
      {children}
    </p>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-input border border-border rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({
  iconBgClass,
  iconTextClass,
  icon,
  title,
  sub,
}: {
  iconBgClass: string
  iconTextClass: string
  icon: string
  title: string
  sub: string
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-0.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[15px] ${iconBgClass} ${iconTextClass}`}
        >
          <i className={`ti ${icon}`} aria-hidden="true" />
        </div>
        <span className="text-[13px] font-medium text-foreground">{title}</span>
      </div>
      <p className="text-[12px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-input)',
  fontSize: 12,
} as const

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function StatPill({ num, label, delta, deltaUp }: StatPillProps) {
  return (
    <div className="px-5 py-3 border-r border-border last:border-r-0">
      <p className="text-[22px] font-medium text-foreground">{num}</p>
      <p className="text-[12px] text-muted-foreground mt-0.5">{label}</p>
      <p className={`text-[11px] mt-1 ${deltaUp ? 'text-primary' : 'text-secondary'}`}>
        {delta}
      </p>
    </div>
  )
}

// ─── Reportes A-01 .. A-10 ───────────────────────────────────────────────────

function A01TotalUsuarios() {
  const series = [
    { mes: 'Ene', total: 980 },
    { mes: 'Feb', total: 1040 },
    { mes: 'Mar', total: 1105 },
    { mes: 'Abr', total: 1180 },
    { mes: 'May', total: 1284 },
  ]
  const total = series[series.length - 1]?.total ?? 0

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-primary"
        iconTextClass="text-[var(--color-text-on-dark)]"
        icon="ti-users"
        title="A-01 · Total de usuarios registrados"
        sub="Tamaño actual de la plataforma"
      />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[28px] leading-none font-semibold text-foreground">{total.toLocaleString('es-CO')}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Total acumulado (últimos 5 meses)</p>
        </div>
        <div className="w-[220px] h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="mes" hide />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={chartTooltipStyle}
                labelStyle={{ color: 'var(--color-foreground)' }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
              />
              <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

function A02CrecimientoUsuariosPorMes() {
  const data = [
    { mes: 'Dic', nuevos: 58 },
    { mes: 'Ene', nuevos: 72 },
    { mes: 'Feb', nuevos: 60 },
    { mes: 'Mar', nuevos: 65 },
    { mes: 'Abr', nuevos: 75 },
    { mes: 'May', nuevos: 104 },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-tertiary"
        iconTextClass="text-primary"
        icon="ti-trending-up"
        title="A-02 · Crecimiento de usuarios por mes"
        sub="Altas mensuales para analizar adopción"
      />
      <div className="relative w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={14} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={chartTooltipStyle}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemStyle={{ color: 'var(--color-muted-foreground)' }}
            />
            <Bar dataKey="nuevos" fill="var(--color-secondary)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function A03TopCursosConMasInscritos() {
  const data = [
    { curso: 'React Básico', inscritos: 312 },
    { curso: 'SQL Fundamentos', inscritos: 265 },
    { curso: 'Python 1', inscritos: 242 },
    { curso: 'Inglés A1', inscritos: 198 },
    { curso: 'UX Intro', inscritos: 176 },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-secondary"
        iconTextClass="text-[var(--color-text-on-dark)]"
        icon="ti-book"
        title="A-03 · Top 5 cursos con más inscritos"
        sub="Cursos más populares por inscripciones"
      />
      <div className="relative w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 8, right: 12, left: 6, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="curso"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={chartTooltipStyle}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemStyle={{ color: 'var(--color-muted-foreground)' }}
            />
            <Bar dataKey="inscritos" radius={[6, 6, 6, 6]}>
              {data.map((entry, idx) => (
                <Cell
                  key={entry.curso}
                  fill={
                    idx === 0
                      ? 'var(--color-primary)'
                      : idx === 1
                        ? 'var(--color-secondary)'
                        : idx === 2
                          ? 'var(--color-tertiary)'
                          : 'var(--color-muted-foreground)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function A04CursosCreadosPorAdministrador() {
  const data = [
    { admin: 'Laura', cursos: 14 },
    { admin: 'Andrés', cursos: 11 },
    { admin: 'Mónica', cursos: 9 },
    { admin: 'David', cursos: 7 },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-tertiary"
        iconTextClass="text-primary"
        icon="ti-id-badge"
        title="A-04 · Cursos creados por administrador"
        sub="Actividad del equipo por creación de cursos"
      />
      <div className="relative w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={16} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="admin"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={chartTooltipStyle}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemStyle={{ color: 'var(--color-muted-foreground)' }}
            />
            <Bar dataKey="cursos" fill="var(--color-tertiary)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function A05TasaFinalizacionCursos() {
  const completados = 61
  const noCompletados = 39
  const data = [
    { name: 'Finalizados', value: completados, color: 'var(--color-primary)' },
    { name: 'No finalizados', value: noCompletados, color: 'var(--color-muted-foreground)' },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-primary"
        iconTextClass="text-[var(--color-text-on-dark)]"
        icon="ti-checkbox"
        title="A-05 · Tasa de finalización de cursos"
        sub="Engagement medido por completitud"
      />
      <div className="flex items-center gap-4">
        <div className="relative w-[150px] h-[150px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
                stroke="var(--color-input)"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={{ color: 'var(--color-foreground)' }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[22px] font-semibold text-foreground">{completados}%</p>
            <p className="text-[11px] text-muted-foreground">Finalización</p>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Finalizados</span>
            <span className="font-medium text-foreground">{completados}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">No finalizados</span>
            <span className="font-medium text-foreground">{noCompletados}%</span>
          </div>
          <p className="pt-2 text-[11px] text-muted-foreground/90">
            Basado en cohortes recientes (demo)
          </p>
        </div>
      </div>
    </Card>
  )
}

function A06NumeroDeEvaluacionesRealizadas() {
  const data = [
    { mes: 'Dic', evals: 420 },
    { mes: 'Ene', evals: 510 },
    { mes: 'Feb', evals: 470 },
    { mes: 'Mar', evals: 560 },
    { mes: 'Abr', evals: 590 },
    { mes: 'May', evals: 640 },
  ]
  const last = data[data.length - 1]?.evals ?? 0

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-secondary"
        iconTextClass="text-[var(--color-text-on-dark)]"
        icon="ti-clipboard-check"
        title="A-06 · Evaluaciones realizadas"
        sub="Volumen de actividad académica por mes"
      />
      <div className="flex items-end justify-between mb-2">
        <p className="text-[12px] text-muted-foreground">Último mes</p>
        <p className="text-[14px] font-semibold text-foreground">{last.toLocaleString('es-CO')}</p>
      </div>
      <div className="relative w-full h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={chartTooltipStyle}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemStyle={{ color: 'var(--color-muted-foreground)' }}
            />
            <Line type="monotone" dataKey="evals" stroke="var(--color-tertiary)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function A07PromedioCalificacionesPorCurso() {
  const data = [
    { curso: 'React Básico', promedio: 4.3 },
    { curso: 'SQL Fundamentos', promedio: 3.9 },
    { curso: 'Python 1', promedio: 3.6 },
    { curso: 'Inglés A1', promedio: 3.4 },
    { curso: 'UX Intro', promedio: 3.1 },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-tertiary"
        iconTextClass="text-primary"
        icon="ti-chart-bar"
        title="A-07 · Promedio de calificaciones por curso"
        sub="Rendimiento promedio · escala 0–5"
      />
      <div className="relative w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 8, right: 12, left: 6, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 5]}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="curso"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={chartTooltipStyle}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemStyle={{ color: 'var(--color-muted-foreground)' }}
              formatter={(value) => [Number(value).toFixed(1), 'Promedio']}
            />
            <Bar dataKey="promedio" fill="var(--color-primary)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function A08DistribucionUsuariosPorRol() {
  const data = [
    { name: 'Estudiante', value: 74, color: 'var(--color-primary)' },
    { name: 'Docente', value: 18, color: 'var(--color-secondary)' },
    { name: 'Admin', value: 6, color: 'var(--color-tertiary)' },
    { name: 'SuperAdmin', value: 2, color: 'var(--color-muted-foreground)' },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-secondary"
        iconTextClass="text-[var(--color-text-on-dark)]"
        icon="ti-user"
        title="A-08 · Distribución de usuarios por rol"
        sub="Composición del sistema por perfiles"
      />
      <div className="flex items-center gap-4">
        <div className="relative w-[150px] h-[150px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={2}
                stroke="var(--color-input)"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={{ color: 'var(--color-foreground)' }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((row) => (
            <div key={row.name} className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: row.color }} />
                {row.name}
              </span>
              <span className="font-medium text-foreground">{row.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function A09CursosConMayorAbandono() {
  const data = [
    { curso: 'Matemáticas I', abandono: 68, completitud: 32 },
    { curso: 'Física II', abandono: 54, completitud: 46 },
    { curso: 'Historia', abandono: 41, completitud: 59 },
    { curso: 'Programación', abandono: 38, completitud: 62 },
    { curso: 'Inglés A1', abandono: 22, completitud: 78 },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-tertiary"
        iconTextClass="text-primary"
        icon="ti-trending-down"
        title="A-09 · Cursos con mayor abandono"
        sub="Deserción vs completitud (porcentaje)"
      />
      <div className="flex gap-3 mb-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'var(--color-secondary)' }} />
          Abandono
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'var(--color-primary)' }} />
          Completitud
        </span>
      </div>
      <div className="relative w-full h-[185px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={12} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="curso"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={chartTooltipStyle}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemStyle={{ color: 'var(--color-muted-foreground)' }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Bar dataKey="abandono" stackId="a" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completitud" stackId="a" fill="var(--color-primary)" radius={[0, 0, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function A10UsuariosActivosVsInactivos() {
  const activos = 68
  const inactivos = 32
  const data = [
    { name: 'Activos', value: activos, color: 'var(--color-tertiary)' },
    { name: 'Inactivos', value: inactivos, color: 'var(--color-muted-foreground)' },
  ]

  return (
    <Card>
      <CardHeader
        iconBgClass="bg-primary"
        iconTextClass="text-[var(--color-text-on-dark)]"
        icon="ti-activity"
        title="A-10 · Usuarios activos vs inactivos"
        sub="Retención (actividad reciente vs sin actividad)"
      />
      <div className="flex items-center gap-4">
        <div className="relative w-[150px] h-[150px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
                stroke="var(--color-input)"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={{ color: 'var(--color-foreground)' }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[22px] font-semibold text-foreground">{activos}%</p>
            <p className="text-[11px] text-muted-foreground">Activos</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-tertiary)' }} />
              Activos
            </span>
            <span className="font-medium text-foreground">{activos}%</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-muted-foreground)' }} />
              Inactivos
            </span>
            <span className="font-medium text-foreground">{inactivos}%</span>
          </div>
          <p className="pt-2 text-[11px] text-muted-foreground/90">Ventana sugerida: últimos 30 días (demo)</p>
        </div>
      </div>
    </Card>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function AdminPage() {
  const { loading, error } = useAdminDashboard()

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-lg w-full border border-border rounded-2xl bg-input p-6">
          <h1 className="text-base font-semibold text-foreground">No se pudo cargar la vista de admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* Header */}
        <div className="border border-border rounded-xl overflow-hidden bg-input">
          <div className="px-6 py-5 border-b border-border flex items-start justify-between">
            <div>
              <h1 className="text-lg font-medium text-foreground">Panel de administración</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">Reportes A-01…A-10 con la paleta del proyecto</p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-tertiary text-primary">
              <i className="ti ti-circle-dot mr-1" aria-hidden="true" />En vivo
            </span>
          </div>
          <div className="grid grid-cols-4">
            <StatPill num="1.284" label="Usuarios registrados" delta="↑ +104 este mes" deltaUp={true} />
            <StatPill num="68%" label="Usuarios activos" delta="↓ 32% inactivos" deltaUp={false} />
            <StatPill num="61%" label="Finalización cursos" delta="↑ +3pp vs mes anterior" deltaUp={true} />
            <StatPill num="640" label="Evaluaciones (mes)" delta="↑ +8% vs mes anterior" deltaUp={true} />
          </div>
        </div>

        <SectionLabel>Usuarios</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <A01TotalUsuarios />
          <A02CrecimientoUsuariosPorMes />
        </div>

        <SectionLabel>Cursos y equipo</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <A03TopCursosConMasInscritos />
          <A04CursosCreadosPorAdministrador />
          <A05TasaFinalizacionCursos />
          <A06NumeroDeEvaluacionesRealizadas />
          <A07PromedioCalificacionesPorCurso />
          <A08DistribucionUsuariosPorRol />
          <A09CursosConMayorAbandono />
          <A10UsuariosActivosVsInactivos />
        </div>

      </div>
    </div>
  )
}