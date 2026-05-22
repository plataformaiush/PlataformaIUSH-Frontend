import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { createCurso } from '../../services/courseService'
import { Course } from '../../../domain/courses/types'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, BookOpen, Users, Target, Plus, Save, RotateCcw } from 'lucide-react'
import { logger } from '../../utils/logger'
import { useAuthStore } from '../../stores/auth.store'

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
  const [instructorTags, setInstructorTags] = useState<string[]>([])
  const [instructorInput, setInstructorInput] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)

  // Cargar datos del borrador al montar
  useEffect(() => {
    const draftData = loadDraftData()
    if (draftData.instructorTags) {
      setInstructorTags(draftData.instructorTags)
    }
    
    // Verificar si el borrador tiene datos significativos
    const hasData = draftData.title || draftData.description || draftData.category || 
                   (draftData.instructorTags && draftData.instructorTags.length > 0)
    
    if (hasData) {
      setShowSaveIndicator(true)
      setTimeout(() => setShowSaveIndicator(false), 3000)
    }
  }, [])

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
    
    saveDraftData(formData, instructorTags)
    setLastSaved(new Date())
    
    // Mostrar indicador de guardado
    setShowSaveIndicator(true)
    setTimeout(() => setShowSaveIndicator(false), 2000)
  }, [watchedTitle, watchedDescription, watchedCategory, watchedLevel, watchedStatus, instructorTags])

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
      setInstructorTags([])
      setInstructorInput('')
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
    if (draftData.instructorTags) {
      setInstructorTags(draftData.instructorTags)
    }
    setShowSaveIndicator(true)
    setTimeout(() => setShowSaveIndicator(false), 3000)
  }

  const handleInstructorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && instructorInput.trim()) {
      e.preventDefault()
      // Sanitize input
      const sanitizedInstructor = instructorInput.trim().replace(/\s+/g, ' ')
      
      // Validar formato del nombre del instructor
      if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ.-]+$/.test(sanitizedInstructor)) {
        alert('El nombre del instructor solo puede contener letras, espacios, guiones y puntos')
        return
      }
      
      if (sanitizedInstructor.length > 200) {
        alert('El nombre del instructor no puede exceder 200 caracteres')
        return
      }
      
      // Verificar duplicados
      if (instructorTags.some(tag => tag.toLowerCase() === sanitizedInstructor.toLowerCase())) {
        alert('Este instructor ya ha sido agregado')
        return
      }
      
      setInstructorTags([...instructorTags, sanitizedInstructor])
      setInstructorInput('')
      // Guardado automático después de agregar instructor
      setTimeout(autoSave, 100)
    }
  }

  const removeInstructor = (name: string) => {
    setInstructorTags(instructorTags.filter((t) => t !== name))
    // Guardado automático después de eliminar instructor
    setTimeout(autoSave, 100)
  }

  const onSubmit = async (data: CourseFormData) => {
    try {
      // Sanitizar datos de entrada
      const sanitizedData: CourseFormData = {
        title: data.title.trim().replace(/\s+/g, ' '),
        description: data.description.trim().replace(/\s+/g, ' '),
        category: data.category?.trim() || '',
        instructor: data.instructor?.trim() || '',
        level: data.level,
        status: data.status
      }
      
      const newCourse: Omit<Course, 'id'> = {
        title: sanitizedData.title,
        description: sanitizedData.description,
        instructor: instructorTags.join(', ') || sanitizedData.instructor || 'Sin instructor asignado',
        level: sanitizedData.level,
        status: sanitizedData.status === 'active' ? 'active' : 'inactive',
        moduleIds: [],
        studentCount: 0
      }
      

      // Usuario placeholder para desarrollo (seed insertado en BD)
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid xl:grid-cols-2 gap-6 lg:gap-5">
              {/* Columna izquierda */}
              <div className="space-y-6">
                {/* Tarjeta de información del curso */}
                <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow" style={{ 
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
                          Información del Curso
                        </h2>
                        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                          Completa los datos principales del curso
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                        Nombre del curso <span style={{ color: '#DC2626' }}>*</span>
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
                        placeholder="Ej: Diseño UX/UI Avanzado"
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
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:border-blue-400 resize-none"
                        style={{ 
                          borderColor: '#E5E7EB',
                          backgroundColor: '#FAFAFA',
                          color: '#223740',
                          fontSize: '15px'
                        }}
                        placeholder="Describe de qué trata el curso y qué aprenderán los estudiantes..."
                      />
                      {errors.description && (
                        <p className="mt-2 text-sm font-medium" style={{ color: '#DC2626' }}>
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Category + Level */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                          Categoría <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <select
                          {...register('category')}
                          className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:border-blue-400 appearance-none cursor-pointer"
                          style={{ 
                            borderColor: '#E5E7EB',
                            backgroundColor: '#FAFAFA',
                            color: '#223740',
                            fontSize: '15px'
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="programming">Programación</option>
                          <option value="design">Diseño</option>
                          <option value="marketing">Marketing</option>
                          <option value="data">Datos</option>
                        </select>
                        {errors.category && (
                          <p className="mt-2 text-sm font-medium" style={{ color: '#DC2626' }}>
                            {errors.category.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                          Nivel
                        </label>
                        <select
                          {...register('level')}
                          className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:border-blue-400 appearance-none cursor-pointer"
                          style={{ 
                            borderColor: '#E5E7EB',
                            backgroundColor: '#FAFAFA',
                            color: '#223740',
                            fontSize: '15px'
                          }}
                        >
                          <option value="beginner">Principiante</option>
                          <option value="intermediate">Intermedio</option>
                          <option value="advanced">Avanzado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Columna derecha */}
              <div className="space-y-6">
                {/* Sección de instructores */}
                <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow" style={{ 
                  borderColor: '#E5E7EB',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                        <Users className="w-5 h-5" style={{ color: '#5A878C' }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: '#223740' }}>
                          Docentes Asignados
                        </h2>
                        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                          Agrega los instructores del curso
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#223740' }}>
                      Nombres de los docentes
                    </label>
                    <div 
                      className="flex flex-wrap items-center gap-2 p-4 border-2 border-dashed rounded-lg min-h-[80px] transition-all hover:border-blue-300"
                      style={{ 
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FAFAFA'
                      }}
                    >
                      {instructorTags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                          style={{ 
                            backgroundColor: '#AEEBF2', 
                            color: '#5A878C' 
                          }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeInstructor(tag)}
                            className="ml-1 hover:opacity-70 transition-opacity rounded-full p-1 hover:bg-red-100"
                            aria-label={`Remove instructor: ${tag}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <input
                        value={instructorInput}
                        onChange={(e) => setInstructorInput(e.target.value)}
                        onKeyDown={handleInstructorKeyDown}
                        placeholder="Escribe un nombre y presiona Enter..."
                        className="flex-1 min-w-[200px] bg-transparent outline-none text-sm py-1"
                        style={{ 
                          color: '#223740',
                          fontSize: '15px'
                        }}
                      />
                    </div>
                    {instructorTags.length === 0 && (
                      <p className="mt-2 text-sm font-medium" style={{ color: '#DC2626' }}>
                        Debes agregar al menos un docente para continuar
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado de publicación */}
                <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow" style={{ 
                  borderColor: '#E5E7EB',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#AEEBF2' }}>
                        <Target className="w-5 h-5" style={{ color: '#5A878C' }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: '#223740' }}>
                          Estado de Publicación
                        </h2>
                        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                          Define la visibilidad del curso
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    { [
                      { value: 'inactive', label: 'Inactivo', desc: 'No visible para estudiantes', icon: '📝' },
                      { value: 'active', label: 'Activo', desc: 'Visible para estudiantes', icon: '🚀' }
                    ].map((option) => (
                      <label key={option.value} className="relative cursor-pointer group">
                        <input
                          {...register('status')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <div
                          className={`p-4 border-2 rounded-lg transition-all cursor-pointer group-hover:shadow-md ${
                            watchedStatus === option.value
                              ? 'border-blue-500 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: watchedStatus === option.value 
                              ? '#AEEBF2'
                              : '#FFFFFF',
                            borderColor: watchedStatus === option.value 
                              ? '#5A878C'
                              : '#E5E7EB'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                              watchedStatus === option.value
                                ? 'border-blue-500 bg-blue-500 scale-110'
                                : 'border-gray-300 bg-white'
                            }`}
                            style={{
                              borderColor: watchedStatus === option.value 
                                ? '#5A878C'
                                : '#E5E7EB',
                              backgroundColor: watchedStatus === option.value 
                                ? '#5A878C'
                                : '#FFFFFF'
                            }}
                            >
                              {watchedStatus === option.value && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{option.icon}</span>
                                <div className="text-base font-bold" style={{ color: '#223740' }}>{option.label}</div>
                              </div>
                              <div className="text-sm" style={{ color: '#6B7280' }}>{option.desc}</div>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-6 pt-8 lg:col-span-2">
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