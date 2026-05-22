import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { createCurso } from '../../services/courseService'
import { Course } from '../../../domain/courses/types'
import { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle2, BookOpen, Users, Target, Save, RotateCcw } from 'lucide-react'
import { logger } from '../../utils/logger'
import { useAuthStore } from '../../stores/auth.store'
import api from '../../lib/axios'

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

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
}

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
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
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

  // Restaurar datos del borrador
  const handleRestoreDraft = () => {
    const draftData = loadDraftData()
    if (draftData.title) setValue('title', draftData.title)
    if (draftData.description) setValue('description', draftData.description)
    if (draftData.category) setValue('category', draftData.category)
    if (draftData.level) setValue('level', draftData.level)
    if (draftData.status) setValue('status', draftData.status)
    setShowSaveIndicator(true)
    setTimeout(() => setShowSaveIndicator(false), 3000)
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
      }

      const idUsuario = user?.id
      if (!idUsuario) throw new Error('Usuario no autenticado')
      const createdCourse = await createCurso(newCourse, idUsuario)
      logger.info('Curso creado exitosamente', { courseId: createdCourse.id })
      
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
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Encabezado */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              to="/courses" 
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
              <span className="font-medium">Volver a cursos</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Indicador de guardado */}
              {showSaveIndicator && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" 
                  style={{ backgroundColor: '#AEEBF2', color: '#5A878C' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  {lastSaved ? 'Guardado automáticamente' : 'Borrador restaurado'}
                </div>
              )}
              
              {/* Indicador de progreso */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full" 
                style={{ 
                  backgroundColor: '#AEEBF2',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5A878C' }} />
                <span className="text-sm font-medium" style={{ color: '#223740' }}>Creando curso</span>
              </div>
              
              {/* Acciones rápidas */}
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

      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Título de página con mejor jerarquía */}
          <div className="mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: '#AEEBF2' }}>
                  <BookOpen className="w-6 h-6" style={{ color: '#5A878C' }} />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold" style={{ color: '#223740' }}>
                    Crear Nuevo Curso
                  </h1>
                  <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                    Define la información básica de tu nuevo curso
                  </p>
                </div>
              </div>
              
              {/* Indicador de progreso moderno */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow" 
                    style={{ backgroundColor: '#223740' }}>
                    1
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: '#223740' }}>Información</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>Datos del curso</div>
                  </div>
                </div>
                <div className="w-12 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2" 
                    style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                    2
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>Contenido</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>Módulos y lecciones</div>
                  </div>
                </div>
                <div className="w-12 h-0.5" style={{ backgroundColor: '#E5E7EB' }} />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2" 
                    style={{ backgroundColor: '#E5E7EB', color: '#6B7280', borderColor: '#E5E7EB' }}>
                    3
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>Publicación</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>Estado final</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl mx-auto">

            {/* Información del curso */}
            <div className="p-6 rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#5A878C' }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: '#223740' }}>Información del Curso</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                    Nombre del curso <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input {...register('title')} type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}
                    placeholder="Ej: Diseño UX/UI Avanzado" />
                  {errors.title && <p className="mt-1 text-sm" style={{ color: '#DC2626' }}>{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Descripción</label>
                  <textarea {...register('description')} rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none resize-none"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}
                    placeholder="Describe de qué trata el curso..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Categoría</label>
                  <input {...register('category')} type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}
                    placeholder="Ej: Programación, Diseño, Marketing..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>Nivel</label>
                  <select {...register('level')}
                    className="w-full px-4 py-3 rounded-lg border-2 appearance-none focus:outline-none cursor-pointer"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', color: '#223740', fontSize: '15px' }}>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Docentes */}
            <div className="p-6 rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                  <Users className="w-5 h-5" style={{ color: '#5A878C' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#223740' }}>Docentes Asignados</h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Escribe <strong>$</strong> para ver todos los disponibles</p>
                </div>
              </div>

              {selectedDocentes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDocentes.map(d => (
                    <div key={d.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
                      {d.nombre}
                      <button type="button" onClick={() => removeDocente(d.id)} className="hover:opacity-70">
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
                  className="w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none"
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
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{ backgroundColor: '#AEEBF2', color: '#223740' }}>
                          {d.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#223740' }}>{d.nombre}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{d.correo}</p>
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
            <div className="p-6 rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                  <Target className="w-5 h-5" style={{ color: '#5A878C' }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: '#223740' }}>Estado de Publicación</h2>
              </div>
              <div className="flex gap-4">
                {[
                  { value: 'inactive', label: 'Inactivo', desc: 'No visible para estudiantes' },
                  { value: 'active',   label: 'Activo',   desc: 'Visible para estudiantes' }
                ].map(opt => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
                    <input {...register('status')} type="radio" value={opt.value} className="sr-only" />
                    <div className="p-4 rounded-xl border-2 transition-all"
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
            <div className="flex gap-4">
              <Link
                to="/courses"
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