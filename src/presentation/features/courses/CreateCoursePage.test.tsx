import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CreateCoursePage } from './CreateCoursePage'
import { createCurso } from '../../services/courseService'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../../services/courseService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockCreateCurso = vi.mocked(createCurso)

const mockCourse = {
  id: '1',
  title: 'Test Course',
  description: 'Test Description',
  instructor: 'Test Instructor',
  level: 'beginner' as const,
  status: 'active' as const,
  moduleIds: [],
  studentCount: 0
}

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('CreateCoursePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateCurso.mockResolvedValue(mockCourse)
    localStorage.clear()
  })

  it('should render the create course page', () => {
    renderWithRouter(<CreateCoursePage />)
    
    expect(screen.getByText('Crear Nuevo Curso')).toBeInTheDocument()
  })

  it('should show form fields', () => {
    renderWithRouter(<CreateCoursePage />)
    
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nivel/i)).toBeInTheDocument()
  })

  it('should show validation errors for required fields', async () => {
    renderWithRouter(<CreateCoursePage />)
    
    const submitButton = screen.getByText('Crear Curso')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/El título es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/La descripción es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/La categoría es requerida/i)).toBeInTheDocument()
    })
  })

  it('should create course successfully with valid data', async () => {
    renderWithRouter(<CreateCoursePage />)
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descripción/i)
    const categoryInput = screen.getByLabelText(/categoría/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Course' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.change(categoryInput, { target: { value: 'Programming' } })
    
    const submitButton = screen.getByText('Crear Curso')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateCurso).toHaveBeenCalled()
    })
  })

  it('should handle instructor tags', () => {
    renderWithRouter(<CreateCoursePage />)
    
    const instructorInput = screen.getByPlaceholderText(/Agregar instructor/i)
    fireEvent.change(instructorInput, { target: { value: 'John Doe' } })
    
    fireEvent.keyDown(instructorInput, { key: 'Enter', code: 'Enter' })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should load draft data from localStorage', () => {
    const draftData = {
      title: 'Draft Course',
      description: 'Draft Description',
      category: 'Programming',
      instructorTags: ['Instructor 1'],
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('create-course-draft', JSON.stringify(draftData))
    
    renderWithRouter(<CreateCoursePage />)
    
    expect(screen.getByDisplayValue('Draft Course')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Draft Description')).toBeInTheDocument()
  })

  it('should show save indicator when draft data exists', () => {
    const draftData = {
      title: 'Draft Course',
      instructorTags: [],
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('create-course-draft', JSON.stringify(draftData))
    
    renderWithRouter(<CreateCoursePage />)
    
    expect(screen.getByText(/Datos recuperados del borrador/i)).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    mockCreateCurso.mockRejectedValue(new Error('API Error'))
    
    renderWithRouter(<CreateCoursePage />)
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descripción/i)
    const categoryInput = screen.getByLabelText(/categoría/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Course' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.change(categoryInput, { target: { value: 'Programming' } })
    
    const submitButton = screen.getByText('Crear Curso')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Error al crear el curso/i)).toBeInTheDocument()
    })
  })

  it('should clear draft data on successful creation', async () => {
    const draftData = {
      title: 'Draft Course',
      instructorTags: [],
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('create-course-draft', JSON.stringify(draftData))
    
    renderWithRouter(<CreateCoursePage />)
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descripción/i)
    const categoryInput = screen.getByLabelText(/categoría/i)
    
    fireEvent.change(titleInput, { target: { value: 'New Course' } })
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } })
    fireEvent.change(categoryInput, { target: { value: 'Programming' } })
    
    const submitButton = screen.getByText('Crear Curso')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(localStorage.getItem('create-course-draft')).toBeNull()
    })
  })
})
