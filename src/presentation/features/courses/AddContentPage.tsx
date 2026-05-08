import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { ContentRepository } from '../../../domain/contents/contentRepository'
import { ContentType } from '../../../domain/contents/types'
import { useState } from 'react'
import { BookOpen, Save, RotateCcw, CheckCircle2 } from 'lucide-react'

const contentSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  type: z.nativeEnum(ContentType),
  resourceUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  durationMinutes: z.number().optional(),
  order: z.number().min(1, 'El orden debe ser al menos 1'),
  status: z.enum(['active', 'draft'])
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
    type: ContentType.IMAGE,
    label: 'Imagen',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
    type: ContentType.TEXT,
    label: 'Texto',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    )
  }
]

export const AddContentPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
  const navigate = useNavigate()
  const course = courseId ? CourseRepository.getCourseById(courseId) : null
  const module = moduleId ? ModuleRepository.getModuleById(moduleId) : null
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: { order: 1, type: ContentType.VIDEO, status: 'active' }
  })

  const selectedType = watch('type')
  const watchedTitle = watch('title')
  const watchedStatus = watch('status')

  const onSubmit = async (data: ContentFormData) => {
    if (!moduleId) return
    
    try {
      const newContent = ContentRepository.createContent({
        moduleId,
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status === 'active' ? 'active' : 'draft',
        resourceUrl: data.resourceUrl || undefined,
        durationMinutes: data.durationMinutes,
        order: data.order
      })
      
      console.log('Contenido creado exitosamente:', newContent)
      navigate(`/courses/${courseId}/modules/${moduleId}/contents`)
    } catch (error) {
      console.error('Error al crear contenido:', error)
      // TODO: Show error message to user
    }
  }

  if (!course || !module) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#5A878C' }}>Curso o módulo no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to={`/courses/${courseId}/modules/${moduleId}/contents`}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all hover:opacity-80"
              style={{ 
                borderColor: '#E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#6B7280'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Volver a contenidos</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Save indicator */}
              {showSaveIndicator && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" 
                  style={{ backgroundColor: '#AEEBF2', color: '#5A878C' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  {lastSaved ? 'Guardado automáticamente' : 'Borrador restaurado'}
                </div>
              )}
              
              {/* Progress indicator */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full" 
                style={{ 
                  backgroundColor: '#AEEBF2',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5A878C' }} />
                <span className="text-sm font-medium" style={{ color: '#223740' }}>Creando contenido</span>
              </div>
              
              {/* Quick actions */}
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: 'transparent' }}
                  title="Guardar borrador"
                >
                  <Save className="h-4 w-4" style={{ color: '#6B7280' }} />
                </button>
                <button 
                  type="button"
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: 'transparent' }}
                  title="Limpiar borrador"
                >
                  <RotateCcw className="h-4 w-4" style={{ color: '#6B7280' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 px-8 py-8 max-w-7xl mx-auto">
        {/* Main form */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>Agregar Contenido</h1>
            <p className="text-sm" style={{ color: '#5A878C' }}>Completa la información para crear un nuevo contenido en tu módulo</p>
            {/* Module badge */}
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#5A878C' }} />
                Módulo {String(module.order ?? 1).padStart(2, '0')} — {module.title}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-100/50 transition-all hover:shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  Información Básica
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>
                    Título del contenido <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Ej: Introducción a los principios visuales"
                  />
                  {errors.title && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><span className="text-red-400">⚠</span> {errors.title.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>
                    Descripción
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                    placeholder="Describe brevemente de qué trata este contenido..."
                  />
                  {errors.description && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><span className="text-red-400">⚠</span> {errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Content type selector */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  Tipo de Contenido
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                          ? { borderColor: '#5A878C', backgroundColor: '#f0fafa', color: '#223740', boxShadow: '0 0 0 3px rgba(90, 135, 140, 0.1)' }
                          : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#9ca3af' }
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
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  Agregar Archivo o URL
                </h2>
              </div>

              {/* Drag & drop area */}
              <div
                className="group relative mb-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 transition-all hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer"
                style={{ borderColor: '#AEEBF2' }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#5A878C' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-base font-semibold" style={{ color: '#5A878C' }}>
                    Arrastra tu archivo aquí
                  </p>
                  <p className="mt-2 text-sm text-gray-500">MP4, PDF, PNG, JPG hasta 500 MB</p>
                  <button className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:scale-105" style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
                    O selecciona un archivo
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">o</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>
                    URL del contenido externo
                  </label>
                  <input
                    {...register('resourceUrl')}
                    type="url"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {errors.resourceUrl && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><span className="text-red-400">⚠</span> {errors.resourceUrl.message}</p>}
                </div>

                {selectedType === ContentType.VIDEO && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#223740' }}>
                      Duración (minutos)
                    </label>
                    <input
                      {...register('durationMinutes', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="w-40 rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Publication status */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: '#5A878C' }}></div>
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#5A878C' }}>
                  Estado de Publicación
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-inner">
                <label className="group cursor-pointer">
                  <input {...register('status')} type="radio" value="active" className="sr-only" />
                  <div
                    className="relative py-4 text-center text-sm font-bold transition-all"
                    style={
                      watchedStatus === 'active'
                        ? { backgroundColor: '#223740', color: 'white' }
                        : { backgroundColor: 'white', color: '#223740' }
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${watchedStatus === 'active' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                      <span>Activo</span>
                    </div>
                    {watchedStatus === 'active' && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-400 to-blue-400"></div>
                    )}
                  </div>
                </label>
                <label className="group cursor-pointer">
                  <input {...register('status')} type="radio" value="draft" className="sr-only" />
                  <div
                    className="relative py-4 text-center text-sm font-medium transition-all"
                    style={
                      watchedStatus === 'draft'
                        ? { backgroundColor: '#223740', color: 'white' }
                        : { backgroundColor: 'white', color: '#223740' }
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${watchedStatus === 'draft' ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                      <span>Borrador</span>
                    </div>
                    {watchedStatus === 'draft' && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Link
                to={`/courses/${courseId}/modules/${moduleId}/contents`}
                className="flex-1 rounded-xl border-2 border-gray-200 py-4 text-center text-sm font-semibold transition-all hover:border-gray-300 hover:bg-gray-50"
                style={{ color: '#223740' }}
              >
                Cancelar
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

        {/* Sidebar */}
        <div className="w-80 shrink-0 space-y-6">
          {/* Preview */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100/50">
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
              <p className="text-base font-semibold mb-2" style={{ color: watchedTitle ? '#223740' : '#9ca3af' }}>
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
                  <div className={`h-2 w-2 rounded-full ${watchedStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  {watchedStatus === 'active' ? 'Activo' : 'Borrador'}
                </span>
                <div className="text-xs text-gray-400">
                  {selectedType === ContentType.VIDEO && '📹'}
                  {selectedType === ContentType.DOCUMENT && '📄'}
                  {selectedType === ContentType.IMAGE && '🖼️'}
                  {selectedType === ContentType.TEXT && '📝'}
                </div>
              </div>
            </div>
          </div>

          {/* System flow */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-100/50">
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
                          : '#f3f4f6',
                        color: done
                          ? '#223740'
                          : active
                          ? 'white'
                          : '#9ca3af'
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
                      <p className="text-xs mt-1" style={{ color: done || active ? '#5A878C' : '#9ca3af' }}>{sub}</p>
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