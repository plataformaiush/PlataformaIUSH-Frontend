import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ContentCard } from './ContentCard'
import { fetchContenidos, updateContenido } from '../../services/contentService'
import { ContentType, parseQuizData, type QuizTFData, type QuizMCData, type QuizMCOption } from '../../../domain/contents/types'
import { fetchModuloById } from '../../services/moduleService'
import { fetchCursoById } from '../../services/courseService'
import type { Content } from '../../../domain/contents/types'
import type { Module } from '../../../domain/modules/types'
import type { Course } from '../../../domain/courses/types'
import { logger } from '../../utils/logger'

export const ContentListPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editResourceUrl, setEditResourceUrl] = useState('')
  const [editOrder, setEditOrder] = useState(1)
  const [editSaving, setEditSaving] = useState(false)

  const loadData = useCallback(async () => {
    if (!courseId || !moduleId) return
    try {
      const [courseData, moduleData] = await Promise.all([
        fetchCursoById(courseId),
        fetchModuloById(courseId, moduleId)
      ])
      setCourse(courseData)
      setModule(moduleData)
      try {
        const contentsData = await fetchContenidos(moduleId)
        setContents(contentsData)
      } catch (contErr) {
        logger.error('Error al cargar contenidos', { error: contErr, moduleId })
      }
    } catch (error: any) {
      logger.error('Error al cargar curso o módulo', { error: error?.message || error, courseId, moduleId })
    } finally {
      setLoading(false)
    }
  }, [courseId, moduleId])

  const handleContentUpdate = () => {
    setRefreshKey(prev => prev + 1)
    loadData()
  }

  const handleEditContent = (content: Content) => {
    setEditingContent(content)
    setEditTitle(content.title)
    setEditDescription(content.description)
    setEditResourceUrl(content.resourceUrl || '')
    setEditOrder(content.order)
  }

  const handleSaveEdit = async () => {
    if (!editingContent || !moduleId || !editTitle.trim()) return
    setEditSaving(true)
    try {
      await updateContenido(moduleId, editingContent.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        type: editingContent.type,
        resourceUrl: editResourceUrl.trim() || undefined,
        order: editOrder,
        status: editingContent.status,
      })
      setEditingContent(null)
      loadData()
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al guardar los cambios.'
      alert(msg)
    } finally {
      setEditSaving(false)
    }
  }

  const isUrlType = (type: ContentType) =>
    [ContentType.VIDEO, ContentType.IMAGE, ContentType.DOCUMENT].includes(type)

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Cargando...</p>
      </main>
    )
  }

  if (!course || !module) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold" style={{ color: '#223740' }}>No se pudo cargar {!course ? 'el curso' : 'el módulo'}.</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>curso: {courseId} | módulo: {moduleId}</p>
          <button onClick={() => window.location.reload()}
            className="text-xs px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Top bar */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-4">
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a módulos
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <span
              className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: '#5A878C' }}
              />
              {course.title}
            </span>
            <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>
              {module.title}
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
              Contenidos de este módulo
            </p>
          </div>
          <Link
            to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#223740', color: '#FFFFFF' }}
          >
            + Agregar contenido
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          {contents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>No hay contenidos en este módulo.</p>
              <Link
                to={`/courses/${courseId}/modules/${moduleId}/contents/new`}
                className="mt-3 inline-block text-sm font-medium hover:underline"
                style={{ color: '#5A878C' }}
              >
                Agregar el primero
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#6B7280' }}
                      scope="col"
                    >
                      Contenido
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#6B7280' }}
                      scope="col"
                    >
                      Tipo
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#6B7280' }}
                      scope="col"
                    >
                      Orden
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#6B7280' }}
                      scope="col"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map((content, idx) => (
                    <ContentCard 
                      key={`${content.id}-${refreshKey}`} 
                      content={content} 
                      isLast={idx === contents.length - 1}
                      onContentUpdate={handleContentUpdate}
                      onEdit={handleEditContent}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal edición de contenido */}
      {editingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingContent(null)}>
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#223740' }}>Editar contenido</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
                  {editingContent.type === ContentType.VIDEO ? 'Vídeo'
                    : editingContent.type === ContentType.IMAGE ? 'Imagen'
                    : editingContent.type === ContentType.DOCUMENT ? 'Documento'
                    : editingContent.type === ContentType.TEXT ? 'Texto'
                    : editingContent.type === ContentType.QUIZ_TF ? 'Verdadero/Falso'
                    : 'Opción múltiple'}
                </span>
              </div>
              <button onClick={() => setEditingContent(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-8 py-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                  Título <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Descripción</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm resize-none"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>

              {/* URL / Texto / Quiz según tipo */}
              {editingContent.type === ContentType.TEXT && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Contenido</label>
                  <textarea value={editResourceUrl} onChange={e => setEditResourceUrl(e.target.value)} rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm resize-none"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
                </div>
              )}
              {isUrlType(editingContent.type) && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                    {editingContent.type === ContentType.VIDEO ? 'URL del video' : 'URL del archivo'}
                  </label>
                  <input type="text" value={editResourceUrl} onChange={e => setEditResourceUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                    placeholder="https://..." />
                </div>
              )}
              {(editingContent.type === ContentType.QUIZ_TF || editingContent.type === ContentType.QUIZ_MC) && (
                <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  Para editar preguntas de quiz elimina este contenido y crea uno nuevo.
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Orden</label>
                <input type="number" min={1} value={editOrder} onChange={e => setEditOrder(Number(e.target.value))}
                  className="w-32 px-4 py-3 rounded-xl border-2 focus:outline-none text-sm"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }} />
              </div>
            </div>

            <div className="px-8 py-5 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button onClick={() => setEditingContent(null)}
                className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}>
                Cancelar
              </button>
              <button onClick={handleSaveEdit}
                disabled={editSaving || !editTitle.trim() || editingContent.type === ContentType.QUIZ_TF || editingContent.type === ContentType.QUIZ_MC}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: '#223740' }}>
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}