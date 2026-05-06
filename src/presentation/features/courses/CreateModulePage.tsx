import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { Module } from '../../../domain/modules/types'

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { order: 1 }
  })

  const watchedTitle = watch('title')

  const onSubmit = async (data: ModuleFormData) => {
    if (!courseId) return
    const newModule: Module = {
      id: `module-${Date.now()}`,
      courseId,
      title: data.title,
      description: data.description,
      order: data.order,
      status: 'active',
      contentIds: []
    }
    console.log('Creating module:', newModule)
    navigate(`/courses/${courseId}/modules/${newModule.id}/contents/new`)
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#5A878C' }}>Curso no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-3">
        <Link
          to={`/courses/${courseId}/modules`}
          className="flex items-center gap-1 text-sm"
          style={{ color: '#5A878C' }}
        >
          <span>‹</span> Volver a módulos
        </Link>
      </div>

      <div className="flex gap-6 px-8 py-6">
        {/* Main form */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#223740' }}>Crear Módulo</h1>
            <p className="mt-1 text-sm" style={{ color: '#5A878C' }}>
              Para el curso: {course.title}. Después de crear, agregarás contenido.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Module info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
                Información del Módulo
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                  Nombre del módulo <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="Ej: Fundamentos del diseño visual"
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="Describe brevemente de qué trata este módulo..."
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>

              {/* Order */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                  Orden
                </label>
                <input
                  {...register('order', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-32 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                />
                {errors.order && <p className="mt-1 text-xs text-red-500">{errors.order.message}</p>}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Link
                to={`/courses/${courseId}/modules`}
                className="flex-1 rounded-lg border border-gray-200 py-3 text-center text-sm font-medium"
                style={{ color: '#223740' }}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#223740' }}
              >
                {isSubmitting ? 'Creando...' : 'Crear módulo →'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: system flow */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
              Flujo del Sistema
            </h3>
            <ol className="space-y-3">
              {[
                { step: 1, label: 'Crear curso', sub: course.title, done: true },
                { step: 2, label: 'Crear módulo', sub: 'Paso actual', active: true },
                { step: 3, label: 'Agregar contenido', sub: 'Paso final', active: false }
              ].map(({ step, label, sub, done, active }) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={
                      done
                        ? { backgroundColor: '#AEEBF2', color: '#223740' }
                        : active
                        ? { backgroundColor: '#223740', color: 'white' }
                        : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {done ? '✓' : step}
                  </span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#223740' }}>{label}</p>
                    <p className="text-xs" style={{ color: done || active ? '#5A878C' : '#9ca3af' }}>{sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}