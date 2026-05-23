import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchModulos, fetchModuloById, createModulo, updateModulo, toggleModuloActivo, deleteModulo, reorderModulos } from './moduleService'
import api from '../lib/axios'
import type { Module } from '../../domain/modules/types'

vi.mock('../lib/axios')

const mockApi = vi.mocked(api)

describe('moduleService', () => {
  const mockModule: Module = {
    id: 'mod-1',
    courseId: 'course-1',
    title: 'React Components',
    description: 'Understand functional components and props.',
    order: 1,
    status: 'active',
    contentIds: ['content-1', 'content-2']
  }

  const mockBackendResponse = {
    idModulo: 'mod-1',
    idCurso: 'course-1',
    titulo: 'React Components',
    descripcion: 'Understand functional components and props.',
    activo: true,
    orden: 1,
    contenidosCount: 2,
    creacion: '2024-01-01',
    actualizacion: '2024-01-01'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchModulos', () => {
    it('should fetch all modules for a course successfully', async () => {
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      const result = await fetchModulos('course-1')

      expect(mockApi.get).toHaveBeenCalledWith('/cursos/course-1/modulos')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockModule)
    })

    it('should fetch modules with active filter', async () => {
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      await fetchModulos('course-1', { activo: true })

      expect(mockApi.get).toHaveBeenCalledWith('/cursos/course-1/modulos', { activo: true })
    })

    it('should handle empty response', async () => {
      mockApi.get.mockResolvedValue({ data: [] })

      const result = await fetchModulos('course-1')

      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await expect(fetchModulos('course-1')).rejects.toThrow('Network error')
    })
  })

  describe('fetchModuloById', () => {
    it('should fetch a single module by id', async () => {
      mockApi.get.mockResolvedValue({ data: mockBackendResponse })

      const result = await fetchModuloById('course-1', 'mod-1')

      expect(mockApi.get).toHaveBeenCalledWith('/cursos/course-1/modulos/mod-1')
      expect(result).toEqual(mockModule)
    })

    it('should handle not found error', async () => {
      mockApi.get.mockRejectedValue({ response: { status: 404 } })

      await expect(fetchModuloById('course-1', '999')).rejects.toThrow()
    })
  })

  describe('createModulo', () => {
    it('should create a new module successfully', async () => {
      const newModule: Omit<Module, 'id' | 'contentIds'> = {
        courseId: 'course-1',
        title: 'New Module',
        description: 'New Description',
        order: 1,
        status: 'active'
      }

      mockApi.post.mockResolvedValue({ data: { ...mockBackendResponse, idModulo: 'mod-2' } })

      const result = await createModulo('course-1', newModule)

      expect(mockApi.post).toHaveBeenCalledWith('/cursos/course-1/modulos', {
        titulo: 'New Module',
        descripcion: 'New Description',
        orden: 1
      })
      expect(result.id).toBe('mod-2')
    })

    it('should handle validation errors', async () => {
      const invalidModule = {
        courseId: 'course-1',
        title: '',
        description: '',
        order: 0,
        status: 'active' as const
      }

      mockApi.post.mockRejectedValue({ response: { status: 400, data: { message: 'Validation error' } } })

      await expect(createModulo('course-1', invalidModule)).rejects.toThrow()
    })
  })

  describe('updateModulo', () => {
    it('should update an existing module', async () => {
      const updatedModule: Partial<Module> = {
        title: 'Updated Title'
      }

      mockApi.put.mockResolvedValue({ data: { ...mockBackendResponse, titulo: 'Updated Title' } })

      const result = await updateModulo('course-1', 'mod-1', updatedModule)

      expect(mockApi.put).toHaveBeenCalledWith('/cursos/course-1/modulos/mod-1', {
        titulo: 'Updated Title',
        descripcion: 'Understand functional components and props.',
        orden: 1
      })
      expect(result.title).toBe('Updated Title')
    })
  })

  describe('toggleModuloActivo', () => {
    it('should activate an inactive module', async () => {
      mockApi.patch.mockResolvedValue({ status: 200 })
      mockApi.get.mockResolvedValue({ data: { ...mockBackendResponse, activo: true } })

      const result = await toggleModuloActivo('course-1', 'mod-1', true)

      expect(mockApi.patch).toHaveBeenCalledWith('/cursos/course-1/modulos/mod-1/activo', { activo: true })
      expect(result.status).toBe('active')
    })

    it('should deactivate an active module', async () => {
      mockApi.patch.mockResolvedValue({ status: 200 })
      mockApi.get.mockResolvedValue({ data: { ...mockBackendResponse, activo: false } })

      const result = await toggleModuloActivo('course-1', 'mod-1', false)

      expect(mockApi.patch).toHaveBeenCalledWith('/cursos/course-1/modulos/mod-1/activo', { activo: false })
      expect(result.status).toBe('inactive')
    })

    it('should throw error if module not found after toggle', async () => {
      mockApi.patch.mockResolvedValue({ status: 200 })
      mockApi.get.mockResolvedValue({ data: null })

      await expect(toggleModuloActivo('course-1', 'mod-1', true)).rejects.toThrow('Módulo no encontrado después de actualizar estado')
    })
  })

  describe('deleteModulo', () => {
    it('should delete a module successfully', async () => {
      mockApi.delete.mockResolvedValue({ status: 204 })

      await deleteModulo('course-1', 'mod-1')

      expect(mockApi.delete).toHaveBeenCalledWith('/cursos/course-1/modulos/mod-1')
    })

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(deleteModulo('course-1', 'mod-1')).rejects.toThrow('Delete failed')
    })
  })

  describe('reorderModulos', () => {
    it('should reorder modules successfully', async () => {
      const order = [
        { id_modulo: 'mod-1', orden: 2 },
        { id_modulo: 'mod-2', orden: 1 }
      ]
      mockApi.patch.mockResolvedValue({ status: 200 })
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      const result = await reorderModulos('course-1', order)

      expect(mockApi.patch).toHaveBeenCalledWith('/cursos/course-1/modulos/reorder', { orden: order })
      expect(result).toHaveLength(1)
    })
  })
})
