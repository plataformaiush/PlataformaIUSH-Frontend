import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCursoById } from '../../services/courseService'
import { createModulo } from '../../services/moduleService'
import { useState, useEffect, useCallback } from 'react'
import type { Course } from '../../../domain/courses/types'
import { BookOpen, Save, RotateCcw, CheckCircle2, Users, Target } from 'lucide-react'
import { logger } from '../../utils/logger'

const moduleSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(500, 'La descripción no puede exceder 500 caracteres'),
  order: z.number().min(1, 'El orden debe ser al menos 1')
})

type ModuleFormData = z.infer<typeof moduleSchema>

const STORAGE_KEY = 'create-module-draft'

const loadDraftData = (): Partial<ModuleFormData> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    logger.warn('Error al cargar datos del borrador', { error })
  }
  return {}
}

const saveDraftData = (data: Partial<ModuleFormData>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString()
    }))
  } catch (error) {
    logger.warn('Error al guardar datos del borrador', { error })
  }
}

const clearDraftData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    logger.warn('Error al limpiar datos del borrador', { error })
  }
}

export const CreateModulePage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)

  useEffect(() => {
    if (!courseId) return
    fetchCursoById(courseId)
      .then(setCourse)
      .catch(err => logger.error('Error al cargar curso', { error: err, courseId }))
      .finally(() => setLoading(false))
  }, [courseId])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { 
      order: 1,
      ...loadDraftData()
    },
    mode: 'onChange'
  })

  const watchedTitle = watch('title')
  const watchedDescription = watch('description')
  const watchedOrder = watch('order')

  // Funcionalidad de guardado automático
  const autoSave = useCallback(() => {
    const formData = {
      title: watchedTitle,
      description: watchedDescription,
      order: watchedOrder
    }
    
    saveDraftData(formData)
    setLastSaved(new Date())
    
    // Mostrar indicador de guardado
    setShowSaveIndicator(true)
    setTimeout(() => setShowSaveIndicator(false), 2000)
  }, [watchedTitle, watchedDescription, watchedOrder])

  // Guardado automático cuando cambian los datos del formulario
  useEffect(() => {
    const timer = setTimeout(() => {
      autoSave()
    }, 1000)

    return () => clearTimeout(timer)
  }, [autoSave])

  // Función de guardado manual
  const handleManualSave = () => {
    autoSave()
  }

  // Limpiar borrador y reiniciar formulario
  const handleClearDraft = () => {
    if (confirm('¿Estás seguro de que quieres eliminar el borrador guardado?')) {
      clearDraftData()
      reset({ order: 1 })
      setLastSaved(null)
    }
  }

  const onSubmit = async (data: ModuleFormData) => {
    if (!courseId) return
    
    try {
      // Sanitizar datos de entrada
      const sanitizedData: ModuleFormData = {
        title: data.title.trim().replace(/\s+/g, ' '),
        description: data.description.trim().replace(/\s+/g, ' '),
        order: data.order
      }
      
      const newModule = await createModulo(courseId, {
        courseId,
        title: sanitizedData.title,
        description: sanitizedData.description,
        order: sanitizedData.order,
        status: 'active',
      })
      
      logger.info('Módulo creado exitosamente', { moduleId: newModule.id, courseId })
      
      // Limpiar borrador después de creación exitosa
      clearDraftData()
      
      // Navegación automática al siguiente paso del flujo
      setTimeout(() => {
        navigate(`/courses/${courseId}/modules/${newModule.id}/contents/new`)
      }, 1500)
    } catch (error) {
      logger.error('Error al crear módulo', { error, courseId })
      alert('Error al crear el módulo. Por favor intenta nuevamente.')
    }
  }

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>Curso no encontrado.</p>
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
              to={`/courses/${courseId}/modules`}
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
              <span className="font-medium">Volver a módulos</span>
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
                <span className="text-sm font-medium" style={{ color: '#223740' }}>Creando módulo</span>
              </div>
              
              {/* Quick actions */}
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleManualSave}
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: 'transparent' }}
                  title="Guardar borrador"
                >
                  <Save className="h-4 w-4" style={{ color: '#6B7280' }} />
                </button>
                <button 
                  type="button"
                  onClick={handleClearDraft}
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

      <div className="px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page title and progress */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: '#AEEBF2' }}>
                <BookOpen className="w-6 h-6" style={{ color: '#5A878C' }} />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>
                  Crear Módulo
                </h1>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Agrega un nuevo módulo al curso: <span style={{ fontWeight: 500, color: '#223740' }}>{course?.title}</span>
                </p>
              </div>
            </div>
            
            {/* Progress steps */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2" 
                  style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                  1
                </div>
                <div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>Información</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>Datos del curso</div>
                </div>
              </div>
              <div className="w-12 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow" 
                  style={{ backgroundColor: '#223740' }}>
                  2
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: '#223740' }}>Módulo</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>Crear módulo</div>
                </div>
              </div>
              <div className="w-12 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2" 
                  style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                  3
                </div>
                <div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>Contenido</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>Lecciones y recursos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow" style={{ 
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF'
          }}>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#5A878C' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#223740' }}>
                    Información del Módulo
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                    Completa los datos principales del módulo
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                  Título del módulo <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FAFAFA',
                    color: '#223740',
                    fontSize: '15px'
                  }}
                  placeholder="Ej: Introducción a React"
                />
                {errors.title && (
                  <p className="mt-2 text-sm font-medium" style={{ color: '#DC2626' }}>
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                  Descripción <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:border-blue-400 resize-none"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FAFAFA',
                    color: '#223740',
                    fontSize: '15px'
                  }}
                  placeholder="Describe el contenido y objetivos de este módulo..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm font-medium" style={{ color: '#DC2626' }}>
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                  Orden <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  {...register('order', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:border-blue-400"
                  style={{ 
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FAFAFA',
                    color: '#223740',
                    fontSize: '15px'
                  }}
                  placeholder="1"
                  min="1"
                />
                {errors.order && (
                  <p className="mt-2 text-sm font-medium" style={{ color: '#DC2626' }}>
                    {errors.order.message}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  to={`/courses/${courseId}/modules`}
                  className="flex-1 px-6 py-3 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] font-medium text-base"
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
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-base transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#223740',
                    color: '#FFFFFF'
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                    <span>
                      {isSubmitting ? 'Creando...' : 'Crear Módulo'}
                    </span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}