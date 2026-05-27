import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Course } from '../../domain/courses/types'

interface CourseListState {
  // UI State
  filter: 'all' | 'active' | 'inactive'
  searchTerm: string
  viewMode: 'grid' | 'table'
  page: number
  limit: number
  
  // Edit state
  editingCourse: Course | null
  editTitle: string
  editDescription: string
  editStatus: 'active' | 'inactive'
  editSaving: boolean
  
  // Reorder state
  reorderMode: boolean
  reorderSaving: boolean
  reorderWarning: string | null
  
  // Loading states
  togglingCourse: string | null
  error: string | null
  
  // Actions
  setFilter: (filter: 'all' | 'active' | 'inactive') => void
  setSearchTerm: (searchTerm: string) => void
  setViewMode: (viewMode: 'grid' | 'table') => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  
  setEditingCourse: (course: Course | null) => void
  setEditTitle: (title: string) => void
  setEditDescription: (description: string) => void
  setEditStatus: (status: 'active' | 'inactive') => void
  setEditSaving: (saving: boolean) => void
  
  setReorderMode: (mode: boolean) => void
  setReorderSaving: (saving: boolean) => void
  setReorderWarning: (warning: string | null) => void
  
  setTogglingCourse: (courseId: string | null) => void
  setError: (error: string | null) => void
  
  // Computed selectors
  getFilteredCourses: (courses: Course[]) => Course[]
  getActiveCourses: (courses: Course[]) => Course[]
  getTotalStudents: (courses: Course[]) => number
  getCourseStats: (courses: Course[]) => {
    total: number
    active: number
    inactive: number
    totalStudents: number
    activationRate: number
  }
}

export const useCourseListStore = create<CourseListState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    filter: 'all',
    searchTerm: '',
    viewMode: 'table',
    page: 1,
    limit: 10,
    
    editingCourse: null,
    editTitle: '',
    editDescription: '',
    editStatus: 'inactive',
    editSaving: false,
    
    reorderMode: false,
    reorderSaving: false,
    reorderWarning: null,
    
    togglingCourse: null,
    error: null,
    
    // Actions
    setFilter: (filter) => set({ filter }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setViewMode: (viewMode) => set({ viewMode }),
    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit }),
    
    setEditingCourse: (course) => set({ 
      editingCourse: course,
      editTitle: course?.title || '',
      editDescription: course?.description || '',
      editStatus: course?.status || 'inactive'
    }),
    setEditTitle: (title) => set({ editTitle: title }),
    setEditDescription: (description) => set({ editDescription: description }),
    setEditStatus: (status) => set({ editStatus: status }),
    setEditSaving: (saving) => set({ editSaving: saving }),
    
    setReorderMode: (mode) => set({ reorderMode: mode }),
    setReorderSaving: (saving) => set({ reorderSaving: saving }),
    setReorderWarning: (warning) => set({ reorderWarning: warning }),
    
    setTogglingCourse: (courseId) => set({ togglingCourse: courseId }),
    setError: (error) => set({ error }),
    
    // Computed selectors
    getFilteredCourses: (courses) => {
      const { filter, searchTerm } = get()
      return courses.filter((c) => {
        const matchesFilter = 
          filter === 'all' || 
          (filter === 'active' && c.status === 'active') || 
          (filter === 'inactive' && c.status === 'inactive')
        
        const matchesSearch = 
          searchTerm === '' || 
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        
        return matchesFilter && matchesSearch
      })
    },
    
    getActiveCourses: (courses) => courses.filter((c) => c.status === 'active'),
    
    getTotalStudents: (courses) => courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0),
    
    getCourseStats: (courses) => {
      const activeCourses = courses.filter((c) => c.status === 'active')
      const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0)
      
      return {
        total: courses.length,
        active: activeCourses.length,
        inactive: courses.length - activeCourses.length,
        totalStudents,
        activationRate: courses.length ? Math.round((activeCourses.length / courses.length) * 100) : 0
      }
    }
  }))
)

// Reactive hooks for computed values
export const useFilteredCourses = (courses: Course[]) => {
  return useCourseListStore(state => state.getFilteredCourses(courses))
}

export const useActiveCourses = (courses: Course[]) => {
  return useCourseListStore(state => state.getActiveCourses(courses))
}

export const useTotalStudents = (courses: Course[]) => {
  return useCourseListStore(state => state.getTotalStudents(courses))
}

export const useCourseStats = (courses: Course[]) => {
  return useCourseListStore(state => state.getCourseStats(courses))
}
