import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Loader, Play, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import {studentService} from "../services/studentService.ts";

// Interfaz basada en el JSON que configuramos en el backend
export interface CursoInscritoBackend {
    id_inscripcion: string
    inscripcion_fecha_inicio: string
    inscripcion_fecha_finalizacion: string | null
    id_curso: string
    id_creador_curso: string
    titulo: string
    descripcion: string
    curso_activo: boolean
    curso_creacion: string
    porcentaje_progreso: string
    contenidos_completados: number
    modulos_total: number
    completado: boolean
    aprobado: boolean
    thumbnail?: string // Opcional, por si a futuro le agregas imagen a los cursos
}

/* ═══════════════════════════════════════════════════════════════════
   Página: Mis Cursos
══════════════════════════════════════════════════════════════════════ */
export function MisCursosPage() {
    const navigate = useNavigate()
    const [misCursos, setMisCursos] = useState<CursoInscritoBackend[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const getCurrentUserId = (): string | null => {
        const userData = localStorage.getItem('user')
        if (!userData) return null
        try {
            const parsedUser = JSON.parse(userData)
            return parsedUser.id || parsedUser.idUsuario || null
        } catch {
            return null
        }
    }

    const loadMisCursos = async () => {
        setIsLoading(true)
        try {
            const userId = getCurrentUserId()
            if (!userId) {
                console.error("No se encontró el ID del usuario")
                return
            }

            const response = await studentService.getMisCursosInscritos(userId)
            setMisCursos(response)

        } catch (error) {
            console.error('Error cargando mis cursos:', error)
            setMisCursos([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadMisCursos()
    }, [])

    // 👇 NUEVO: Función inteligente para decidir a dónde ir al hacer clic
    const handleCourseClick = (curso: CursoInscritoBackend) => {
        const progreso = parseFloat(curso.porcentaje_progreso || '0')
        const isCompleted = progreso >= 100 || curso.completado

        if (isCompleted) {
            // Si es 100%, vamos a la página de certificados
            navigate('/student/grades')
        } else {
            // Si es menor a 100%, vamos al contenido del curso
            navigate(`/student/courses/${curso.id_curso}`)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-6">
                <div className="flex flex-col items-center gap-3">
                    <Loader size={32} className="animate-spin text-secondary" />
                    <p className="text-sm text-secondary font-medium">Cargando tus cursos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-6 md:px-8 py-6 md:py-10 space-y-8 max-w-6xl mx-auto">
            {/* 👇 MODIFICADO: Header con el botón "Ir al Dashboard" 👇 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-mid/20 pb-5">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Mis Cursos</h1>
                    <p className="text-secondary text-sm md:text-base">
                        Continúa tu aprendizaje y revisa tu progreso en los cursos en los que estás inscrito.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full
                               bg-secondary/10 text-secondary text-sm font-bold
                               hover:bg-secondary hover:text-white cursor-pointer
                               transition-all duration-300 shadow-sm w-fit"
                >
                    <ArrowLeft size={16} />
                    Ir al Dashboard
                </button>
            </div>

            {/* Empty State */}
            {misCursos.length === 0 ? (
                <div className="bg-surface border border-mid/20 rounded-2xl p-10 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <GraduationCap size={32} className="text-primary/50" />
                    </div>
                    <h3 className="text-xl font-bold text-primary">Aún no tienes cursos</h3>
                    <p className="text-secondary text-sm max-w-md">
                        Explora nuestro catálogo e inscríbete en tu primer curso para comenzar a aprender.
                    </p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-tertiary font-semibold hover:bg-secondary transition-all"
                    >
                        Explorar catálogo
                    </button>
                </div>
            ) : (
                /* Grid de Cursos Inscritos */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {misCursos.map((curso) => (
                        <EnrolledCourseCard
                            key={curso.id_inscripcion}
                            course={curso}
                            // Pasamos el curso entero a la función inteligente
                            onClick={() => handleCourseClick(curso)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/* ── Tarjeta para Curso ya Inscrito ─────────────────────────────── */
function EnrolledCourseCard({
                                course,
                                onClick,
                            }: {
    course: CursoInscritoBackend
    onClick: () => void
}) {
    // Parseamos el string del backend a número
    const progreso = parseFloat(course.porcentaje_progreso || '0')
    const isCompleted = progreso >= 100 || course.completado

    // 👇 NUEVO: Lógica dinámica para el texto del botón 👇
    let buttonText = 'Iniciar curso'
    if (isCompleted) {
        buttonText = 'Ir a certificados'
    } else if (progreso > 0) {
        buttonText = 'Continuar curso'
    }

    return (
        <div
            onClick={onClick}
            className="bg-surface rounded-2xl overflow-hidden border border-mid/20
                 flex flex-col text-left hover:shadow-lg transition-all duration-300 w-full cursor-pointer group"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-primary/5">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <GraduationCap size={40} className="text-primary/30" />
                    </div>
                )}

                {/* Badge de estado flotante */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1
                        rounded-full bg-white/95 backdrop-blur-sm shadow-sm
                        text-[11px] font-bold">
                    {isCompleted ? (
                        <>
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="text-green-700">Completado</span>
                        </>
                    ) : (
                        <>
                            <Play size={12} className="text-secondary" />
                            <span className="text-secondary">En curso</span>
                        </>
                    )}
                </div>
            </div>

            {/* Cuerpo de la tarjeta */}
            <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-base text-primary line-clamp-2 leading-tight">
                    {course.titulo}
                </h3>
                <p className="text-xs text-secondary line-clamp-2 mb-2">
                    {course.descripcion || 'Sin descripción disponible'}
                </p>

                {/* Footer interactivo (Progreso + Botón) */}
                <div className="mt-auto flex flex-col gap-4 pt-3 border-t border-mid/10">

                    {/* Barra de Progreso */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                                Progreso
                            </span>
                            <span className="text-xs font-bold text-primary">
                                {progreso}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-mid/20 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    isCompleted ? 'bg-green-500' : 'bg-secondary'
                                }`}
                                style={{ width: `${progreso}%` }}
                            />
                        </div>
                    </div>

                    {/* 👇 MODIFICADO: Botón de Acción con texto dinámico 👇 */}
                    <button
                        className={`w-full py-2.5 px-3 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                            isCompleted
                                ? 'bg-primary hover:bg-primary/90'
                                : 'bg-secondary hover:bg-secondary/90'
                        }`}
                    >
                        {buttonText}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}