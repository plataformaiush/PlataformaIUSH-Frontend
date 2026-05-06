import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ContentRepository } from '../../../domain/contents/contentRepository'
import { ModuleRepository } from '../../../domain/modules/moduleRepository'
import { CourseRepository } from '../../../domain/courses/courseRepository'
import { Content, ContentType } from '../../../domain/contents/types'

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
    const newContent: Content = {
      id: `content-${Date.now()}`,
      moduleId,
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status === 'active' ? 'active' : 'draft',
      resourceUrl: data.resourceUrl || undefined,
      durationMinutes: data.durationMinutes,
      order: data.order
    }
    console.log('Adding content:', newContent)
    navigate(`/courses/${courseId}/modules/${moduleId}/contents`)
  }

  if (!course || !module) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#5A878C' }}>Curso o módulo no encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-3">
        <Link
          to={`/courses/${courseId}/modules/${moduleId}/contents`}
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
            <h1 className="text-2xl font-bold" style={{ color: '#223740' }}>Agregar Contenido</h1>
            {/* Module badge */}
            <span
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#5A878C' }} />
              Módulo {String(module.order ?? 1).padStart(2, '0')} — {module.title}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
                Información Básica
              </h2>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                  Título del contenido <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="Ej: Introducción a los principios visuales"
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="Describe brevemente de qué trata este contenido..."
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>
            </div>

            {/* Content type selector */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
                Tipo de Contenido
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {contentTypes.map(({ type, label, icon }) => {
                  const isSelected = selectedType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('type', type)}
                      className="flex flex-col items-center gap-2 rounded-lg border-2 py-5 transition"
                      style={
                        isSelected
                          ? { borderColor: '#5A878C', backgroundColor: '#f0fafa', color: '#223740' }
                          : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#9ca3af' }
                      }
                    >
                      {icon}
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* File upload + URL */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
                Agregar Archivo o URL
              </h2>

              {/* Drag & drop area */}
              <div
                className="mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10"
                style={{ borderColor: '#AEEBF2' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#AEEBF2' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm" style={{ color: '#5A878C' }}>
                  Arrastra tu{' '}
                  <span className="font-semibold underline cursor-pointer" style={{ color: '#5A878C' }}>
                    archivo aquí
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-400">MP4, PDF, PNG, JPG hasta 500 MB</p>
              </div>

              <div className="mb-1 text-center text-xs text-gray-400">o</div>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                  URL del contenido externo
                </label>
                <input
                  {...register('resourceUrl')}
                  type="url"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
                {errors.resourceUrl && <p className="mt-1 text-xs text-red-500">{errors.resourceUrl.message}</p>}
              </div>

              {selectedType === ContentType.VIDEO && (
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#223740' }}>
                    Duración (minutos)
                  </label>
                  <input
                    {...register('durationMinutes', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-32 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              )}
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
                    className="py-3 text-center text-sm font-semibold transition"
                    style={
                      watchedStatus === 'active'
                        ? { backgroundColor: '#223740', color: 'white' }
                        : { backgroundColor: 'white', color: '#223740' }
                    }
                  >
                    Activo
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input {...register('status')} type="radio" value="draft" className="sr-only" />
                  <div
                    className="py-3 text-center text-sm font-medium transition"
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
                to={`/courses/${courseId}/modules/${moduleId}/contents`}
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
                {isSubmitting ? 'Guardando...' : 'Guardar contenido ↗'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div
              className="flex h-24 items-center justify-center"
              style={{ backgroundColor: '#5A878C' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium" style={{ color: watchedTitle ? '#223740' : '#9ca3af' }}>
                {watchedTitle || 'Sin título aún...'}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: '#9ca3af' }}>
                Módulo {String(module.order ?? 1).padStart(2, '0')} · {contentTypes.find(t => t.type === selectedType)?.label}
              </p>
              <span
                className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: '#AEEBF2', color: '#223740' }}
              >
                {watchedStatus === 'active' ? 'Activo' : 'Borrador'}
              </span>
            </div>
          </div>

          {/* System flow */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A878C' }}>
              Flujo del Sistema
            </h3>
            <ol className="space-y-3">
              {[
                { step: 1, label: 'Curso creado', sub: course.title, done: true },
                { step: 2, label: 'Módulo creado', sub: module.title, done: true },
                { step: 3, label: 'Agregando contenido', sub: 'Paso actual', active: true }
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