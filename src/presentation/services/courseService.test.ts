import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCursos, fetchCursoById, createCurso, updateCurso, toggleCursoActivo, deleteCurso } from './courseService'
import api from '../lib/axios'
import type { Course } from '../../domain/courses/types'

vi.mock('../lib/axios')

const mockApi = vi.mocked(api)

describe('courseService', () => {
  const mockCourse: Course = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    instructor: 'Test Instructor',
    level: 'beginner',
    status: 'active',
    moduleIds: ['mod1'],
    studentCount: 10
  }

  const mockBackendResponse = {
    id: '1',
    titulo: 'Test Course',
    descripcion: 'Test Description',
    instructor: 'Test Instructor',
    nivel: 'beginner',
    estado: 'active',
    modulos: ['mod1'],
    estudiantes: 10
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchCursos', () => {
    it('should fetch all courses successfully', async () => {
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      const result = await fetchCursos()

      expect(mockApi.get).toHaveBeenCalledWith('/cursos')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockCourse)
    })

    it('should handle empty response', async () => {
      mockApi.get.mockResolvedValue({ data: [] })

      const result = await fetchCursos()

      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await expect(fetchCursos()).rejects.toThrow('Network error')
    })
  })

  describe('fetchCursoById', () => {
    it('should fetch a single course by id', async () => {
      mockApi.get.mockResolvedValue({ data: mockBackendResponse })

      const result = await fetchCursoById('1')

      expect(mockApi.get).toHaveBeenCalledWith('/cursos/1')
      expect(result).toEqual(mockCourse)
    })

    it('should handle not found error', async () => {
      mockApi.get.mockRejectedValue({ response: { status: 404 } })

      await expect(fetchCursoById('999')).rejects.toThrow()
    })
  })

  describe('createCurso', () => {
    it('should create a new course successfully', async () => {
      const newCourse: Omit<Course, 'id'> = {
        title: 'New Course',
        description: 'New Description',
        instructor: 'New Instructor',
        level: 'intermediate',
        status: 'inactive',
        moduleIds: [],
        studentCount: 0
      }

      mockApi.post.mockResolvedValue({ data: { ...mockBackendResponse, id: '2' } })

      const result = await createCurso(newCourse, 'user123')

      expect(mockApi.post).toHaveBeenCalledWith('/cursos', {
        titulo: 'New Course',
        descripcion: 'New Description',
        instructor: 'New Instructor',
        nivel: 'intermediate',
        estado: 'inactive',
        id_usuario: 'user123'
      })
      expect(result.id).toBe('2')
    })

    it('should handle validation errors', async () => {
      const invalidCourse = {
        title: '',
        description: '',
        instructor: '',
        level: 'beginner' as const,
        status: 'inactive' as const,
        moduleIds: [],
        studentCount: 0
      }

      mockApi.post.mockRejectedValue({ response: { status: 400, data: { message: 'Validation error' } } })

      await expect(createCurso(invalidCourse, 'user123')).rejects.toThrow()
    })
  })

  describe('updateCurso', () => {
    it('should update an existing course', async () => {
      const updatedCourse: Course = {
        ...mockCourse,
        title: 'Updated Title'
      }

      mockApi.put.mockResolvedValue({ data: { ...mockBackendResponse, titulo: 'Updated Title' } })

      const result = await updateCurso('1', updatedCourse)

      expect(mockApi.put).toHaveBeenCalledWith('/cursos/1', {
        titulo: 'Updated Title',
        descripcion: 'Test Description',
        instructor: 'Test Instructor',
        nivel: 'beginner',
        estado: 'active'
      })
      expect(result.title).toBe('Updated Title')
    })
  })

  describe('toggleCursoActivo', () => {
    it('should activate an inactive course', async () => {
      mockApi.patch.mockResolvedValue({ data: { ...mockBackendResponse, estado: 'active' } })

      const result = await toggleCursoActivo('1', true)

      expect(mockApi.patch).toHaveBeenCalledWith('/cursos/1/estado', { activo: true })
      expect(result.status).toBe('active')
    })

    it('should deactivate an active course', async () => {
      mockApi.patch.mockResolvedValue({ data: { ...mockBackendResponse, estado: 'inactive' } })

      const result = await toggleCursoActivo('1', false)

      expect(mockApi.patch).toHaveBeenCalledWith('/cursos/1/estado', { activo: false })
      expect(result.status).toBe('inactive')
    })
  })

  describe('deleteCurso', () => {
    it('should delete a course successfully', async () => {
      mockApi.delete.mockResolvedValue({ status: 204 })

      await deleteCurso('1')

      expect(mockApi.delete).toHaveBeenCalledWith('/cursos/1')
    })

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(deleteCurso('1')).rejects.toThrow('Delete failed')
    })
  })
})
