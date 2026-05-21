export type AdminReportId =
  | 'courses-attention'
  | 'students-low-progress'
  | 'students-most-active'
  | 'teachers-pending-activity'
  | 'course-quality'
  | 'content-issues'
  | 'security-access'
  | 'courses-high-dropout'
  | 'platform-recent-activity'
  | 'course-academic-performance'

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
