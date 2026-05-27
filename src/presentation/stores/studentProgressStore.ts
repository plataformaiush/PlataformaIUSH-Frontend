import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnrolledCourse, StudentProgress } from '@domain/student/types'

interface StudentProgressStore {
  // Cursos en los que el estudiante está matriculado
  enrolledCourses: EnrolledCourse[]
  enrollCourses: (courses: EnrolledCourse[]) => void
  unenrollAll: () => void
  unenrollCourse: (courseId: string) => void

  // Progreso por contenido
  progress: Record<string, StudentProgress>
  markContentComplete: (courseId: string, contentId: string) => void
  updateLastAccessed: (courseId: string) => void
  getProgress: (courseId: string) => StudentProgress | null
  getRecentCourseIds: (limit?: number) => string[]
  computePercentage: (courseId: string, totalContents: number) => number
  syncFromServer: (serverProgress: StudentProgress[]) => void
}

export const useStudentProgressStore = create<StudentProgressStore>()(
  persist(
    (set, get) => ({
      enrolledCourses: [],

      enrollCourses: (courses) =>
        set(state => ({
          enrolledCourses: [
            ...state.enrolledCourses,
            ...courses.filter(c => !state.enrolledCourses.find(e => e.id === c.id)),
          ],
        })),

      unenrollAll: () => set({ enrolledCourses: [], progress: {} }),

      unenrollCourse: (courseId) =>
        set(state => {
          const { [courseId]: _, ...rest } = state.progress
          return {
            enrolledCourses: state.enrolledCourses.filter(c => c.id !== courseId),
            progress: rest,
          }
        }),

      progress: {},

      markContentComplete: (courseId, contentId) =>
        set(state => {
          const current = state.progress[courseId] ?? {
            courseId,
            completedContents: [],
            lastAccessedAt: new Date().toISOString(),
            percentageComplete: 0,
          }
          if (current.completedContents.includes(contentId)) return state
          const updated = {
            ...current,
            completedContents: [...current.completedContents, contentId],
            lastAccessedAt: new Date().toISOString(),
          }
          // Actualizar también el progreso en la lista de cursos matriculados
          const totalInCourse = state.enrolledCourses.find(c => c.id === courseId)
          const newPct = totalInCourse
            ? Math.min(100, updated.completedContents.length * 10)
            : current.percentageComplete
          return {
            progress: {
              ...state.progress,
              [courseId]: { ...updated, percentageComplete: newPct },
            },
          }
        }),

      updateLastAccessed: (courseId) =>
        set(state => {
          const current = state.progress[courseId] ?? {
            courseId,
            completedContents: [],
            lastAccessedAt: new Date().toISOString(),
            percentageComplete: 0,
          }
          return {
            progress: {
              ...state.progress,
              [courseId]: { ...current, lastAccessedAt: new Date().toISOString() },
            },
          }
        }),

      getProgress: (courseId) => get().progress[courseId] ?? null,

      getRecentCourseIds: (limit = 2) =>
        Object.values(get().progress)
          .sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt))
          .slice(0, limit)
          .map(p => p.courseId),

      computePercentage: (courseId, totalContents) => {
        const p = get().progress[courseId]
        if (!p || totalContents === 0) return 0
        return Math.round((p.completedContents.length / totalContents) * 100)
      },

      syncFromServer: (serverProgress) =>
        set(state => {
          const merged = { ...state.progress }
          for (const sp of serverProgress) merged[sp.courseId] = sp
          return { progress: merged }
        }),
    }),
    { name: 'student-progress' }
  )
)
