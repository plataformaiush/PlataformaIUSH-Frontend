import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CreateModulePage } from './CreateModulePage'
import { fetchCursoById } from '../../services/courseService'
import { createModulo } from '../../services/moduleService'
import type { Course } from '../../../domain/courses/types'
import type { Module } from '../../../domain/modules/types'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../services/courseService')
vi.mock('../../services/moduleService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockFetchCursoById = vi.mocked(fetchCursoById)
const mockCreateModulo = vi.mocked(createModulo)

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
  contentIds: ['cont1']
}

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/courses/:courseId/modules/new" element={component} />
      </Routes>
    </BrowserRouter>
  )
}

describe('CreateModulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCursoById.mockResolvedValue(mockCourse)
    mockCreateModulo.mockResolvedValue(mockModule)
    localStorage.clear()
  })

  it('should render loading state initially', () => {
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should render the create module page after loading', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Módulo')).toBeInTheDocument()
    })
  })

  it('should display course title', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })
  })

  it('should show form fields', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/orden/i)).toBeInTheDocument()
    })
  })

  it('should show validation errors for required fields', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Módulo')).toBeInTheDocument()
    })
    
    const submitButton = screen.getByText('Crear Módulo')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/El título es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/La descripción es requerida/i)).toBeInTheDocument()
    })
  })

  it('should create module successfully with valid data', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Módulo')).toBeInTheDocument()
    })
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descripción/i)
    const orderInput = screen.getByLabelText(/orden/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Module' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.change(orderInput, { target: { value: '1' } })
    
    const submitButton = screen.getByText('Crear Módulo')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateModulo).toHaveBeenCalled()
    })
  })

  it('should handle course not found', async () => {
    mockFetchCursoById.mockResolvedValue(null)
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Curso no encontrado')).toBeInTheDocument()
    })
  })

  it('should load draft data from localStorage', async () => {
    const draftData = {
      title: 'Draft Module',
      description: 'Draft Description',
      order: 1,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('create-module-draft', JSON.stringify(draftData))
    
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Draft Module')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Draft Description')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockCreateModulo.mockRejectedValue(new Error('API Error'))
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Módulo')).toBeInTheDocument()
    })
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descripción/i)
    const orderInput = screen.getByLabelText(/orden/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Module' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.change(orderInput, { target: { value: '1' } })
    
    const submitButton = screen.getByText('Crear Módulo')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Error al crear el módulo/i)).toBeInTheDocument()
    })
  })

  it('should show back link to modules', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/new')
    renderWithRouter(<CreateModulePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Volver a módulos')).toBeInTheDocument()
    })
  })
})
