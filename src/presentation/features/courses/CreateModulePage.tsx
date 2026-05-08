import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'
import { useState, useEffect } from 'react'
import { BookOpen, Save, RotateCcw, CheckCircle2 } from 'lucide-react'

const moduleSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  order: z.number().min(1, 'El orden debe ser al menos 1')
})

type ModuleFormData = z.infer<typeof moduleSchema>

export const CreateModulePage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const course = courseId ? CourseRepository.getCourseById(courseId) : null
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { order: 1 }
  })

  const onSubmit = async (data: ModuleFormData) => {
    if (!courseId) return
    
    try {
      const newModule = ModuleRepository.createModule({
        courseId,
        title: data.title,
        description: data.description,
        order: data.order,
        status: 'active',
        contentIds: []
      })
      
      console.log('Módulo creado exitosamente:', newModule)
      navigate(`/courses/${courseId}/modules/${newModule.id}/contents/new`)
    } catch (error) {
      console.error('Error al crear módulo:', error)
      // TODO: Mostrar mensaje de error al usuario
    }
  }

  if (!course) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background-page)' }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Curso no encontrado.</p>
        </div>
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
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" 
                  style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}>
                  1
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>Información</span>
              </div>
              <div className="w-12 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" 
                  style={{ backgroundColor: '#223740' }}>
                  2
                </div>
                <span className="text-sm font-medium" style={{ color: '#223740' }}>Contenido</span>
              </div>
              <div className="w-12 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" 
                  style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}>
                  3
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>Publicación</span>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-label font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Título del módulo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="input w-full"
                  placeholder="Ej: Introducción a React"
                />
                {errors.title && (
                  <p className="mt-2 text-body-sm" style={{ color: '#ef4444' }}>
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-label font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Descripción <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input w-full resize-none"
                  placeholder="Describe el contenido y objetivos de este módulo..."
                />
                {errors.description && (
                  <p className="mt-2 text-body-sm" style={{ color: '#ef4444' }}>
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block text-label font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Orden <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  {...register('order', { valueAsNumber: true })}
                  type="number"
                  className="input w-full"
                  placeholder="1"
                  min="1"
                />
                {errors.order && (
                  <p className="mt-2 text-body-sm" style={{ color: '#ef4444' }}>
                    {errors.order.message}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  to={`/courses/${courseId}/modules`}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear módulo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}