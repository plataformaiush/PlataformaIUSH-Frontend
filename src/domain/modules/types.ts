export type ModuleStatus = 'active' | 'inactive'

export interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  status: ModuleStatus
  contentIds: string[]
}
