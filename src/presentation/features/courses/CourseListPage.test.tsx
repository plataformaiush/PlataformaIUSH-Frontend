import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CourseListPage } from './CourseListPage'
import { fetchCursos, toggleCursoActivo, deleteCurso } from '../../services/courseService'
import { fetchModulos, toggleModuloActivo } from '../../services/moduleService'
import type { Course } from '../../../domain/courses/types'
import type { Module } from '../../../domain/modules/types'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../../services/courseService')
vi.mock('../../services/moduleService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockFetchCursos = vi.mocked(fetchCursos)
const mockToggleCursoActivo = vi.mocked(toggleCursoActivo)
const mockDeleteCurso = vi.mocked(deleteCurso)
const mockFetchModulos = vi.mocked(fetchModulos)
const mockToggleModuloActivo = vi.mocked(toggleModuloActivo)

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React',
    instructor: 'Ana López',
    level: 'beginner',
    status: 'active',
    moduleIds: ['mod1', 'mod2'],
    studentCount: 42
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'Deep dive into TypeScript',
    instructor: 'Carlos Méndez',
    level: 'intermediate',
    status: 'inactive',
    moduleIds: ['mod3'],
    studentCount: 18
  }
]

const mockModules: Module[] = [
  {
    id: 'mod1',
    courseId: '1',
    title: 'React Components',
    description: 'Understand components',
    order: 1,
    status: 'active' as const,
    contentIds: ['cont1']
  }
]

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('CourseListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCursos.mockResolvedValue(mockCourses)
    mockFetchModulos.mockResolvedValue(mockModules)
    mockToggleCursoActivo.mockResolvedValue(mockCourses[0])
    mockDeleteCurso.mockResolvedValue()
    mockToggleModuloActivo.mockResolvedValue(mockModules[0] as Module)
    
    // Mock window.confirm
    global.window.confirm = vi.fn(() => true)
  })

  it('should render loading state initially', () => {
    renderWithRouter(<CourseListPage />)
    expect(screen.getByText('Cargando cursos...')).toBeInTheDocument()
  })

  it('should render course list after loading', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de Cursos')).toBeInTheDocument()
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument()
    })
  })

  it('should display statistics cards', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Cursos')).toBeInTheDocument()
      expect(screen.getByText('Estudiantes Activos')).toBeInTheDocument()
      expect(screen.getByText('Cursos Activos')).toBeInTheDocument()
    })
  })

  it('should filter courses by status', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })

    const activeButton = screen.getByText('Activos')
    fireEvent.click(activeButton)

    await waitFor(() => {
      expect(screen.queryByText('Advanced TypeScript')).not.toBeInTheDocument()
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })
  })

  it('should search courses by title', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar cursos por título, descripción o instructor...')
    fireEvent.change(searchInput, { target: { value: 'React' } })

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
      expect(screen.queryByText('Advanced TypeScript')).not.toBeInTheDocument()
    })
  })

  it('should toggle view mode between table and grid', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Gestión de Cursos')).toBeInTheDocument()
    })

    const gridButton = screen.getByRole('button', { name: /grid/i })
    fireEvent.click(gridButton)

    // Grid mode should show different layout
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
  })

  it('should show create course button', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      const createButton = screen.getByText('Crear curso')
      expect(createButton).toBeInTheDocument()
    })
  })

  it('should handle course deletion', async () => {
    global.window.confirm = vi.fn(() => true)
    
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByTitle('Eliminar curso')[0]
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteCurso).toHaveBeenCalledWith('1')
    })
  })

  it('should handle course activation', async () => {
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })

    const toggleButton = screen.getAllByTitle('Desactivar')[0]
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(mockFetchModulos).toHaveBeenCalledWith('1')
    })
  })

  it('should show error message when API fails', async () => {
    mockFetchCursos.mockRejectedValue(new Error('API Error'))
    
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar los cursos/)).toBeInTheDocument()
    })
  })

  it('should display empty state when no courses', async () => {
    mockFetchCursos.mockResolvedValue([])
    
    renderWithRouter(<CourseListPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No hay cursos disponibles')).toBeInTheDocument()
    })
  })
})
