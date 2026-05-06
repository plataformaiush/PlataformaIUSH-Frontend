import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { Course } from '../../../domain/courses/types'
import { useState } from 'react'

const courseSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().optional(),
  instructor: z.string().min(1, 'El instructor es requerido'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['active', 'draft'])
})

type CourseFormData = z.infer<typeof courseSchema>

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
}

export const CreateCoursePage = () => {
  const navigate = useNavigate()
  const [instructorTags, setInstructorTags] = useState<string[]>(['Ana García', 'Carlos Ruiz'])
  const [instructorInput, setInstructorInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { level: 'beginner', status: 'draft' }
  })

  const watchedTitle = watch('title')
  const watchedLevel = watch('level')
  const watchedStatus = watch('status')

  const handleInstructorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && instructorInput.trim()) {
      e.preventDefault()
      setInstructorTags([...instructorTags, instructorInput.trim()])
      setInstructorInput('')
    }
  }

  const removeInstructor = (name: string) => {
    setInstructorTags(instructorTags.filter((t) => t !== name))
  }

  const onSubmit = async (data: CourseFormData) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: data.title,
      description: data.description,
      instructor: instructorTags.join(', ') || data.instructor,
      level: data.level,
      status: data.status === 'active' ? 'active' : 'inactive',
      moduleIds: [],
      studentCount: 0
    }
    console.log('Creating course:', newCourse)
    navigate('/courses')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-3">
        <Link to="/courses" className="flex items-center gap-1 text-sm" style={{ color: '#5A878C' }}>
          <span>‹</span> Volver a cursos
        </Link>
      </div>

      <div className="flex gap-6 px-8 py-6">
        {/* Main form */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#223740' }}>Crear Curso</h1>
            <p className="mt-1 text-sm" style={{ color: '#5A878C' }}>
              Completa la información para crear un nuevo curso
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Course info section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
                Información del Curso
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                  Nombre del curso <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#AEEBF2' } as React.CSSProperties}
                  placeholder="Ej: Diseño UX/UI Avanzado"
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
                  placeholder="Describe de qué trata el curso y qué aprenderán los estudiantes..."
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>

              {/* Category + Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                    Categoría
                  </label>
                  <select
                    {...register('category')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="programming">Programación</option>
                    <option value="design">Diseño</option>
                    <option value="marketing">Marketing</option>
                    <option value="data">Datos</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                    Nivel
                  </label>
                  <select
                    {...register('level')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Instructors section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
                Docentes Asignados
              </h2>
              <p className="mb-3 text-xs" style={{ color: '#5A878C' }}>Agregar docentes</p>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:ring-1"
                style={{ '--tw-ring-color': '#AEEBF2' } as React.CSSProperties}>
                {instructorTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeInstructor(tag)}
                      className="ml-0.5 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={instructorInput}
                  onChange={(e) => setInstructorInput(e.target.value)}
                  onKeyDown={handleInstructorKeyDown}
                  placeholder="Nombre y Enter para agregar..."
                  className="flex-1 text-sm outline-none placeholder-gray-400 min-w-32"
                />
              </div>
              {/* Hidden field for validation */}
              <input {...register('instructor')} type="hidden" value={instructorTags.join(', ')} />
            </div>

            {/* Publication status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
                Estado de Publicación
              </h2>
              <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-gray-200">
                <label className="cursor-pointer">
                  <input {...register('status')} type="radio" value="active" className="sr-only" />
                  <div
                    className="py-3 text-center text-sm font-medium transition"
                    style={
                      watchedStatus === 'active'
                        ? {}
                        : { backgroundColor: 'white', color: '#223740' }
                    }
                  >
                    {watchedStatus !== 'active' ? 'Activo' : ''}
                    {watchedStatus === 'active' && (
                      <span style={{ color: '#5A878C' }}>Activo</span>
                    )}
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input {...register('status')} type="radio" value="draft" className="sr-only" />
                  <div
                    className="py-3 text-center text-sm font-semibold transition"
                    style={
                      watchedStatus === 'draft'
                        ? { backgroundColor: '#223740', color: 'white' }
                        : { backgroundColor: 'white', color: '#223740' }
                    }
                  >
                    Borrador
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Link
                to="/courses"
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
                {isSubmitting ? 'Creando...' : 'Crear curso →'}
              </button>
            </div>
          </form>
        </div>

        {/* Right sidebar: preview + system flow */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Preview */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
              Vista Previa
            </h3>
            <p className="text-sm font-medium" style={{ color: watchedTitle ? '#223740' : '#9ca3af' }}>
              {watchedTitle || 'Nombre del curso...'}
            </p>
            <p className="mt-1 text-xs" style={{ color: '#9ca3af' }}>
              Categoría · {levelLabels[watchedLevel] || 'Nivel'}
            </p>
            <span
              className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              {watchedStatus === 'active' ? 'Activo' : 'Borrador'}
            </span>
          </div>

          {/* System flow */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
              Flujo del Sistema
            </h3>
            <ol className="space-y-3">
              {[
                { step: 1, label: 'Crear curso', sub: 'Paso actual', active: true },
                { step: 2, label: 'Crear módulo', sub: 'Siguiente paso', active: false },
                { step: 3, label: 'Agregar contenido', sub: 'Paso final', active: false }
              ].map(({ step, label, sub, active }) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={
                      active
                        ? { backgroundColor: '#223740', color: 'white' }
                        : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                    }
                  >
                    {step}
                  </span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#223740' }}>{label}</p>
                    <p className="text-xs" style={{ color: active ? '#5A878C' : '#9ca3af' }}>{sub}</p>
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