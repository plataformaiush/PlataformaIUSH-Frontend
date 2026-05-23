import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchContenidos, fetchContenidoById, createContenido, updateContenido, deleteContenido, reorderContenidos } from './contentService'
import api from '../lib/axios'
import type { Content } from '../../domain/contents/types'
import { ContentType } from '../../domain/contents/types'

vi.mock('../lib/axios')

const mockApi = vi.mocked(api)

describe('contentService', () => {
  const mockContent: Content = {
    id: 'content-1',
    moduleId: 'module-1',
    title: 'What is JSX?',
    description: 'Intro to JSX syntax and how it maps to HTML.',
    type: ContentType.TEXT,
    status: 'active',
    resourceUrl: 'https://example.com/jsx-guide',
    durationMinutes: undefined,
    order: 1
  }

  const mockBackendResponse = {
    idContenido: 'content-1',
    idModulo: 'module-1',
    titulo: 'What is JSX?',
    descripcion: 'Intro to JSX syntax and how it maps to HTML.',
    tipo: 'texto' as const,
    urlOTexto: 'https://example.com/jsx-guide',
    orden: 1,
    activo: true,
    creacion: '2024-01-01',
    actualizacion: '2024-01-01'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchContenidos', () => {
    it('should fetch all contents for a module successfully', async () => {
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      const result = await fetchContenidos('module-1')

      expect(mockApi.get).toHaveBeenCalledWith('/modulos/module-1/contenidos')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockContent)
    })

    it('should fetch contents with active filter', async () => {
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      await fetchContenidos('module-1', { activo: true })

      expect(mockApi.get).toHaveBeenCalledWith('/modulos/module-1/contenidos', { activo: true })
    })

    it('should fetch contents with type filter', async () => {
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      await fetchContenidos('module-1', { tipo: 'texto' })

      expect(mockApi.get).toHaveBeenCalledWith('/modulos/module-1/contenidos', { tipo: 'texto' })
    })

    it('should handle empty response', async () => {
      mockApi.get.mockResolvedValue({ data: [] })

      const result = await fetchContenidos('module-1')

      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await expect(fetchContenidos('module-1')).rejects.toThrow('Network error')
    })
  })

  describe('fetchContenidoById', () => {
    it('should fetch a single content by id', async () => {
      mockApi.get.mockResolvedValue({ data: mockBackendResponse })

      const result = await fetchContenidoById('module-1', 'content-1')

      expect(mockApi.get).toHaveBeenCalledWith('/modulos/module-1/contenidos/content-1')
      expect(result).toEqual(mockContent)
    })

    it('should handle not found error', async () => {
      mockApi.get.mockRejectedValue({ response: { status: 404 } })

      await expect(fetchContenidoById('module-1', '999')).rejects.toThrow()
    })
  })

  describe('createContenido', () => {
    it('should create a new content successfully', async () => {
      const newContent: Omit<Content, 'id' | 'durationMinutes'> = {
        moduleId: 'module-1',
        title: 'New Content',
        description: 'New Description',
        type: ContentType.VIDEO,
        status: 'active',
        resourceUrl: 'https://example.com/video',
        order: 1
      }

      mockApi.post.mockResolvedValue({ data: { ...mockBackendResponse, idContenido: 'content-2' } })

      const result = await createContenido('module-1', newContent)

      expect(mockApi.post).toHaveBeenCalledWith('/modulos/module-1/contenidos', {
        titulo: 'New Content',
        descripcion: 'New Description',
        tipo: 'video',
        url_o_texto: 'https://example.com/video',
        orden: 1
      })
      expect(result.id).toBe('content-2')
    })

    it('should handle validation errors', async () => {
      const invalidContent = {
        moduleId: 'module-1',
        title: '',
        description: '',
        type: ContentType.TEXT,
        status: 'active' as const,
        resourceUrl: '',
        order: 0
      }

      mockApi.post.mockRejectedValue({ response: { status: 400, data: { message: 'Validation error' } } })

      await expect(createContenido('module-1', invalidContent)).rejects.toThrow()
    })
  })

  describe('updateContenido', () => {
    it('should update an existing content', async () => {
      const updatedContent: Partial<Content> = {
        title: 'Updated Title'
      }

      mockApi.put.mockResolvedValue({ data: { ...mockBackendResponse, titulo: 'Updated Title' } })

      const result = await updateContenido('module-1', 'content-1', updatedContent)

      expect(mockApi.put).toHaveBeenCalledWith('/modulos/module-1/contenidos/content-1', {
        titulo: 'Updated Title',
        descripcion: 'Intro to JSX syntax and how it maps to HTML.',
        tipo: undefined,
        url_o_texto: 'https://example.com/jsx-guide',
        orden: 1,
        activo: undefined
      })
      expect(result.title).toBe('Updated Title')
    })

    it('should update content status', async () => {
      const updatedContent: Partial<Content> = {
        status: 'draft'
      }

      mockApi.put.mockResolvedValue({ data: { ...mockBackendResponse, activo: false } })

      const result = await updateContenido('module-1', 'content-1', updatedContent)

      expect(mockApi.put).toHaveBeenCalledWith('/modulos/module-1/contenidos/content-1', {
        titulo: undefined,
        descripcion: undefined,
        tipo: undefined,
        url_o_texto: undefined,
        orden: undefined,
        activo: false
      })
      expect(result.status).toBe('draft')
    })
  })

  describe('deleteContenido', () => {
    it('should delete a content successfully', async () => {
      mockApi.delete.mockResolvedValue({ status: 204 })

      await deleteContenido('module-1', 'content-1')

      expect(mockApi.delete).toHaveBeenCalledWith('/modulos/module-1/contenidos/content-1')
    })

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(deleteContenido('module-1', 'content-1')).rejects.toThrow('Delete failed')
    })
  })

  describe('reorderContenidos', () => {
    it('should reorder contents successfully', async () => {
      const order = [
        { id_contenido: 'content-1', orden: 2 },
        { id_contenido: 'content-2', orden: 1 }
      ]
      mockApi.patch.mockResolvedValue({ status: 200 })
      mockApi.get.mockResolvedValue({ data: [mockBackendResponse] })

      const result = await reorderContenidos('module-1', order)

      expect(mockApi.patch).toHaveBeenCalledWith('/modulos/module-1/contenidos/reorder', { orden: order })
      expect(result).toHaveLength(1)
    })
  })
})
