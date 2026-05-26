import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { createCurso } from '../../services/courseService'
import { Course } from '../../../domain/courses/types'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Users, Target, Save, RotateCcw, CheckCircle2 } from 'lucide-react'
import { logger } from '../../utils/logger'
import { useAuthStore } from '../../stores/auth.store'
import api from '../../lib/axios'
import { UploadButton } from '../files/components/buttons/UploadButton'
import type { Documento } from '../../../domain/files/Filesapi'
import '../styles/course-theme.css'
import { CourseBreadcrumb } from './components/design-system/CourseBreadcrumb'
import { CourseFormField } from './components/design-system/CourseFormField'
import { CourseProgressIndicator } from './components/design-system/CourseProgressIndicator'
import { CourseImageUploader } from './components/design-system/CourseImageUploader'
import { useAutoSave } from './hooks/useAutoSave'

interface DocenteOption {
  id: string
  nombre: string
  correo: string
}

const courseSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres').regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,-]+$/, 'El título contiene caracteres inválidos'),
  description: z.string().max(500).optional().default(''),
  category: z.string().optional().default(''),
  instructor: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['active', 'inactive'])
})

type CourseFormData = z.infer<typeof courseSchema>

const STORAGE_KEY = 'create-course-draft'

const loadDraftData = (): Partial<CourseFormData> & { instructorTags: string[] } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    logger.warn('Error al cargar datos del borrador', { error })
  }
  return { instructorTags: [] }
}

const saveDraftData = (data: Partial<CourseFormData>, instructorTags: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      instructorTags,
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

export const CreateCoursePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedDocentes, setSelectedDocentes] = useState<DocenteOption[]>([])
  const [docenteSearch, setDocenteSearch] = useState('')
  const [docenteResults, setDocenteResults] = useState<DocenteOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loadingDocentes, setLoadingDocentes] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<{ name: string; url: string; id: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleImageUploaded = (doc: Documento) => {
    setUploadedImage({ name: doc.nombre, url: doc.url || '', id: doc.id })
  }

  // Cargar datos del borrador al montar
  useEffect(() => {
    const draftData = loadDraftData()
    const hasData = draftData.title || draftData.description || draftData.category
    if (hasData) {
      setShowSaveIndicator(true)
      setTimeout(() => setShowSaveIndicator(false), 3000)
    }
  }, [])

  const fetchDocentes = useCallback(async (search: string) => {
    setLoadingDocentes(true)
    try {
      const isWildcard = search.trim() === '$' || search.trim() === ''
      const url = isWildcard ? '/users' : `/users?nombre=${encodeURIComponent(search)}`
      const res = await api.get<{ users?: { id: string; nombre: string; correo: string; roles: string[] }[]; data?: { id_usuario: string; nombre: string; correo: string; roles: string[] }[] }>(url)
      const raw = res.data.users || res.data.data || []
      const all = raw.map((u: any) => ({ id: u.id || u.id_usuario, nombre: u.nombre, correo: u.correo }))
      setDocenteResults(all)
      setShowDropdown(true)
    } catch {
      setDocenteResults([])
    } finally {
      setLoadingDocentes(false)
    }
  }, [])

  // Pre-cargar lista de usuarios al montar (sin mostrar dropdown)
  useEffect(() => {
    fetchDocentes('').then(() => setShowDropdown(false))
  }, [fetchDocentes])

  // Buscar con debounce al escribir
  useEffect(() => {
    const q = docenteSearch.trim()
    if (!q) {
      setShowDropdown(false)
      setDocenteResults([])
      return
    }
    const timer = setTimeout(() => fetchDocentes(q), 300)
    return () => clearTimeout(timer)
  }, [docenteSearch, fetchDocentes])

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addDocente = (docente: DocenteOption) => {
    if (!selectedDocentes.find(d => d.id === docente.id)) {
      setSelectedDocentes(prev => [...prev, docente])
    }
    setDocenteSearch('')
    setDocenteResults([])
    setShowDropdown(false)
  }

  const removeDocente = (id: string) => {
    setSelectedDocentes(prev => prev.filter(d => d.id !== id))
  }

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { 
      level: 'beginner', 
      status: 'inactive',
      ...loadDraftData()
    },
    mode: 'onChange'
  })

  const watchedTitle = watch('title')
  const watchedLevel = watch('level')
  const watchedStatus = watch('status')
  const watchedCategory = watch('category')
  const watchedDescription = watch('description')

  // Funcionalidad de guardado automático
  const autoSave = useCallback(() => {
    const formData = {
      title: watchedTitle,
      description: watchedDescription,
      category: watchedCategory,
      level: watchedLevel,
      status: watchedStatus
    }
    saveDraftData(formData, [])
    setLastSaved(new Date())
    setShowSaveIndicator(true)
    setTimeout(() => setShowSaveIndicator(false), 2000)
  }, [watchedTitle, watchedDescription, watchedCategory, watchedLevel, watchedStatus])

  // Guardado automático cuando cambian los datos del formulario
  useEffect(() => {
    const timer = setTimeout(() => {
      autoSave()
    }, 1000) // Guardar después de 1 segundo de inactividad

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
      reset({ level: 'beginner', status: 'inactive' })
      setSelectedDocentes([])
      setLastSaved(null)
    }
  }

  const onSubmit = async (data: CourseFormData) => {
    try {
      const sanitizedData: CourseFormData = {
        title: data.title.trim().replace(/\s+/g, ' '),
        description: data.description?.trim().replace(/\s+/g, ' '),
        category: data.category?.trim() || '',
        instructor: data.instructor?.trim() || '',
        level: data.level,
        status: data.status
      }
      
      const newCourse: Omit<Course, 'id'> = {
        title: sanitizedData.title,
        description: sanitizedData.description || '',
        instructor: selectedDocentes.map(d => d.nombre).join(', ') || 'Sin docente asignado',
        level: sanitizedData.level,
        status: sanitizedData.status === 'active' ? 'active' : 'inactive',
        moduleIds: [],
        studentCount: 0,
        imageId: uploadedImage?.id,
      }

      const idUsuario = user?.id
      if (!idUsuario) throw new Error('Usuario no autenticado')
      const createdCourse = await createCurso(newCourse, idUsuario)
      logger.info('Curso creado exitosamente', { courseId: createdCourse.id, imageId: createdCourse.imageId })
      
      // Limpiar borrador después de creación exitosa
      clearDraftData()
      
      // Navegación automática al siguiente paso del flujo
      setTimeout(() => {
        navigate(`/courses/${createdCourse.id}/modules/new`)
      }, 1500) // Esperar 1.5s para mostrar el éxito antes de navegar
    } catch (error) {
      logger.error('Error al crear curso', { error })
      alert('Error al crear el curso. Por favor intenta nuevamente.')
    }
  }

  return (
    <main style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif', minHeight: '100vh' }}>
      {/* Encabezado */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="relative px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link 
              to="/courses" 
              className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all hover:opacity-80 hover:shadow-sm"
              style={{ 
                borderColor: '#E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#6B7280'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium text-sm sm:text-base">Volver a cursos</span>
            </Link>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Indicador de guardado */}
              {showSaveIndicator && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" 
                  style={{ backgroundColor: '#AEEBF2', color: '#5A878C' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden sm:inline">{lastSaved ? 'Guardado automáticamente' : 'Borrador restaurado'}</span>
                  <span className="sm:hidden">Guardado</span>
                </div>
              )}
              
              {/* Indicador de progreso */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full" 
                style={{ 
                  backgroundColor: '#AEEBF2',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5A878C' }} />
                <span className="text-sm font-medium" style={{ color: '#223740' }}>Creando curso</span>
              </div>
              
              {/* Acciones rápidas */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button 
                  type="button"
                  onClick={handleManualSave}
                  className="p-2 rounded-lg transition-all hover:opacity-80 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A878C]"
                  style={{ backgroundColor: 'transparent' }}
                  title="Guardar borrador"
                  aria-label="Guardar borrador"
                >
                  <Save className="h-4 w-4" style={{ color: '#6B7280' }} />
                </button>
                <button 
                  type="button"
                  onClick={handleClearDraft}
                  className="p-2 rounded-lg transition-all hover:opacity-80 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A878C]"
                  style={{ backgroundColor: 'transparent' }}
                  title="Limpiar borrador"
                  aria-label="Limpiar borrador"
                >
                  <RotateCcw className="h-4 w-4" style={{ color: '#6B7280' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Título de página con mejor jerarquía */}
          <div className="mb-6">
            <div className="text-center">
              <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: '#AEEBF2' }}>
                  <BookOpen className="w-6 h-6" style={{ color: '#5A878C' }} />
                </div>
                <div className="text-left sm:text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#223740' }}>
                    Crear Nuevo Curso
                  </h1>
                  <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                    Define la información básica de tu nuevo curso
                  </p>
                </div>
              </div>
              
              {/* Indicador de progreso moderno - responsive */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4 overflow-x-auto pb-2">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow" 
                    style={{ backgroundColor: '#223740' }}>
                    1
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold" style={{ color: '#223740' }}>Información</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>Datos del curso</div>
                  </div>
                </div>
                <div className="w-8 sm:w-12 h-0.5 shrink-0" style={{ backgroundColor: '#E5E7EB' }} />
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2" 
                    style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                    2
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs" style={{ color: '#6B7280' }}>Contenido</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>Módulos y lecciones</div>
                  </div>
                </div>
                <div className="w-8 sm:w-12 h-0.5 shrink-0" style={{ backgroundColor: '#E5E7EB' }} />
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2" 
                    style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                    3
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs" style={{ color: '#6B7280' }}>Publicación</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>Estado final</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl mx-auto w-full">

            {/* Información del curso */}
            <div className="p-4 sm:p-6 rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#5A878C' }} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#223740' }}>Información del Curso</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                    Nombre del curso <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input {...register('title')} type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[#5A878C] focus:ring-2 focus:ring-[#AEEBF2] transition-all"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}
                    placeholder="Ej: Diseño UX/UI Avanzado" />
                  {errors.title && <p className="mt-1 text-sm" style={{ color: '#DC2626' }}>{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Descripción</label>
                  <textarea {...register('description')} rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[#5A878C] focus:ring-2 focus:ring-[#AEEBF2] transition-all resize-none"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}
                    placeholder="Describe de qué trata el curso..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Categoría</label>
                  <input {...register('category')} type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[#5A878C] focus:ring-2 focus:ring-[#AEEBF2] transition-all"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}
                    placeholder="Ej: Programación, Diseño, Marketing..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Imagen del curso</label>
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden" style={{ border: '2px solid #E5E7EB' }}>
                        <img
                          src={uploadedImage.url}
                          alt="Imagen del curso"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC2626]"
                          style={{ color: '#DC2626' }}
                          aria-label="Eliminar imagen"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm" style={{ color: '#6B7280' }}>{uploadedImage.name}</p>
                    </div>
                  ) : (
                    <UploadButton onUploaded={handleImageUploaded} className="w-full" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Nivel</label>
                  <div className="relative">
                    <select {...register('level')}
                      className="w-full px-4 py-3 rounded-lg border-2 appearance-none focus:outline-none focus:border-[#5A878C] focus:ring-2 focus:ring-[#AEEBF2] cursor-pointer transition-all"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}>
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6B7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Docentes */}
            <div className="p-4 sm:p-6 rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div className="flex items-start sm:items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                  <Users className="w-5 h-5" style={{ color: '#5A878C' }} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#223740' }}>Docentes Asignados</h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Escribe <strong>$</strong> para ver todos los disponibles</p>
                </div>
              </div>

              {selectedDocentes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDocentes.map(d => (
                    <div key={d.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
                      {d.nombre}
                      <button type="button" onClick={() => removeDocente(d.id)} className="hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#DC2626] rounded-full" aria-label={`Eliminar ${d.nombre}`}>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  value={docenteSearch}
                  onChange={e => setDocenteSearch(e.target.value)}
                  onFocus={() => { if (docenteSearch.trim()) setShowDropdown(true) }}
                  placeholder='Buscar por nombre o escribe "$" para listar todos...'
                  className="w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none focus:border-[#5A878C] focus:ring-2 focus:ring-[#AEEBF2] transition-all"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740' }}
                />
                {loadingDocentes && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" style={{ color: '#5A878C' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
                {showDropdown && docenteResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-xl border shadow-lg overflow-y-auto max-h-56"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                    {docenteResults.map(d => (
                      <button key={d.id} type="button" onClick={() => addDocente(d)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                        style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
                          {d.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#223740' }}>{d.nombre}</p>
                          <p className="text-xs truncate" style={{ color: '#6B7280' }}>{d.correo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && !loadingDocentes && docenteResults.length === 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-xl border px-4 py-3 text-sm"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#6B7280' }}>
                    No se encontraron usuarios. Escribe <strong>$</strong> para ver todos.
                  </div>
                )}
              </div>
            </div>

            {/* Estado de publicación */}
            <div className="p-4 sm:p-6 rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                  <Target className="w-5 h-5" style={{ color: '#5A878C' }} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#223740' }}>Estado de Publicación</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {[
                  { value: 'inactive', label: 'Inactivo', desc: 'No visible para estudiantes' },
                  { value: 'active',   label: 'Activo',   desc: 'Visible para estudiantes' }
                ].map(opt => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
                    <input {...register('status')} type="radio" value={opt.value} className="sr-only" />
                    <div className="p-4 rounded-xl border-2 transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5A878C] focus:ring-offset-2"
                      style={{
                        borderColor: watchedStatus === opt.value ? '#5A878C' : '#E5E7EB',
                        backgroundColor: watchedStatus === opt.value ? '#AEEBF2' : '#FFFFFF'
                      }}>
                      <p className="font-bold text-sm" style={{ color: '#223740' }}>{opt.label}</p>
                      <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/courses"
                className="flex-1 px-6 py-3 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] font-medium text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B7280]"
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
                className="flex-1 px-6 py-3 rounded-xl font-bold text-base transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#223740]"
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
                    {isSubmitting ? 'Creando...' : 'Crear Curso'}
                  </span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}