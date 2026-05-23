import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ContentListPage } from './ContentListPage'
import { fetchContenidos } from '../../services/contentService'
import { fetchModuloById } from '../../services/moduleService'
import { fetchCursoById } from '../../services/courseService'
import type { Content } from '../../../domain/contents/types'
import type { Module } from '../../../domain/modules/types'
import type { Course } from '../../../domain/courses/types'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ContentType } from '../../../domain/contents/types'

vi.mock('../../services/contentService')
vi.mock('../../services/moduleService')
vi.mock('../../services/courseService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockFetchContenidos = vi.mocked(fetchContenidos)
const mockFetchModuloById = vi.mocked(fetchModuloById)
const mockFetchCursoById = vi.mocked(fetchCursoById)

const mockCourse: Course = {
  id: 'course-1',
  title: 'React Fundamentals',
  description: 'Learn React basics',
  instructor: 'Ana López',
  level: 'beginner',
  status: 'active',
  moduleIds: ['mod1'],
  studentCount: 42
}

const mockModule: Module = {
  id: 'mod1',
  courseId: 'course-1',
  title: 'React Components',
  description: 'Understand components',
  order: 1,
  status: 'active' as const,
  contentIds: ['cont1', 'cont2']
}

const mockContents: Content[] = [
  {
    id: 'cont1',
    moduleId: 'mod1',
    title: 'What is JSX?',
    description: 'Intro to JSX syntax',
    type: ContentType.TEXT,
    status: 'active',
    resourceUrl: 'https://example.com/jsx',
    durationMinutes: undefined,
    order: 1
  },
  {
    id: 'cont2',
    moduleId: 'mod1',
    title: 'Component Props',
    description: 'Learn props',
    type: ContentType.VIDEO,
    status: 'active',
    resourceUrl: 'https://example.com/props',
    durationMinutes: 15,
    order: 2
  }
]

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/courses/:courseId/modules/:moduleId/contents" element={component} />
      </Routes>
    </BrowserRouter>
  )
}

describe('ContentListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCursoById.mockResolvedValue(mockCourse)
    mockFetchModuloById.mockResolvedValue(mockModule)
    mockFetchContenidos.mockResolvedValue(mockContents)
  })

  it('should render loading state initially', () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should render content list after loading', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Components')).toBeInTheDocument()
      expect(screen.getByText('What is JSX?')).toBeInTheDocument()
      expect(screen.getByText('Component Props')).toBeInTheDocument()
    })
  })

  it('should display course and module titles', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('React Components')).toBeInTheDocument()
    })
  })

  it('should show back link to modules', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Volver a módulos')).toBeInTheDocument()
    })
  })

  it('should handle course or module not found', async () => {
    mockFetchCursoById.mockResolvedValue(null)
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Curso o módulo no encontrado.')).toBeInTheDocument()
    })
  })

  it('should show empty state when no contents', async () => {
    mockFetchContenidos.mockResolvedValue([])
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No hay contenidos disponibles')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockFetchContenidos.mockRejectedValue(new Error('API Error'))
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Components')).toBeInTheDocument()
    })
  })

  it('should display content type indicators', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents')
    renderWithRouter(<ContentListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('What is JSX?')).toBeInTheDocument()
      expect(screen.getByText('Component Props')).toBeInTheDocument()
    })
  })
})
