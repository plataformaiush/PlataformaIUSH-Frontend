import { AdminReportCard } from './components/AdminReportCard'
import { useAdminDashboard } from './hooks/useAdminDashboard'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function toNumber(value: string | number): number {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-input)',
  fontSize: 12,
} as const

function CardShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-border rounded-2xl overflow-hidden bg-input">
      <header className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border rounded-2xl bg-input p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function AdminPage() {
  const { dashboard, loading, error } = useAdminDashboard()

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

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-lg w-full border border-border rounded-2xl bg-input p-6">
          <h1 className="text-base font-semibold text-foreground">No hay datos para mostrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">Intenta recargar la página.</p>
        </div>
      </div>
    )
  }

  const reports = [...dashboard.reports].sort((a, b) => a.order - b.order)

  const totalUsuariosReport = dashboard.reports.find((r) => r.id === 'usuarios-total-por-mi')
  const usuariosActivosReport = dashboard.reports.find((r) => r.id === 'usuarios-activos-por-mi')
  const estudiantesInscritosReport = dashboard.reports.find((r) => r.id === 'estudiantes-inscritos-mis-cursos')
  const estudiantesCompletadosReport = dashboard.reports.find((r) => r.id === 'estudiantes-completados-mis-cursos')
  const usuariosPorRolReport = dashboard.reports.find((r) => r.id === 'usuarios-por-rol-por-mi')
  const topInscritosReport = dashboard.reports.find((r) => r.id === 'top-cursos-inscritos-mis-cursos')
  const topCompletadosReport = dashboard.reports.find((r) => r.id === 'top-cursos-completados-mis-cursos')

  const totalUsuarios =
    totalUsuariosReport?.kind === 'metrics' ? totalUsuariosReport.metrics[0]?.value ?? 0 : 0
  const usuariosActivos =
    usuariosActivosReport?.kind === 'metrics' ? usuariosActivosReport.metrics[0]?.value ?? 0 : 0
  const estudiantesInscritos =
    estudiantesInscritosReport?.kind === 'metrics' ? estudiantesInscritosReport.metrics[0]?.value ?? 0 : 0
  const estudiantesCompletados =
    estudiantesCompletadosReport?.kind === 'metrics'
      ? estudiantesCompletadosReport.metrics[0]?.value ?? 0
      : 0

  const pieData =
    usuariosPorRolReport?.kind === 'metrics'
      ? usuariosPorRolReport.metrics
          .map((m) => ({ name: m.label, value: toNumber(m.value) }))
          .filter((m) => m.value > 0)
      : []

  const barInscritosData =
    topInscritosReport?.kind === 'metrics'
      ? topInscritosReport.metrics.map((m) => ({ name: m.label, value: toNumber(m.value) }))
      : []

  const barCompletadosData =
    topCompletadosReport?.kind === 'metrics'
      ? topCompletadosReport.metrics.map((m) => ({ name: m.label, value: toNumber(m.value) }))
      : []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <div className="border border-border rounded-xl overflow-hidden bg-input">
          <div className="px-6 py-5 border-b border-border flex items-start justify-between">
            <div>
              <h1 className="text-lg font-medium text-foreground">Panel de administración</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Reportes basados en usuarios creados por ti y cursos tuyos o de tus docentes
              </p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-tertiary text-primary">
              <i className="ti ti-circle-dot mr-1" aria-hidden="true" />En vivo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Total de usuarios (por mí)" value={totalUsuarios} />
          <KpiCard label="Usuarios activos (por mí)" value={usuariosActivos} />
          <KpiCard label="Estudiantes inscritos (mis cursos)" value={estudiantesInscritos} />
          <KpiCard label="Estudiantes completados (mis cursos)" value={estudiantesCompletados} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <CardShell
            title="Usuarios por rol"
            subtitle="Distribución de usuarios creados por ti"
          >
            {pieData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Sin datos para mostrar</p>
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                      {pieData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={
                            index % 3 === 0
                              ? 'var(--color-primary)'
                              : index % 3 === 1
                                ? 'var(--color-secondary)'
                                : 'var(--color-tertiary)'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ color: 'var(--color-foreground)' }}
                      itemStyle={{ color: 'var(--color-muted-foreground)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardShell>

          <CardShell
            title="Top cursos con más inscritos"
            subtitle="Cursos creados por ti o por tus docentes"
          >
            {barInscritosData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Sin datos para mostrar</p>
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barInscritosData} margin={{ top: 6, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={48}
                      tickFormatter={(value) => String(value).slice(0, 18)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                      width={34}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ color: 'var(--color-foreground)' }}
                      itemStyle={{ color: 'var(--color-muted-foreground)' }}
                    />
                    <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 8, 8]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardShell>

          <CardShell
            title="Top cursos con más completados"
            subtitle="Cursos creados por ti o por tus docentes"
          >
            {barCompletadosData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Sin datos para mostrar</p>
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barCompletadosData} margin={{ top: 6, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={48}
                      tickFormatter={(value) => String(value).slice(0, 18)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                      width={34}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ color: 'var(--color-foreground)' }}
                      itemStyle={{ color: 'var(--color-muted-foreground)' }}
                    />
                    <Bar dataKey="value" fill="var(--color-secondary)" radius={[8, 8, 8, 8]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardShell>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reports.map((report) => (
            <AdminReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </div>
  )
}
