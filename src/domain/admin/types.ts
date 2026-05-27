export type AdminReportId =
  | 'usuarios-total-por-mi'
  | 'usuarios-activos-por-mi'
  | 'usuarios-por-rol-por-mi'
  | 'estudiantes-inscritos-mis-cursos'
  | 'estudiantes-completados-mis-cursos'
  | 'top-cursos-inscritos-mis-cursos'
  | 'top-cursos-completados-mis-cursos'

export interface AdminReportMetric {
  id: string
  label: string
  value: string | number
}

export interface AdminFeedSection {
  id: string
  title: string
  entries: string[]
}

interface BaseAdminReport {
  id: AdminReportId
  order: number
  title: string
  description?: string
}

export interface AdminMetricsReport extends BaseAdminReport {
  kind: 'metrics'
  metrics: AdminReportMetric[]
}

export interface AdminFeedReport extends BaseAdminReport {
  kind: 'feed'
  sections: AdminFeedSection[]
}

export type AdminReport = AdminMetricsReport | AdminFeedReport

export interface AdminDashboard {
  reports: AdminReport[]
}
