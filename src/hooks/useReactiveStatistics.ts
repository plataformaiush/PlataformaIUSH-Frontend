import { useMemo, useCallback, useState, useEffect } from 'react'
import { useCourseStats } from '../stores/courseListStore'
import type { Course } from '../domain/courses/types'

// Enhanced statistics interface
export interface CourseStatistics {
  // Basic counts
  totalCourses: number
  activeCourses: number
  inactiveCourses: number
  totalStudents: number
  
  // Percentages and rates
  activationRate: number
  averageStudentsPerCourse: number
  coursesWithStudents: number
  coursesWithoutStudents: number
  
  // Distribution by status
  statusDistribution: {
    active: { count: number; percentage: number }
    inactive: { count: number; percentage: number }
  }
  
  // Student distribution
  studentDistribution: {
    noStudents: number
    lowStudents: number // 1-10
    mediumStudents: number // 11-50
    highStudents: number // 51+
  }
  
  // Module statistics
  moduleStats: {
    totalModules: number
    averageModulesPerCourse: number
    coursesWithModules: number
    coursesWithoutModules: number
  }
  
  // Trend data (mock for now, would come from analytics)
  trends: {
    newCoursesThisMonth: number
    newStudentsThisMonth: number
    growthRate: number
  }
}

// Reactive statistics hook
export const useReactiveStatistics = (courses: Course[]) => {
  const basicStats = useCourseStats(courses)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)

  // Compute enhanced statistics
  const statistics = useMemo((): CourseStatistics => {
    // Basic stats from store
    const { total, active, inactive, totalStudents, activationRate } = basicStats

    // Student distribution
    const studentDistribution = courses.reduce((acc, course) => {
      const studentCount = course.studentCount || 0
      if (studentCount === 0) acc.noStudents++
      else if (studentCount <= 10) acc.lowStudents++
      else if (studentCount <= 50) acc.mediumStudents++
      else acc.highStudents++
      return acc
    }, {
      noStudents: 0,
      lowStudents: 0,
      mediumStudents: 0,
      highStudents: 0
    })

    // Module statistics
    const moduleStats = courses.reduce((acc, course) => {
      const moduleCount = course.moduleIds?.length || 0
      acc.totalModules += moduleCount
      if (moduleCount > 0) acc.coursesWithModules++
      else acc.coursesWithoutModules++
      return acc
    }, {
      totalModules: 0,
      coursesWithModules: 0,
      coursesWithoutModules: 0
    })

    // Status distribution
    const statusDistribution = {
      active: {
        count: active,
        percentage: total > 0 ? Math.round((active / total) * 100) : 0
      },
      inactive: {
        count: inactive,
        percentage: total > 0 ? Math.round((inactive / total) * 100) : 0
      }
    }

    // Additional computed values
    const averageStudentsPerCourse = total > 0 ? Math.round(totalStudents / total) : 0
    const coursesWithStudents = courses.filter(c => (c.studentCount || 0) > 0).length
    const coursesWithoutStudents = total - coursesWithStudents
    const averageModulesPerCourse = total > 0 ? Math.round(moduleStats.totalModules / total) : 0

    return {
      totalCourses: total,
      activeCourses: active,
      inactiveCourses: inactive,
      totalStudents,
      activationRate,
      averageStudentsPerCourse,
      coursesWithStudents,
      coursesWithoutStudents,
      statusDistribution,
      studentDistribution,
      moduleStats: {
        totalModules: moduleStats.totalModules,
        averageModulesPerCourse,
        coursesWithModules: moduleStats.coursesWithModules,
        coursesWithoutModules: moduleStats.coursesWithoutModules
      },
      trends: {
        newCoursesThisMonth: Math.floor(Math.random() * 5), // Mock data
        newStudentsThisMonth: Math.floor(Math.random() * 50), // Mock data
        growthRate: Math.random() * 20 - 5 // Mock data (-5% to +15%)
      }
    }
  }, [courses, basicStats])

  // Load trend data (mock implementation)
  const loadTrendData = useCallback(async () => {
    setIsLoadingTrends(true)
    // In a real app, this would fetch from an analytics API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoadingTrends(false)
  }, [])

  // Refresh trends when time range changes
  useEffect(() => {
    loadTrendData()
  }, [timeRange, loadTrendData])

  return {
    statistics,
    timeRange,
    setTimeRange,
    isLoadingTrends,
    refreshTrends: loadTrendData
  }
}

// Hook for real-time statistics updates
export const useRealTimeStatistics = (courses: Course[]) => {
  const [previousStats, setPreviousStats] = useState<CourseStatistics | null>(null)
  const [changes, setChanges] = useState<Record<string, number>>({})
  const statistics = useReactiveStatistics(courses)

  // Detect changes
  useEffect(() => {
    if (previousStats) {
      const newChanges: Record<string, number> = {}
      
      // Compare key metrics
      const keys: (keyof CourseStatistics)[] = [
        'totalCourses', 'activeCourses', 'totalStudents', 'activationRate'
      ]
      
      keys.forEach(key => {
        const current = statistics.statistics[key] as number
        const previous = previousStats[key] as number
        if (current !== previous) {
          newChanges[key] = current - previous
        }
      })
      
      setChanges(newChanges)
    }
    
    setPreviousStats(statistics.statistics)
  }, [statistics.statistics, previousStats])

  const hasChanges = Object.keys(changes).length > 0
  const positiveChanges = Object.entries(changes).filter(([, change]) => change > 0)
  const negativeChanges = Object.entries(changes).filter(([, change]) => change < 0)

  return {
    ...statistics,
    changes,
    hasChanges,
    positiveChanges,
    negativeChanges,
    clearChanges: () => setChanges({})
  }
}

// Hook for statistics visualization data
export const useStatisticsVisualization = (statistics: CourseStatistics) => {
  // Chart data for status distribution
  const statusChartData = useMemo(() => [
    { name: 'Activos', value: statistics.activeCourses, percentage: statistics.statusDistribution.active.percentage },
    { name: 'Inactivos', value: statistics.inactiveCourses, percentage: statistics.statusDistribution.inactive.percentage }
  ], [statistics])

  // Chart data for student distribution
  const studentDistributionChartData = useMemo(() => [
    { name: 'Sin estudiantes', value: statistics.studentDistribution.noStudents, color: '#94a3b8' },
    { name: '1-10 estudiantes', value: statistics.studentDistribution.lowStudents, color: '#60a5fa' },
    { name: '11-50 estudiantes', value: statistics.studentDistribution.mediumStudents, color: '#34d399' },
    { name: '51+ estudiantes', value: statistics.studentDistribution.highStudents, color: '#f87171' }
  ], [statistics])

  // Progress data for activation rate
  const activationProgress = useMemo(() => ({
    value: statistics.activationRate,
    label: `${statistics.activationRate}% de activación`,
    color: statistics.activationRate >= 70 ? '#34d399' : 
            statistics.activationRate >= 40 ? '#fbbf24' : '#f87171'
  }), [statistics.activationRate])

  // KPI cards data
  const kpiCards = useMemo(() => [
    {
      title: 'Total Cursos',
      value: statistics.totalCourses,
      change: statistics.trends.newCoursesThisMonth,
      changeType: 'increase' as const,
      icon: '📚'
    },
    {
      title: 'Estudiantes Totales',
      value: statistics.totalStudents,
      change: statistics.trends.newStudentsThisMonth,
      changeType: 'increase' as const,
      icon: '👥'
    },
    {
      title: 'Tasa de Activación',
      value: `${statistics.activationRate}%`,
      change: statistics.trends.growthRate,
      changeType: statistics.trends.growthRate >= 0 ? 'increase' as const : 'decrease' as const,
      icon: '📈'
    },
    {
      title: 'Promedio Estudiantes',
      value: statistics.averageStudentsPerCourse,
      change: null,
      changeType: 'neutral' as const,
      icon: '📊'
    }
  ], [statistics])

  // Heatmap data for course activity (mock data)
  const heatmapData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    return days.map((day, dayIndex) => 
      hours.map((hour, hourIndex) => ({
        day,
        hour,
        value: Math.random() * 100, // Mock activity level
        x: hourIndex,
        y: dayIndex
      }))
    ).flat()
  }, [])

  return {
    statusChartData,
    studentDistributionChartData,
    activationProgress,
    kpiCards,
    heatmapData
  }
}

// Hook for statistics export functionality
export const useStatisticsExport = (statistics: CourseStatistics) => {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = useCallback(async () => {
    setIsExporting(true)
    
    try {
      // Create CSV content
      const headers = ['Métrica', 'Valor', 'Porcentaje']
      const rows = [
        ['Total Cursos', statistics.totalCourses.toString(), ''],
        ['Cursos Activos', statistics.activeCourses.toString(), `${statistics.statusDistribution.active.percentage}%`],
        ['Cursos Inactivos', statistics.inactiveCourses.toString(), `${statistics.statusDistribution.inactive.percentage}%`],
        ['Total Estudiantes', statistics.totalStudents.toString(), ''],
        ['Tasa de Activación', `${statistics.activationRate}%`, ''],
        ['Promedio Estudiantes por Curso', statistics.averageStudentsPerCourse.toString(), ''],
        ['Total Módulos', statistics.moduleStats.totalModules.toString(), ''],
        ['Promedio Módulos por Curso', statistics.moduleStats.averageModulesPerCourse.toString(), '']
      ]

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `course-statistics-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exporting statistics:', error)
    } finally {
      setIsExporting(false)
    }
  }, [statistics])

  const exportToJSON = useCallback(async () => {
    setIsExporting(true)
    
    try {
      const jsonData = JSON.stringify(statistics, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `course-statistics-${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exporting statistics:', error)
    } finally {
      setIsExporting(false)
    }
  }, [statistics])

  return {
    exportToCSV,
    exportToJSON,
    isExporting
  }
}
