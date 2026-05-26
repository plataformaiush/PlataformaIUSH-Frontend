import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { fetchCursos, toggleCursoActivo, deleteCurso, updateCurso, reorderCursos } from '../presentation/services/courseService'
import { fetchModulos, toggleModuloActivo } from '../presentation/services/moduleService'
import { logger } from '../presentation/utils/logger'
import type { Course } from '../domain/courses/types'

// Query keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number }) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
}

// Reactive courses query with pagination
export const useCoursesQuery = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: courseKeys.list({ page, limit }),
    queryFn: () => fetchCursos({ page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// Infinite scroll for courses
export const useInfiniteCoursesQuery = (limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: courseKeys.lists(),
    queryFn: ({ pageParam = 1 }) => fetchCursos({ page: pageParam as number, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined
      return (lastPageParam as number) + 1
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// Reactive mutation for toggling course status
export const useToggleCourseMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ courseId, newStatus }: { courseId: string; newStatus: boolean }) => {
      // If activating, check if course has active modules
      if (newStatus) {
        const modules = await fetchModulos(courseId)
        const activeModules = modules.filter((m: any) => m.status === 'active')
        
        if (activeModules.length === 0) {
          throw new Error('VALIDATION_ERROR: El curso no puede activarse porque no tiene módulos activos. Active al menos un módulo antes de activar el curso.')
        }
        
        await toggleCursoActivo(courseId, true)
        logger.info('Curso activado', { courseId, activeModuleCount: activeModules.length })
      } else {
        // If deactivating, fetch modules first for cascade deactivation
        const modules = await fetchModulos(courseId)
        const activeModules = modules.filter((m: any) => m.status === 'active')
        
        // Deactivate course first
        await toggleCursoActivo(courseId, false)
        logger.info('Curso desactivado', { courseId, activeModuleCount: activeModules.length })
        
        // Then deactivate all active modules in cascade
        if (activeModules.length > 0) {
          await Promise.all(
            activeModules.map((module: any) => toggleModuloActivo(courseId, module.id, false))
          )
          logger.info('Módulos desactivados en cascada', { courseId, moduleCount: activeModules.length })
        }
      }
      
      return { courseId, newStatus }
    },
    onMutate: async ({ courseId, newStatus }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: courseKeys.lists() })
      
      // Snapshot the previous value
      const previousCourses = queryClient.getQueriesData({ queryKey: courseKeys.lists() })
      
      // Optimistically update all course queries
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old: any) => {
        if (!old) return old
        
        if (Array.isArray(old)) {
          // For infinite query pages
          return old.map((page: Course[]) => 
            page.map(course => 
              course.id === courseId 
                ? { ...course, status: newStatus ? 'active' : 'inactive' }
                : course
            )
          )
        } else {
          // For single query
          return old.map((course: Course) => 
            course.id === courseId 
              ? { ...course, status: newStatus ? 'active' : 'inactive' }
              : course
          )
        }
      })
      
      return { previousCourses }
    },
    onError: (err, variables, context) => {
      logger.error('Error al cambiar estado del curso', { error: err, courseId: variables.courseId })
      
      // Revert optimistic update
      if (context?.previousCourses) {
        queryClient.setQueriesData({ queryKey: courseKeys.lists() }, context.previousCourses)
      }
      
      // Handle validation errors specifically
      if (err.message?.includes('VALIDATION_ERROR')) {
        // Extract the user-friendly message
        const userMessage = err.message.replace('VALIDATION_ERROR: ', '')
        throw new Error(userMessage)
      }
      
      throw err
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

// Reactive mutation for updating course
export const useUpdateCourseMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ courseId, updates, statusChange }: { 
      courseId: string
      updates: { title: string; description: string }
      statusChange?: { from: string; to: string }
    }) => {
      await updateCurso(courseId, updates)
      
      if (statusChange) {
        await toggleCursoActivo(courseId, statusChange.to === 'active')
      }
      
      return { courseId, ...updates, statusChange }
    },
    onMutate: async ({ courseId, updates, statusChange }) => {
      await queryClient.cancelQueries({ queryKey: courseKeys.lists() })
      
      const previousCourses = queryClient.getQueriesData({ queryKey: courseKeys.lists() })
      
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old: any) => {
        if (!old) return old
        
        if (Array.isArray(old)) {
          return old.map((page: Course[]) => 
            page.map(course => 
              course.id === courseId 
                ? { 
                    ...course, 
                    ...updates,
                    status: statusChange ? statusChange.to : course.status
                  }
                : course
            )
          )
        } else {
          return old.map((course: Course) => 
            course.id === courseId 
              ? { 
                  ...course, 
                  ...updates,
                  status: statusChange ? statusChange.to : course.status
                }
              : course
          )
        }
      })
      
      return { previousCourses }
    },
    onError: (err, variables, context) => {
      logger.error('Error al actualizar curso', { error: err, courseId: variables.courseId })
      
      if (context?.previousCourses) {
        queryClient.setQueriesData({ queryKey: courseKeys.lists() }, context.previousCourses)
      }
      
      throw err
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

// Reactive mutation for deleting course
export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      await deleteCurso(courseId)
      logger.info('Curso eliminado', { courseId })
      return courseId
    },
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: courseKeys.lists() })
      
      const previousCourses = queryClient.getQueriesData({ queryKey: courseKeys.lists() })
      
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old: any) => {
        if (!old) return old
        
        if (Array.isArray(old)) {
          return old.map((page: Course[]) => 
            page.filter(course => course.id !== courseId)
          )
        } else {
          return old.filter((course: Course) => course.id !== courseId)
        }
      })
      
      return { previousCourses }
    },
    onError: (err, courseId, context) => {
      logger.error('Error al eliminar curso', { error: err, courseId })
      
      if (context?.previousCourses) {
        queryClient.setQueriesData({ queryKey: courseKeys.lists() }, context.previousCourses)
      }
      
      throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

// Reactive mutation for reordering courses
export const useReorderCoursesMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (reorderedCourses: Course[]) => {
      const payload = reorderedCourses.map((c, idx) => ({ id_curso: c.id, orden: idx + 1 }))
      const updated = await reorderCursos(payload)
      return updated
    },
    onMutate: async (reorderedCourses) => {
      await queryClient.cancelQueries({ queryKey: courseKeys.lists() })
      
      const previousCourses = queryClient.getQueriesData({ queryKey: courseKeys.lists() })
      
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, reorderedCourses)
      
      return { previousCourses }
    },
    onError: (err, _variables, context) => {
      logger.error('Error al reordenar cursos', { error: err })
      
      if (context?.previousCourses) {
        queryClient.setQueriesData({ queryKey: courseKeys.lists() }, context.previousCourses)
      }
      
      if ((err as any)?.notImplemented) {
        // Backend aún no expone el endpoint: mantenemos el orden visual y avisamos al usuario.
        logger.warn('Reorden de cursos solo local: backend no implementa /cursos/reorder')
        throw new Error('Cambios visuales aplicados. El backend aún no persiste el orden de cursos.')
      }
      
      throw err
    },
    onSuccess: (updatedCourses) => {
      queryClient.setQueriesData({ queryKey: courseKeys.lists() }, updatedCourses)
    },
  })
}

// Hook for prefetching next page
export const usePrefetchNextPage = (currentPage: number, limit: number) => {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: courseKeys.list({ page: currentPage + 1, limit }),
      queryFn: () => fetchCursos({ page: currentPage + 1, limit }),
      staleTime: 5 * 60 * 1000,
    })
  }
}
