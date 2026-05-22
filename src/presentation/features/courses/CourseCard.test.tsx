import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CourseCard } from './CourseCard'
import type { Course } from '../../../domain/courses/types'

const mockCourse: Course = {
  id: '1',
  title: 'Test Course',
  description: 'Test Description',
  instructor: 'Test Instructor',
  level: 'beginner',
  status: 'active',
  moduleIds: ['mod1', 'mod2'],
  studentCount: 10
}

describe('CourseCard', () => {
  it('should render course information correctly', () => {
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
          />
        </tbody>
      </table>
    )

    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('10 estudiantes')).toBeInTheDocument()
    expect(screen.getByText('2 módulos')).toBeInTheDocument()
  })

  it('should call onView when view button is clicked', () => {
    const onView = vi.fn()
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
            onView={onView}
          />
        </tbody>
      </table>
    )

    const viewButton = screen.getByTitle('Ver curso')
    fireEvent.click(viewButton)

    expect(onView).toHaveBeenCalledWith('1')
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
            onEdit={onEdit}
          />
        </tbody>
      </table>
    )

    const editButton = screen.getByTitle('Editar curso')
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith('1')
  })

  it('should call onAddModule when add module button is clicked', () => {
    const onAddModule = vi.fn()
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
            onAddModule={onAddModule}
          />
        </tbody>
      </table>
    )

    const addButton = screen.getByTitle('Agregar módulo')
    fireEvent.click(addButton)

    expect(onAddModule).toHaveBeenCalledWith('1')
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
            onDelete={onDelete}
          />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar curso')
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('should call onToggleStatus when toggle is clicked', () => {
    const onToggleStatus = vi.fn()
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
            onToggleStatus={onToggleStatus}
          />
        </tbody>
      </table>
    )

    const toggleButton = screen.getByTitle('Desactivar')
    fireEvent.click(toggleButton)

    expect(onToggleStatus).toHaveBeenCalledWith('1', 'active')
  })

  it('should show loading state when isToggling is true', () => {
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
            isToggling={true}
          />
        </tbody>
      </table>
    )

    const toggleButton = screen.getByTitle('Desactivar')
    expect(toggleButton).toBeDisabled()
  })

  it('should display correct status badge for active course', () => {
    render(
      <table>
        <tbody>
          <CourseCard
            course={mockCourse}
            isLast={true}
          />
        </tbody>
      </table>
    )

    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('should display correct status badge for inactive course', () => {
    const inactiveCourse: Course = { ...mockCourse, status: 'inactive' }
    render(
      <table>
        <tbody>
          <CourseCard
            course={inactiveCourse}
            isLast={true}
          />
        </tbody>
      </table>
    )

    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })
})
