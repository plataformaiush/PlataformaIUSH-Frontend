import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ContentCard } from './ContentCard'
import { deleteContenido } from '../../services/contentService'
import type { Content } from '../../../domain/contents/types'
import { ContentType } from '../../../domain/contents/types'

vi.mock('../../services/contentService')
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

const mockDeleteContenido = vi.mocked(deleteContenido)

const mockContent: Content = {
  id: 'cont1',
  moduleId: 'mod1',
  title: 'What is JSX?',
  description: 'Intro to JSX syntax',
  type: ContentType.VIDEO,
  status: 'active',
  resourceUrl: 'https://example.com/video',
  durationMinutes: 10,
  order: 1
}

describe('ContentCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteContenido.mockResolvedValue()
    global.window.confirm = vi.fn(() => true)
  })

  it('should render content information correctly', () => {
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('What is JSX?')).toBeInTheDocument()
    expect(screen.getByText('Intro to JSX syntax')).toBeInTheDocument()
    expect(screen.getByText('10 min')).toBeInTheDocument()
  })

  it('should display content type', () => {
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Vídeo')).toBeInTheDocument()
  })

  it('should display correct type label for text content', () => {
    const textContent: Content = { ...mockContent, type: ContentType.TEXT }
    
    render(
      <table>
        <tbody>
          <ContentCard content={textContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Texto')).toBeInTheDocument()
  })

  it('should display correct type label for image content', () => {
    const imageContent: Content = { ...mockContent, type: ContentType.IMAGE }
    
    render(
      <table>
        <tbody>
          <ContentCard content={imageContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Imagen')).toBeInTheDocument()
  })

  it('should display correct type label for document content', () => {
    const documentContent: Content = { ...mockContent, type: ContentType.DOCUMENT }
    
    render(
      <table>
        <tbody>
          <ContentCard content={documentContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Documento')).toBeInTheDocument()
  })

  it('should display active status badge', () => {
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('should display inactive status badge', () => {
    const inactiveContent: Content = { ...mockContent, status: 'draft' }
    
    render(
      <table>
        <tbody>
          <ContentCard content={inactiveContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('should display order number', () => {
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} />
        </tbody>
      </table>
    )

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should show view button when resourceUrl exists', () => {
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} />
        </tbody>
      </table>
    )

    const viewButton = screen.getByTitle('Ver contenido')
    expect(viewButton).toBeInTheDocument()
    expect(viewButton).toHaveAttribute('href', 'https://example.com/video')
    expect(viewButton).toHaveAttribute('target', '_blank')
  })

  it('should not show view button when resourceUrl does not exist', () => {
    const contentWithoutUrl: Content = { ...mockContent, resourceUrl: undefined }
    
    render(
      <table>
        <tbody>
          <ContentCard content={contentWithoutUrl} />
        </tbody>
      </table>
    )

    expect(screen.queryByTitle('Ver contenido')).not.toBeInTheDocument()
  })

  it('should show confirmation when deleting content', () => {
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar contenido')
    fireEvent.click(deleteButton)

    expect(global.window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer.')
  })

  it('should delete content when confirmed', async () => {
    const onContentUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} onContentUpdate={onContentUpdate} />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar contenido')
    fireEvent.click(deleteButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockDeleteContenido).toHaveBeenCalledWith('mod1', 'cont1')
  })

  it('should not delete content when cancelled', async () => {
    global.window.confirm = vi.fn(() => false)
    const onContentUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} onContentUpdate={onContentUpdate} />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar contenido')
    fireEvent.click(deleteButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockDeleteContenido).not.toHaveBeenCalled()
  })

  it('should call onContentUpdate after successful deletion', async () => {
    const onContentUpdate = vi.fn()
    
    render(
      <table>
        <tbody>
          <ContentCard content={mockContent} onContentUpdate={onContentUpdate} />
        </tbody>
      </table>
    )

    const deleteButton = screen.getByTitle('Eliminar contenido')
    fireEvent.click(deleteButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onContentUpdate).toHaveBeenCalled()
  })

  it('should not display duration when not provided', () => {
    const contentWithoutDuration: Content = { ...mockContent, durationMinutes: undefined }
    
    render(
      <table>
        <tbody>
          <ContentCard content={contentWithoutDuration} />
        </tbody>
      </table>
    )

    expect(screen.queryByText(/min/)).not.toBeInTheDocument()
  })
})
