import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ModuleCard } from './ModuleCard'
import { toggleModuloActivo, deleteModulo, fetchModulos } from '../../services/moduleService'
import { toggleCursoActivo, fetchCursoById } from '../../services/courseService'
import type { Module } from '../../../domain/modules/types'
import type { Course } from '../../../domain/courses/types'

vi.mock('../../services/moduleService')
vi.mock('../../services/courseService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockToggleModuloActivo = vi.mocked(toggleModuloActivo)
const mockDeleteModulo = vi.mocked(deleteModulo)
const mockFetchModulos = vi.mocked(fetchModulos)
const mockToggleCursoActivo = vi.mocked(toggleCursoActivo)
const mockFetchCursoById = vi.mocked(fetchCursoById)

const mockModule: Module = {
  id: 'mod1',
  courseId: 'course-1',
  title: 'React Components',
  description: 'Understand components',
  order: 1,
  status: 'active' as const,
  contentIds: ['cont1', 'cont2']
}

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

describe('ModuleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToggleModuloActivo.mockResolvedValue(mockModule)
    mockDeleteModulo.mockResolvedValue()
    mockFetchModulos.mockResolvedValue([mockModule])
    mockFetchCursoById.mockResolvedValue(mockCourse)
    global.window.confirm = vi.fn(() => true)
  })

  it('should render module information correctly', () => {
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" />
        </tbody>
      </table>
    )

    expect(screen.getByText('React Components')).toBeInTheDocument()
    expect(screen.getByText('Módulo 01')).toBeInTheDocument()
    expect(screen.getByText('2 contenidos')).toBeInTheDocument()
  })

  it('should display active status badge', () => {
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" />
        </tbody>
      </table>
    )

    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('should display inactive status badge', () => {
    const inactiveModule: Module = { ...mockModule, status: 'inactive' as const }
    
    render(
      <table>
        <tbody>
          <ModuleCard module={inactiveModule} courseId="course-1" />
        </tbody>
      </table>
    )

    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('should call onModuleUpdate when toggle status is clicked', async () => {
    const onModuleUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" onModuleUpdate={onModuleUpdate} />
        </tbody>
      </table>
    )

    const toggleButton = screen.getByTitle('Desactivar')
    fireEvent.click(toggleButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockToggleModuloActivo).toHaveBeenCalledWith('course-1', 'mod1', false)
  })

  it('should show confirmation when deleting module', async () => {
    global.window.confirm = vi.fn(() => true)
    const onModuleUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" onModuleUpdate={onModuleUpdate} />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar módulo')
    fireEvent.click(deleteButton)

    expect(global.window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este módulo? Esta acción no se puede deshacer.')
  })

  it('should delete module when confirmed', async () => {
    global.window.confirm = vi.fn(() => true)
    const onModuleUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" onModuleUpdate={onModuleUpdate} />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar módulo')
    fireEvent.click(deleteButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockDeleteModulo).toHaveBeenCalledWith('course-1', 'mod1')
  })

  it('should not delete module when cancelled', async () => {
    global.window.confirm = vi.fn(() => false)
    const onModuleUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" onModuleUpdate={onModuleUpdate} />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar módulo')
    fireEvent.click(deleteButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockDeleteModulo).not.toHaveBeenCalled()
  })

  it('should deactivate course when deactivating last active module', async () => {
    global.window.confirm = vi.fn(() => true)
    mockFetchModulos.mockResolvedValue([mockModule])
    const onModuleUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" onModuleUpdate={onModuleUpdate} />
        </tbody>
      </table>
    )

    const toggleButton = screen.getByTitle('Desactivar')
    fireEvent.click(toggleButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockFetchModulos).toHaveBeenCalledWith('course-1')
    expect(mockToggleCursoActivo).toHaveBeenCalledWith('course-1', false)
  })

  it('should activate course when activating module and course is inactive', async () => {
    global.window.confirm = vi.fn(() => true)
    const inactiveCourse: Course = { ...mockCourse, status: 'inactive' }
    mockFetchCursoById.mockResolvedValue(inactiveCourse)
    const inactiveModule: Module = { ...mockModule, status: 'inactive' as const }
    const onModuleUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ModuleCard module={inactiveModule} courseId="course-1" onModuleUpdate={onModuleUpdate} />
        </tbody>
      </table>
    )

    const toggleButton = screen.getByTitle('Activar')
    fireEvent.click(toggleButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockFetchCursoById).toHaveBeenCalledWith('course-1')
    expect(mockToggleCursoActivo).toHaveBeenCalledWith('course-1', true)
  })

  it('should render view contents link', () => {
    render(
      <table>
        <tbody>
          <ModuleCard module={mockModule} courseId="course-1" />
        </tbody>
      </table>
    )

    const viewLink = screen.getByTitle('Ver contenidos')
    expect(viewLink).toBeInTheDocument()
    expect(viewLink).toHaveAttribute('href', '/courses/course-1/modules/mod1/contents')
  })
})
