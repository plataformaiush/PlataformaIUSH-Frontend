import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Loader, Play, CheckCircle, ArrowRight, ArrowLeft, Trash2, AlertTriangle, X } from 'lucide-react'
import { studentService, type CursoInscritoBackend } from '../services/studentService'
import { useStudentProgressStore } from '../../../stores/studentProgressStore'
import { AuthImage } from '../components/AuthImage'

/* ═══════════════════════════════════════════════════════════════════
   Página: Mis Cursos
══════════════════════════════════════════════════════════════════════ */
export function MisCursosPage() {
    const navigate = useNavigate()
    const unenrollCourse = useStudentProgressStore(s => s.unenrollCourse)
    const [misCursos, setMisCursos] = useState<CursoInscritoBackend[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [courseToDelete, setCourseToDelete] = useState<{ idInscripcion: string, idCurso: string, titulo: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

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
            if (!userId) return

            // El endpoint de inscripciones no devuelve idImagen; lo cruzamos con el catálogo
            // (1 sola petición extra) para obtener el UUID de la imagen por curso.
            const [response, allCursos] = await Promise.all([
                studentService.getMisCursosInscritos(userId),
                studentService.getAllCursos().catch(() => []),
            ])

            const idImagenByCurso = new Map<string, string>()
            for (const curso of allCursos as any[]) {
                const idImagen = curso?.idImagen ?? curso?.id_imagen
                const idCurso  = curso?.idCurso  ?? curso?.id_curso
                if (idImagen && idCurso) {
                    idImagenByCurso.set(String(idCurso), idImagen)
                }
            }

            const withImages = response.map((curso) => {
                if (curso.thumbnail) return curso
                const idImagen = idImagenByCurso.get(String(curso.id_curso))
                const url = studentService.getImagenUrl(idImagen)
                return url ? { ...curso, thumbnail: url } : curso
            })

            const sorted = [...withImages].sort((a, b) => {
                const pa = parseFloat(a.porcentaje_progreso || '0')
                const pb = parseFloat(b.porcentaje_progreso || '0')
                const aComplete = pa >= 100
                const bComplete = pb >= 100
                if (aComplete !== bComplete) return aComplete ? 1 : -1
                return pb - pa
            })
            setMisCursos(sorted)
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

    const handleCourseClick = (curso: CursoInscritoBackend) => {
        const progreso = parseFloat(curso.porcentaje_progreso || '0')
        const isCompleted = progreso >= 100

        if (isCompleted) {
            navigate('/student/grades')
        } else {
            navigate(`/student/courses/${curso.id_curso}`)
        }
    }

    const handleDeleteClick = (idInscripcion: string, idCurso: string, tituloCurso: string) => {
        setCourseToDelete({ idInscripcion, idCurso, titulo: tituloCurso })
    }

    const confirmDeletion = async () => {
        if (!courseToDelete) return

        setIsDeleting(true)
        try {
            await studentService.eliminarInscripcion(courseToDelete.idInscripcion)
            unenrollCourse(courseToDelete.idCurso)
            setCourseToDelete(null)
            navigate('/student/dashboard')
        } catch (error) {
            console.error('Error eliminando inscripción:', error)
            window.alert('Hubo un error al intentar eliminar la inscripción. Por favor intenta de nuevo.')
        } finally {
            setIsDeleting(false)
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
        <>
            <div className="w-full px-6 md:px-8 py-6 md:py-10 space-y-8 max-w-6xl mx-auto relative">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {misCursos.map((curso) => (
                            <EnrolledCourseCard
                                key={curso.id_inscripcion}
                                course={curso}
                                onClick={() => handleCourseClick(curso)}
                                // Conectamos el botón de la tarjeta con la función que abre el modal
                                onDelete={() => handleDeleteClick(curso.id_inscripcion, curso.id_curso, curso.titulo)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-mid/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                        {/* Cabecera del modal */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                                    <AlertTriangle size={20} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-primary">Eliminar inscripción</h3>
                            </div>
                            <button
                                onClick={() => setCourseToDelete(null)}
                                className="text-secondary hover:text-primary transition-colors mt-1"
                                disabled={isDeleting}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mensaje de advertencia */}
                        <p className="text-secondary text-sm mb-2 leading-relaxed">
                            ¿Estás seguro que deseas darte de baja del curso: <span className="font-bold text-primary">"{courseToDelete.titulo}"</span>?
                        </p>
                        <p className="text-red-500/90 text-sm mb-6 leading-relaxed font-medium">
                            ⚠️ Esta acción no se puede deshacer y perderás todo tu progreso actual.
                        </p>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 mt-auto">
                            <button
                                onClick={() => setCourseToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-secondary hover:bg-mid/10 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeletion}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isDeleting && (
                                    <Loader size={16} className="animate-spin" />
                                )}
                                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

/* ── Tarjeta para Curso ya Inscrito ─────────────────────────────── */
function EnrolledCourseCard({
                                course,
                                onClick,
                                onDelete,
                            }: {
    course: CursoInscritoBackend
    onClick: () => void
    onDelete: () => void
}) {
    const progreso = parseFloat(course.porcentaje_progreso || '0')
    const isCompleted = progreso >= 100

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
                 flex flex-col text-left hover:shadow-lg transition-all duration-300 w-full cursor-pointer group relative"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-primary/5">
                <AuthImage
                    src={course.thumbnail}
                    alt={course.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallback={
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-colors">
                            <GraduationCap size={40} className="text-primary/30" />
                        </div>
                    }
                />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1
                        rounded-full bg-white/95 backdrop-blur-sm shadow-sm
                        text-[11px] font-bold z-10">
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

                {/* Botón de eliminar */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-red-500
                               hover:bg-red-500 hover:text-white transition-colors shadow-sm z-10 opacity-0 group-hover:opacity-100"
                    title="Eliminar inscripción"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-base text-primary line-clamp-2 leading-tight">
                    {course.titulo}
                </h3>
                <p className="text-xs text-secondary line-clamp-2 mb-2">
                    {course.descripcion || 'Sin descripción disponible'}
                </p>

                <div className="mt-auto flex flex-col gap-4 pt-3 border-t border-mid/10">
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