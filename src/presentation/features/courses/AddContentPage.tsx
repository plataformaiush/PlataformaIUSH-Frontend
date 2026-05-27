import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCursoById } from '../../services/courseService'
import { fetchModuloById } from '../../services/moduleService'
import { createContenido, fetchContenidos } from '../../services/contentService'
import { ContentType, type QuizTFData, type QuizMCData, type QuizMCOption } from '../../../domain/contents/types'
import type { Course } from '../../../domain/courses/types'
import type { Module } from '../../../domain/modules/types'
import { useState, useEffect } from 'react'
import { logger } from '../../utils/logger'
import { v4 as uuidv4 } from 'uuid'
import ReactPlayer from 'react-player'
import { UploadButton } from '../files/components/buttons/UploadButton'
import type { Documento } from '../../../domain/files/Filesapi'

// Tipos cuyo `resourceUrl` debe ser una URL absoluta válida.
const URL_BASED_TYPES = new Set<ContentType>([
  ContentType.VIDEO,
  ContentType.IMAGE,
  ContentType.DOCUMENT,
])

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const contentSchema = z
  .object({
    title: z
      .string()
      .min(1, 'El título es requerido')
      .max(150, 'El título no puede exceder 150 caracteres')
      // Sanitización defensiva: no permitir caracteres tipo `<`/`>` que faciliten XSS
      .regex(/^[^<>]*$/, 'El título contiene caracteres no permitidos (<, >)')
      .default(''),
    description: z
      .string()
      .max(1000, 'La descripción no puede exceder 1000 caracteres')
      .optional()
      .default(''),
    type: z.nativeEnum(ContentType),
    resourceUrl: z
      .string()
      .max(2000, 'La URL/recurso no puede exceder 2000 caracteres')
      .optional(),
    order: z.number().int().min(1, 'El orden debe ser al menos 1').max(999),
    status: z.enum(['active', 'draft'])
  })
  .superRefine((data, ctx) => {
    if (URL_BASED_TYPES.has(data.type)) {
      const url = data.resourceUrl?.trim()
      if (!url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['resourceUrl'],
          message: 'La URL es requerida para este tipo de contenido',
        })
      } else if (!isValidHttpUrl(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['resourceUrl'],
          message: 'Ingresa una URL válida (http:// o https://)',
        })
      }
    }
  })

type ContentFormData = z.infer<typeof contentSchema>

const contentTypes = [
  {
    type: ContentType.VIDEO,
    label: 'Vídeo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    type: ContentType.DOCUMENT,
    label: 'Documento',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    type: ContentType.QUIZ_MC,
    label: 'Quiz opción múltiple',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    type: ContentType.QUIZ_TF,
    label: 'Quiz verdadero / falso',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
]

export const AddContentPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ name: string } | null>(null)
  const [uploadedDoc, setUploadedDoc] = useState<Documento | null>(null)

  const handleFileUploaded = (doc: Documento) => {
    setUploadedDoc(doc)
    setValue('resourceUrl', doc.url || '')
    setUploadedFile({ name: doc.nombre })
  }

  // Estado quiz Verdadero/Falso
  const [tfQuestion, setTfQuestion] = useState('')
  const [tfAnswer, setTfAnswer] = useState<boolean>(true)
  const [tfExplanation, setTfExplanation] = useState('')

  // Estado quiz Opción múltiple
  const [mcQuestion, setMcQuestion] = useState('')
  const [mcOptions, setMcOptions] = useState<QuizMCOption[]>([
    { id: uuidv4(), text: '' },
    { id: uuidv4(), text: '' },
  ])
  const [mcCorrectId, setMcCorrectId] = useState('')
  const [mcExplanation, setMcExplanation] = useState('')

  useEffect(() => {
    if (!courseId || !moduleId) return
    Promise.all([
      fetchCursoById(courseId),
      fetchModuloById(courseId, moduleId),
      fetchContenidos(moduleId)
    ])
      .then(([c, m, existingContents]) => {
        setCourse(c)
        setModule(m)
        const maxOrder = existingContents.length > 0
          ? Math.max(...existingContents.map(cont => cont.order))
          : 0
        setValue('order', maxOrder + 1)
      })
      .catch(err => logger.error('Error al cargar datos', { error: err, courseId, moduleId }))
  }, [courseId, moduleId])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: { title: '', description: '', order: 1, type: ContentType.VIDEO, status: 'active' }
  })

  const selectedType = watch('type')
  const watchedTitle = watch('title')
  const watchedStatus = watch('status')
  const watchedResourceUrl = watch('resourceUrl')

  const isValidVideoUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false
    try {
      const urlObj = new URL(url)
      // Validar que sea un dominio de video soportado
      const validDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'vimeo']
      return validDomains.some(domain => urlObj.hostname.includes(domain))
    } catch {
      return false
    }
  }

  const buildQuizResourceUrl = (type: ContentType): string | undefined => {
    if (type === ContentType.QUIZ_TF) {
      if (!tfQuestion.trim()) { alert('Escribe la pregunta.'); return undefined }
      const data: QuizTFData = {
        questionType: 'quiz_tf',
        question: tfQuestion.trim(),
        correctAnswer: tfAnswer,
        explanation: tfExplanation.trim() || undefined,
      }
      return JSON.stringify(data)
    }
    if (type === ContentType.QUIZ_MC) {
      const filledOptions = mcOptions.filter(o => o.text.trim())
      if (!mcQuestion.trim()) { alert('Escribe la pregunta.'); return undefined }
      if (filledOptions.length < 2) { alert('Agrega al menos 2 opciones.'); return undefined }
      if (!mcCorrectId || !filledOptions.find(o => o.id === mcCorrectId)) { alert('Selecciona la respuesta correcta.'); return undefined }
      const data: QuizMCData = {
        questionType: 'quiz_mc',
        question: mcQuestion.trim(),
        options: filledOptions,
        correctAnswerId: mcCorrectId,
        explanation: mcExplanation.trim() || undefined,
      }
      return JSON.stringify(data)
    }
    return undefined
  }

  const onSubmit = async (data: ContentFormData) => {
    if (!moduleId) return
    try {
      let resourceUrl = data.resourceUrl || undefined
      if (data.type === ContentType.QUIZ_TF || data.type === ContentType.QUIZ_MC) {
        resourceUrl = buildQuizResourceUrl(data.type)
        if (!resourceUrl) return
      }
      const newContent = await createContenido(moduleId, {
        moduleId,
        title: data.title,
        description: data.description || '',
        type: data.type,
        status: data.status === 'active' ? 'active' : 'draft',
        resourceUrl,
        order: data.order
      })
      logger.info('Contenido creado exitosamente', { contentId: newContent.id, moduleId, courseId })
      navigate(`/courses/${courseId}/modules/${moduleId}`)
    } catch (error) {
      logger.error('Error al crear contenido', { error, moduleId, courseId })
      alert('Error al crear el contenido. Por favor intenta nuevamente.')
    }
  }

  const onFormError = (errors: Record<string, unknown>) => {
    const errorMessages = Object.entries(errors)
      .filter(([_, value]) => value && typeof value === 'object' && 'message' in value)
      .map(([field, value]) => `${field}: ${(value as { message?: string }).message}`)
      .join(', ')
    logger.error('Errores de validación en formulario de contenido', { errorMessages })
  }

  if (!course || !module) {
    return (
      <main className="flex items-center justify-center" style={{ backgroundColor: '#FAFAFA', minHeight: '100%' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Curso o módulo no encontrado.</p>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Top bar — igual que ModuleListPage y ContentListPage */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-4">
          <Link
            to={`/courses/${courseId}/modules/${moduleId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a contenidos
          </Link>
        </div>
      </div>

      <div className="px-8 py-8 max-w-2xl mx-auto">
        {/* Main form */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>Agregar Contenido</h1>
              <p className="text-sm mt-1" style={{ color: '#5A878C' }}>Completa la información para crear un nuevo contenido en tu módulo</p>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2"
                  style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>1</div>
                <div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>Curso</div>
                  <div className="text-xs truncate max-w-[80px]" style={{ color: '#9CA3AF' }}>{course.title}</div>
                </div>
              </div>
              <div className="w-8 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2"
                  style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>2</div>
                <div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>Módulo</div>
                  <div className="text-xs truncate max-w-[80px]" style={{ color: '#9CA3AF' }}>{module.title}</div>
                </div>
              </div>
              <div className="w-8 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                  style={{ backgroundColor: '#223740' }}>3</div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: '#223740' }}>Contenido</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>Paso actual</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-4">
            {/* Basic info */}
            <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all" style={{ 
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  Información Básica
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>
                    Título del contenido <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:border-blue-400"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FAFAFA',
                      color: '#223740'
                    }}
                    placeholder="Ej: Introducción a los principios visuales"
                  />
                  {errors.title && <p className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: '#DC2626' }}><span style={{ color: '#DC2626' }}>⚠</span> {errors.title.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>
                    Descripción
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:border-blue-400 resize-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FAFAFA',
                      color: '#223740'
                    }}
                    placeholder="Describe brevemente de qué trata este contenido..."
                  />
                  {errors.description && <p className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: '#DC2626' }}><span style={{ color: '#DC2626' }}>⚠</span> {errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Content type selector */}
            <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all" style={{ 
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  Tipo de Contenido
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {contentTypes.map(({ type, label, icon }) => {
                  const isSelected = selectedType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('type', type)}
                      className="group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:scale-105 hover:shadow-lg"
                      style={
                        isSelected
                          ? { borderColor: '#5A878C', backgroundColor: '#AEEBF2', color: '#223740', boxShadow: '0 0 0 3px rgba(90, 135, 140, 0.1)' }
                          : { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#9CA3AF' }
                      }
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5A878C' }}>
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="transition-transform group-hover:scale-110">{icon}</div>
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* File upload + URL */}
            <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  {selectedType === ContentType.TEXT ? 'Contenido de Texto'
                    : selectedType === ContentType.VIDEO ? 'URL del Video'
                    : selectedType === ContentType.QUIZ_TF ? 'Pregunta Verdadero / Falso'
                    : selectedType === ContentType.QUIZ_MC ? 'Pregunta de Opción Múltiple'
                    : 'Subir Archivo'}
                </h2>
              </div>

              {/* TEXT: textarea */}
              {selectedType === ContentType.TEXT && (
                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Contenido</label>
                  <textarea
                    {...register('resourceUrl')}
                    rows={8}
                    className="w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:border-blue-400 resize-none"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                    placeholder="Escribe el contenido del texto aquí..."
                  />
                </div>
              )}

              {/* QUIZ Verdadero/Falso */}
              {selectedType === ContentType.QUIZ_TF && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Pregunta <span style={{ color: '#DC2626' }}>*</span></label>
                    <textarea
                      rows={3}
                      value={tfQuestion}
                      onChange={e => setTfQuestion(e.target.value)}
                      className="w-full rounded-xl border-2 px-4 py-3 text-sm resize-none focus:outline-none"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                      placeholder="¿Es React una librería de JavaScript?"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-semibold" style={{ color: '#223740' }}>Respuesta correcta</label>
                    <div className="flex gap-4">
                      {[{ value: true, label: 'Verdadero' }, { value: false, label: 'Falso' }].map(opt => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => setTfAnswer(opt.value)}
                          className="flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all"
                          style={tfAnswer === opt.value
                            ? { borderColor: '#5A878C', backgroundColor: '#AEEBF2', color: '#223740' }
                            : { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Explicación (opcional)</label>
                    <textarea
                      rows={2}
                      value={tfExplanation}
                      onChange={e => setTfExplanation(e.target.value)}
                      className="w-full rounded-xl border-2 px-4 py-3 text-sm resize-none focus:outline-none"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                      placeholder="Explica por qué esa es la respuesta correcta..."
                    />
                  </div>
                </div>
              )}

              {/* QUIZ Opción múltiple */}
              {selectedType === ContentType.QUIZ_MC && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Pregunta <span style={{ color: '#DC2626' }}>*</span></label>
                    <textarea
                      rows={3}
                      value={mcQuestion}
                      onChange={e => setMcQuestion(e.target.value)}
                      className="w-full rounded-xl border-2 px-4 py-3 text-sm resize-none focus:outline-none"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                      placeholder="¿Cuál de los siguientes es un hook de React?"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold" style={{ color: '#223740' }}>Opciones <span style={{ color: '#DC2626' }}>*</span></label>
                      <button
                        type="button"
                        onClick={() => setMcOptions(prev => [...prev, { id: uuidv4(), text: '' }])}
                        className="text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
                      >
                        + Agregar opción
                      </button>
                    </div>
                    <div className="space-y-2">
                      {mcOptions.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="mcCorrect"
                            checked={mcCorrectId === opt.id}
                            onChange={() => setMcCorrectId(opt.id)}
                            className="h-4 w-4 shrink-0"
                            style={{ accentColor: '#5A878C' }}
                            title="Marcar como respuesta correcta"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => setMcOptions(prev => prev.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o))}
                            className="flex-1 rounded-xl border-2 px-4 py-2 text-sm focus:outline-none"
                            style={{
                              borderColor: mcCorrectId === opt.id ? '#5A878C' : '#E5E7EB',
                              backgroundColor: mcCorrectId === opt.id ? '#F0FAFB' : '#FAFAFA',
                              color: '#223740'
                            }}
                            placeholder={`Opción ${idx + 1}`}
                          />
                          {mcOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => { setMcOptions(prev => prev.filter(o => o.id !== opt.id)); if (mcCorrectId === opt.id) setMcCorrectId('') }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs" style={{ color: '#6B7280' }}>Selecciona el radio de la respuesta correcta</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Explicación (opcional)</label>
                    <textarea
                      rows={2}
                      value={mcExplanation}
                      onChange={e => setMcExplanation(e.target.value)}
                      className="w-full rounded-xl border-2 px-4 py-3 text-sm resize-none focus:outline-none"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                      placeholder="Explica por qué esa es la respuesta correcta..."
                    />
                  </div>
                </div>
              )}

              {/* VIDEO: solo URL */}
              {selectedType === ContentType.VIDEO && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>URL del video</label>
                    <input
                      {...register('resourceUrl')}
                      type="url"
                      className="w-full rounded-xl border-2 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:border-blue-400"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                      placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                    />
                    {errors.resourceUrl && <p className="mt-2 text-xs font-medium" style={{ color: '#DC2626' }}>⚠ {errors.resourceUrl.message}</p>}
                  </div>
                  
                  {/* Preview del video */}
                  {watchedResourceUrl && isValidVideoUrl(watchedResourceUrl) && ReactPlayer.canPlay(watchedResourceUrl) && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Preview</label>
                      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#000' }}>
                        <ReactPlayer
                          url={watchedResourceUrl}
                          width="100%"
                          height="300px"
                          controls
                          config={{
                            youtube: {
                              playerVars: {
                                showinfo: 1,
                                modestbranding: 1,
                                rel: 0,
                                origin: window.location.origin
                              }
                            }
                          }}
                          onError={() => {
                            console.error('Error loading video')
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          Si el video no se muestra, puede ser por restricciones del autor
                        </p>
                        <a
                          href={watchedResourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold underline"
                          style={{ color: '#5A878C' }}
                        >
                          Ver en YouTube
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* IMAGE / DOCUMENT: UploadButton del equipo 2 */}
              {(selectedType === ContentType.IMAGE || selectedType === ContentType.DOCUMENT) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold" style={{ color: '#223740' }}>
                      {selectedType === ContentType.DOCUMENT ? 'Subir documento' : 'Subir imagen'}
                    </label>
                    {uploadedFile && (
                      <button
                        type="button"
                        onClick={() => { setUploadedFile(null); setUploadedDoc(null); setValue('resourceUrl', '') }}
                        className="text-xs underline"
                        style={{ color: '#5A878C' }}
                      >
                        Cambiar archivo
                      </button>
                    )}
                  </div>
                  
                  {uploadedFile ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border-2" style={{ borderColor: '#5A878C', backgroundColor: '#F0FAFB' }}>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AEEBF2' }}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#223740' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: '#223740' }}>{uploadedFile.name}</p>
                        {uploadedDoc && (
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            {(uploadedDoc.tamaño / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <UploadButton onUploaded={handleFileUploaded} className="w-full" />
                  )}
                  
                  <input {...register('resourceUrl')} type="hidden" />
                  
                  {/* Preview de imagen */}
                  {selectedType === ContentType.IMAGE && watchedResourceUrl && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Preview</label>
                      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FAFAFA', border: '2px solid #E5E7EB' }}>
                        <img
                          src={watchedResourceUrl}
                          alt="Preview"
                          className="w-full h-auto max-h-64 object-contain"
                          onError={() => setValue('resourceUrl', '')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview de documento (PDF/Office) */}
                  {selectedType === ContentType.DOCUMENT && watchedResourceUrl && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>Preview</label>
                      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FAFAFA', border: '2px solid #E5E7EB' }}>
                        <iframe
                          src={watchedResourceUrl}
                          title="Preview del documento"
                          className="w-full"
                          style={{ height: '400px', border: 'none', backgroundColor: '#FFFFFF' }}
                        />
                      </div>
                      <p className="mt-2 text-xs" style={{ color: '#6B7280' }}>
                        Si el documento no se muestra,{' '}
                        <a href={watchedResourceUrl} target="_blank" rel="noopener noreferrer"
                          className="font-semibold underline" style={{ color: '#5A878C' }}>
                          ábrelo en una pestaña nueva
                        </a>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Publication status */}
            <div className="rounded-2xl border p-8 shadow-sm hover:shadow-md transition-all" style={{ 
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  Estado de Publicación
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="group cursor-pointer">
                  <input {...register('status')} type="radio" value="active" className="sr-only" />
                  <div
                    className="relative rounded-xl border-2 py-4 text-center text-sm font-bold transition-all"
                    style={
                      watchedStatus === 'active'
                        ? { borderColor: '#22C55E', backgroundColor: '#F0FDF4', color: '#166534' }
                        : { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      {watchedStatus === 'active' ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#22C55E' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2" style={{ borderColor: '#D1D5DB' }}></div>
                      )}
                      <span>Activo</span>
                    </div>
                  </div>
                </label>
                <label className="group cursor-pointer">
                  <input {...register('status')} type="radio" value="draft" className="sr-only" />
                  <div
                    className="relative rounded-xl border-2 py-4 text-center text-sm font-medium transition-all"
                    style={
                      watchedStatus === 'draft'
                        ? { borderColor: '#EAB308', backgroundColor: '#FEFCE8', color: '#854D0E' }
                        : { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280' }
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      {watchedStatus === 'draft' ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#EAB308' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2" style={{ borderColor: '#D1D5DB' }}></div>
                      )}
                      <span>Desactivado</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Link
                to={`/courses/${courseId}/modules/${moduleId}`}
                className="flex-1 rounded-xl border-2 py-4 text-center text-sm font-semibold transition-all hover:shadow-lg hover:scale-[1.02]"
                style={{ 
                  borderColor: '#E5E7EB',
                  backgroundColor: '#FFFFFF',
                  color: '#6B7280'
                }}
              >
                <span className="flex items-center justify-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </span>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl py-4 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: '#223740' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Guardar contenido
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - removed */}
        <div className="hidden">
          {/* Preview */}
          <div className="overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition-all" style={{ 
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF'
          }}>
            <div
              className="relative h-32 flex items-center justify-center"
              style={{ backgroundColor: '#5A878C' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="relative h-12 w-12 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-6">
              <p className="text-base font-semibold mb-2" style={{ color: watchedTitle ? '#223740' : '#9CA3AF' }}>
                {watchedTitle || 'Sin título aún...'}
              </p>
              <p className="text-sm mb-3" style={{ color: '#5A878C' }}>
                Módulo {String(module.order ?? 1).padStart(2, '0')} · {contentTypes.find(t => t.type === selectedType)?.label}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
                  style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
                >
                  <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: watchedStatus === 'active' ? '#22C55E' : '#EAB308' }}></div>
                  {watchedStatus === 'active' ? 'Activo' : 'Desactivado'}
                </span>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>
                  {selectedType === ContentType.VIDEO && '📹'}
                  {selectedType === ContentType.DOCUMENT && '📄'}
                  {selectedType === ContentType.IMAGE && '🖼️'}
                  {selectedType === ContentType.TEXT && '📝'}
                </div>
              </div>
            </div>
          </div>

          {/* System flow */}
          <div className="rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all" style={{ 
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF'
          }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                Flujo del Sistema
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { step: 1, label: 'Curso creado', sub: course.title, done: true },
                { step: 2, label: 'Módulo creado', sub: module.title, done: true },
                { step: 3, label: 'Agregando contenido', sub: 'Paso actual', active: true }
              ].map(({ step, label, sub, done, active }) => (
                <div key={step} className="group relative">
                  {step < 3 && (
                    <div className="absolute left-5 top-8 h-8 w-0.5" style={{ backgroundColor: '#AEEBF2' }}></div>
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all group-hover:scale-110"
                      style={{
                        backgroundColor: done
                          ? '#AEEBF2'
                          : active
                          ? '#223740'
                          : '#F3F4F6',
                        color: done
                          ? '#223740'
                          : active
                          ? '#FFFFFF'
                          : '#9CA3AF'
                      }}
                    >
                      {done ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-semibold" style={{ color: '#223740' }}>{label}</p>
                      <p className="text-xs mt-1" style={{ color: done || active ? '#5A878C' : '#9CA3AF' }}>{sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}