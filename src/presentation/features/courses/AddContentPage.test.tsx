import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AddContentPage } from './AddContentPage'
import { fetchCursoById } from '../../services/courseService'
import { fetchModuloById } from '../../services/moduleService'
import { createContenido } from '../../services/contentService'
import type { Course } from '../../../domain/courses/types'
import type { Module } from '../../../domain/modules/types'
import type { Content } from '../../../domain/contents/types'
import { ContentType } from '../../../domain/contents/types'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../services/courseService')
vi.mock('../../services/moduleService')
vi.mock('../../services/contentService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockFetchCursoById = vi.mocked(fetchCursoById)
const mockFetchModuloById = vi.mocked(fetchModuloById)
const mockCreateContenido = vi.mocked(createContenido)

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

const mockContent: Content = {
  id: 'cont1',
  moduleId: 'mod1',
  title: 'What is JSX?',
  description: 'Intro to JSX',
  type: ContentType.VIDEO,
  status: 'active',
  resourceUrl: 'https://example.com/video',
  durationMinutes: 10,
  order: 1
}

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/courses/:courseId/modules/:moduleId/contents/new" element={component} />
      </Routes>
    </BrowserRouter>
  )
}

describe('AddContentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCursoById.mockResolvedValue(mockCourse)
    mockFetchModuloById.mockResolvedValue(mockModule)
    mockCreateContenido.mockResolvedValue(mockContent)
  })

  it('should render loading state initially', () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should render the create content page after loading', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Agregar Nuevo Contenido')).toBeInTheDocument()
    })
  })

  it('should display course and module titles', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('React Components')).toBeInTheDocument()
    })
  })

  it('should show form fields', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
    })
  })

  it('should show content type options', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Vídeo')).toBeInTheDocument()
      expect(screen.getByText('Imagen')).toBeInTheDocument()
      expect(screen.getByText('Documento')).toBeInTheDocument()
      expect(screen.getByText('Texto')).toBeInTheDocument()
    })
  })

  it('should show validation errors for required fields', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Agregar Nuevo Contenido')).toBeInTheDocument()
    })
    
    const submitButton = screen.getByText('Agregar Contenido')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/El título es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/La descripción es requerida/i)).toBeInTheDocument()
    })
  })

  it('should create content successfully with valid data', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Agregar Nuevo Contenido')).toBeInTheDocument()
    })
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descripción/i)
    const urlInput = screen.getByLabelText(/url/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Content' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.change(urlInput, { target: { value: 'https://example.com/video' } })
    
    const submitButton = screen.getByText('Agregar Contenido')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateContenido).toHaveBeenCalled()
    })
  })

  it('should handle course or module not found', async () => {
    mockFetchCursoById.mockResolvedValue(null)
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Curso o módulo no encontrado')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockCreateContenido.mockRejectedValue(new Error('API Error'))
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Agregar Nuevo Contenido')).toBeInTheDocument()
    })
    
    const titleInput = screen.getByLabelText(/título/i)
    const descriptionInput = screen.getByLabelText(/descripción/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Content' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    
    const submitButton = screen.getByText('Agregar Contenido')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Error al crear el contenido/i)).toBeInTheDocument()
    })
  })

  it('should show back link to contents', async () => {
    window.history.pushState({}, '', '/courses/course-1/modules/mod1/contents/new')
    renderWithRouter(<AddContentPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Volver a contenidos')).toBeInTheDocument()
    })
  })
})
