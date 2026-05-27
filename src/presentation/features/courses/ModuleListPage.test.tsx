import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ModuleListPage } from './ModuleListPage'
import { fetchModulos } from '../../services/moduleService'
import { fetchCursoById } from '../../services/courseService'
import type { Module } from '../../../domain/modules/types'
import type { Course } from '../../../domain/courses/types'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../services/moduleService')
vi.mock('../../services/courseService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockFetchModulos = vi.mocked(fetchModulos)
const mockFetchCursoById = vi.mocked(fetchCursoById)

const mockCourse: Course = {
  id: 'course-1',
  title: 'React Fundamentals',
  description: 'Learn React basics',
  instructor: 'Ana López',
  level: 'beginner',
  status: 'active',
  moduleIds: ['mod1', 'mod2'],
  studentCount: 42
}

const mockModules: Module[] = [
  {
    id: 'mod1',
    courseId: 'course-1',
    title: 'React Components',
    description: 'Understand components',
    order: 1,
    status: 'active' as const,
    contentIds: ['cont1']
  },
  {
    id: 'mod2',
    courseId: 'course-1',
    title: 'React State',
    description: 'Manage state',
    order: 2,
    status: 'inactive' as const,
    contentIds: ['cont2']
  }
]

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/courses/:courseId/modules" element={component} />
      </Routes>
    </BrowserRouter>
  )
}

describe('ModuleListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCursoById.mockResolvedValue(mockCourse)
    mockFetchModulos.mockResolvedValue(mockModules)
  })

  it('should render loading state initially', () => {
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should render module list after loading', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de Módulos')).toBeInTheDocument()
      expect(screen.getByText('React Components')).toBeInTheDocument()
      expect(screen.getByText('React State')).toBeInTheDocument()
    })
  })

  it('should display course title', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })
  })

  it('should filter modules by status', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Components')).toBeInTheDocument()
    })

    const activeButton = screen.getByText('Activos')
    fireEvent.click(activeButton)

    await waitFor(() => {
      expect(screen.queryByText('React State')).not.toBeInTheDocument()
      expect(screen.getByText('React Components')).toBeInTheDocument()
    })
  })

  it('should show back link to courses', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Volver a cursos')).toBeInTheDocument()
    })
  })

  it('should handle course not found', async () => {
    mockFetchCursoById.mockResolvedValue(null)
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Curso no encontrado.')).toBeInTheDocument()
    })
  })

  it('should show empty state when no modules', async () => {
    mockFetchModulos.mockResolvedValue([])
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No hay módulos disponibles')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockFetchModulos.mockRejectedValue(new Error('API Error'))
    window.history.pushState({}, '', '/courses/course-1/modules')
    renderWithRouter(<ModuleListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de Módulos')).toBeInTheDocument()
    })
  })
})
