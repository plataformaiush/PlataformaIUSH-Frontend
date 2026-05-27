import { useState, useEffect } from 'react'
import { useCourseListStore } from '../stores/courseListStore'

// Custom hook for debounced search with reactive state
export const useDebounceSearch = (delay: number = 300) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const { setSearchTerm, searchTerm: globalSearchTerm } = useCourseListStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm)
    }, delay)

    return () => clearTimeout(timer)
  }, [localSearchTerm, delay, setSearchTerm])

  // Sync local state with global state when component mounts or external changes occur
  useEffect(() => {
    if (globalSearchTerm !== localSearchTerm) {
      setLocalSearchTerm(globalSearchTerm)
    }
  }, [globalSearchTerm])

  return {
    searchTerm: localSearchTerm,
    setSearchTerm: setLocalSearchTerm,
    isDebouncing: localSearchTerm !== globalSearchTerm
  }
}

// Enhanced debounced search with analytics
export const useReactiveSearch = (delay: number = 300) => {
  const { searchTerm, setSearchTerm, isDebouncing } = useDebounceSearch(delay)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchAnalytics, setSearchAnalytics] = useState({
    totalSearches: 0,
    averageSearchLength: 0,
    mostCommonTerms: [] as string[]
  })

  // Track search analytics
  useEffect(() => {
    if (searchTerm.trim()) {
      setSearchHistory(prev => {
        const newHistory = [searchTerm, ...prev.filter(term => term !== searchTerm)].slice(0, 10)
        
        // Update analytics
        const totalSearches = newHistory.length
        const averageSearchLength = newHistory.reduce((sum, term) => sum + term.length, 0) / totalSearches
        const termFrequency: Record<string, number> = {}
        
        newHistory.forEach(term => {
          const words = term.toLowerCase().split(' ')
          words.forEach(word => {
            if (word.length > 2) {
              termFrequency[word] = (termFrequency[word] || 0) + 1
            }
          })
        })
        
        const mostCommonTerms = Object.entries(termFrequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([term]) => term)
        
        setSearchAnalytics({
          totalSearches,
          averageSearchLength,
          mostCommonTerms
        })
        
        return newHistory
      })
    }
  }, [searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    isDebouncing,
    searchHistory,
    searchAnalytics,
    clearSearch: () => setSearchTerm(''),
    setSearchFromHistory: (term: string) => setSearchTerm(term)
  }
}

// Hook for reactive filtering with multiple criteria
export const useReactiveFilters = () => {
  const { filter, setFilter, searchTerm } = useCourseListStore()

  // Extended filter options for future enhancements
  const [advancedFilters, setAdvancedFilters] = useState({
    hasModules: false,
    hasStudents: false,
    dateRange: { start: '', end: '' },
    instructor: '',
    level: '' as 'beginner' | 'intermediate' | 'advanced' | ''
  })

  const resetFilters = () => {
    setFilter('all')
    setAdvancedFilters({
      hasModules: false,
      hasStudents: false,
      dateRange: { start: '', end: '' },
      instructor: '',
      level: ''
    })
  }

  const hasActiveFilters = filter !== 'all' || 
    searchTerm !== '' || 
    Object.values(advancedFilters).some(value => 
      typeof value === 'boolean' ? value : 
      typeof value === 'string' ? value !== '' : 
      typeof value === 'object' ? Object.values(value).some(v => v !== '') : false
    )

  return {
    filter,
    setFilter,
    advancedFilters,
    setAdvancedFilters,
    resetFilters,
    hasActiveFilters
  }
}
