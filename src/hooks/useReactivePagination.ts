import { useState, useEffect, useCallback, useRef } from 'react'
import { useCourseListStore } from '../stores/courseListStore'

// Reactive pagination hook with infinite scroll support
export const useReactivePagination = (totalItems: number, itemsPerPage: number = 10) => {
  const { page, setPage } = useCourseListStore()
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentPage = page
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Update hasMore based on current data
  useEffect(() => {
    setHasMore(hasNextPage)
  }, [hasNextPage, totalItems, itemsPerPage])

  // Navigation functions
  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages, setPage])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(page + 1)
    }
  }, [hasNextPage, page, setPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(page - 1)
    }
  }, [hasPreviousPage, setPage])

  const firstPage = useCallback(() => {
    setPage(1)
  }, [setPage])

  const lastPage = useCallback(() => {
    setPage(totalPages)
  }, [totalPages, setPage])

  // Infinite scroll setup
  const setupInfiniteScroll = useCallback(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading) {
          nextPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoading, nextPage])

  // Auto setup infinite scroll when component mounts
  useEffect(() => {
    const cleanup = setupInfiniteScroll()
    return cleanup
  }, [setupInfiniteScroll])

  // Manual load more function
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true)
      nextPage()
      // Reset loading state after a short delay to prevent rapid clicks
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [hasMore, isLoading, nextPage])

  // Reset pagination when filters change
  const resetPagination = useCallback(() => {
    setPage(1)
    setHasMore(true)
    setIsLoading(false)
  }, [setPage])

  // Generate page numbers for pagination UI
  const getPageNumbers = useCallback(() => {
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return {
      pages,
      showStartEllipsis: startPage > 2,
    showEndEllipsis: endPage < totalPages - 1
    }
  }, [currentPage, totalPages])

  return {
    // Current state
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasMore,
    isLoading,
    hasNextPage,
    hasPreviousPage,

    // Navigation
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    loadMore,

    // UI helpers
    resetPagination,
    getPageNumbers,
    loadMoreRef,
    
    // Visibility range for display
    visibleRange: totalItems > 0 ? `${startIndex + 1}-${endPage}` : '0-0'
  }
}

// Enhanced pagination with prefetching
export const useSmartPagination = (totalItems: number, itemsPerPage: number = 10, prefetchNext: boolean = true) => {
  const pagination = useReactivePagination(totalItems, itemsPerPage)
  const [prefetchedPages, setPrefetchedPages] = useState<Set<number>>(new Set())

  // Prefetch next page data
  useEffect(() => {
    if (prefetchNext && pagination.hasMore && !prefetchedPages.has(pagination.currentPage + 1)) {
      // This would be used with React Query's prefetchQuery
      setPrefetchedPages(prev => new Set([...prev, pagination.currentPage + 1]))
    }
  }, [pagination.currentPage, pagination.hasMore, prefetchNext, prefetchedPages])

  // Clear prefetched pages when filters change
  const clearPrefetched = useCallback(() => {
    setPrefetchedPages(new Set())
  }, [])

  return {
    ...pagination,
    prefetchedPages,
    clearPrefetched,
    isNextPagePrefetched: prefetchedPages.has(pagination.currentPage + 1)
  }
}

// Virtual scrolling hook for large datasets
export const useVirtualScroll = (
  items: any[], 
  itemHeight: number, 
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  )
  
  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan)
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
    visibleRange: `${visibleStart + 1}-${visibleEnd + 1}`
  }
}
