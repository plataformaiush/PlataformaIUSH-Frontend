import {useMemo, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    ArrowRight,
    Play, GraduationCap, Loader, Award, X
} from 'lucide-react'
// ...existing code... (EmptyCoursesState removed on purpose)
import {studentService, type MisCursos} from '../services/studentService'
import { trackIniciarCurso } from '../../reports/events/TagManagerEvents'

const STREAK_DAYS = 14

interface EnrichedCourse extends MisCursos {
    displayTitle: string
    displayDescription: string
}

// statusOf removed: dashboard view no longer relies on course progress/status

/* ═══════════════════════════════════════════════════════════════════
   Página principal
══════════════════════════════════════════════════════════════════════ */
export function StudentDashboardPage() {
    const navigate = useNavigate()

    const [studentName, setStudentName] = useState<string>('Estudiante')
    const [enrichedCourses, setEnrichedCourses] = useState<EnrichedCourse[]>([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(false)
    const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)

    // NUEVO: Estado para controlar el modal de confirmación
    const [courseToEnroll, setCourseToEnroll] = useState<EnrichedCourse | null>(null)

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

    const loadCourses = async () => {
        setIsLoadingCourses(true)
        try {
            const cursos = await studentService.getAllCursos()
            const userId = getCurrentUserId()

            const normalizeId = (value: unknown) => (value == null ? '' : String(value))

            const filtered = cursos.filter((c: any) => {
                const courseOwnerId = c.idUsuario ?? c.id_usuario ?? c.usuarioId
                const isNotCreatedByUser = !userId || normalizeId(courseOwnerId) !== normalizeId(userId)
                const isActive = c.activo === undefined || c.activo === null || c.activo === true || c.activo === 1 || c.activo === '1' || c.activo === 'true'
                return isNotCreatedByUser && isActive
            })

            const normalizedCourses = filtered.map((curso: any) => ({
                idCurso: curso.idCurso,
                titulo: curso.titulo,
                descripcion: curso.descripcion,
                thumbnail: (curso as any).thumbnail || undefined,
                modulosTotal: curso.modulosCount ?? 0,
                modulosCompletados: 0,
                porcentajeProgreso: 0,
                displayTitle: curso.titulo,
                displayDescription: curso.descripcion || 'Sin descripción disponible',
            }))

            setEnrichedCourses(normalizedCourses)
        } catch (err) {
            console.error('Error loading courses:', err)
            setEnrichedCourses([])
        } finally {
            setIsLoadingCourses(false)
        }
    }

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user = JSON.parse(userData)
                setStudentName(user.nombre || user.name || 'Estudiante')
            } catch (e) {
                console.error('Error parsing user from localStorage:', e)
            }
        }
    }, [])

    useEffect(() => {
        loadCourses()
    }, [])

    const courses = enrichedCourses
    const hasEnrolled = courses.length > 0

    const inProgress = useMemo(() =>
            [...courses]
                .filter(c => c.porcentajeProgreso > 0 && c.porcentajeProgreso < 100)
                .sort((a, b) => b.porcentajeProgreso - a.porcentajeProgreso)[0] ?? null
        , [courses])

    const goToCourse = (id: string) => navigate(`/student/courses/${id}`)

    // NUEVO: Función que ejecuta la inscripción tras confirmar
    const executeEnrollment = async () => {
        if (!courseToEnroll) return;

        const userId = getCurrentUserId()
        if (!userId) {
            window.alert('No fue posible identificar el usuario autenticado.')
            return
        }

        const courseId = courseToEnroll.idCurso;
        setEnrollingCourseId(courseId)

        try {
            const validation = await studentService.validarInscripcion(courseId, userId)

            if (!validation.enrolled) {
                await studentService.inscribirCurso({
                    idCurso: courseId,
                    idUsuario: userId,
                    fechaInicio: new Date().toISOString(),
                })
            }

            // Cerramos el modal y navegamos
            setCourseToEnroll(null)
            trackIniciarCurso(courseToEnroll.titulo) //Trackeamos la función de iniciar curso
            goToCourse(courseId)
        } catch (error) {
            console.error('Error al validar/crear inscripción:', error)
            window.alert('No se pudo completar la inscripción. Inténtalo de nuevo.')
        } finally {
            setEnrollingCourseId(null)
        }
    }

    if (isLoadingCourses) {
        return (
            <div className="flex items-center justify-center px-6 md:px-8 py-16 md:py-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader size={32} className="animate-spin text-secondary"/>
                    <p className="text-sm text-secondary">Cargando tus cursos...</p>
                </div>
            </div>
        )
    }

    if (!hasEnrolled) {
        return (
            <div className="px-6 md:px-8 py-6 md:py-8 text-center">
                <p className="text-secondary mb-4">No hay cursos disponibles para mostrar.</p>
                <button
                    onClick={loadCourses}
                    className="inline-flex items-center gap-2.5 min-h-10 px-6 rounded-lg bg-primary text-tertiary font-semibold hover:bg-secondary transition-all"
                >
                    Actualizar
                </button>
            </div>
        )
    }

    return (
        <>
            <div className="w-full px-6 md:px-8 py-4 md:py-6 space-y-6 max-w-6xl mx-auto relative">
                {/* Fila 1: Hero + Certificados */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                    <HeroBanner
                        name={studentName}
                        streak={STREAK_DAYS}
                        courseName={inProgress?.displayTitle ?? null}
                        onContinue={() => inProgress && goToCourse(inProgress.idCurso)}
                    />
                    <CertificatesCard onNavigate={() => navigate('/grades')}/>
                </div>

                {/* Fila 2: In Progress + Up Next */}
                {inProgress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InProgressCard
                            course={inProgress}
                            onClick={() => goToCourse(inProgress.idCurso)}
                        />
                        <UpNextCard onClick={() => goToCourse(inProgress.idCurso)}/>
                    </div>
                )}

                {/* Fila 3: Your Learning Path */}
                <LearningPathSection
                    courses={courses}
                    // MODIFICADO: Ahora pasamos el curso completo al modal en lugar de inscribir de inmediato
                    onEnrollRequest={(course) => setCourseToEnroll(course)}
                    enrollingCourseId={enrollingCourseId}
                    onViewMisCursos={() => navigate('/student/mis-cursos')}
                />
            </div>

            {/* NUEVO: Modal de Confirmación */}
            {courseToEnroll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-mid/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-primary">Confirmar inscripción</h3>
                            <button
                                onClick={() => setCourseToEnroll(null)}
                                className="text-secondary hover:text-primary transition-colors"
                                disabled={enrollingCourseId === courseToEnroll.idCurso}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-secondary text-sm mb-6 leading-relaxed">
                            ¿Seguro que te vas a inscribir al curso: <span className="font-bold text-primary">{courseToEnroll.displayTitle}</span>?
                        </p>

                        <div className="flex justify-end gap-3 mt-auto">
                            <button
                                onClick={() => setCourseToEnroll(null)}
                                disabled={enrollingCourseId === courseToEnroll.idCurso}
                                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-secondary hover:bg-mid/10 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeEnrollment}
                                disabled={enrollingCourseId === courseToEnroll.idCurso}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-secondary hover:bg-secondary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {enrollingCourseId === courseToEnroll.idCurso && (
                                    <Loader size={16} className="animate-spin" />
                                )}
                                {enrollingCourseId === courseToEnroll.idCurso ? 'Inscribiendo...' : 'Sí, inscribirme'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

/* ── Hero Banner ────────────────────────────────────────────────── */
interface HeroBannerProps {
    name: string
    streak: number
    courseName: string | null
    onContinue: () => void
}

function HeroBanner({name, streak, courseName, onContinue}: HeroBannerProps) {
    return (
        <div className="rounded-2xl p-8 lg:p-10 flex flex-col gap-5 min-h-65
                        bg-gradient-to-br from-primary to-secondary">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      bg-white/15 text-white text-xs font-semibold w-fit">
                🔥 ¡{streak} días seguidos!
            </div>

            <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1]">
                    Bienvenida,<br/>{name}.
                </h1>
                <p className="text-sm lg:text-base text-white/70 leading-relaxed mt-3 max-w-md">
                    {courseName
                        ? `Estás progresando muy bien en '${courseName}'. ¿Lista para continuar?`
                        : 'Explora tus cursos y sigue aprendiendo hoy.'}
                </p>
            </div>

            <button
                onClick={onContinue}
                className="flex items-center gap-2 min-h-11 px-6 rounded-xl mt-auto w-fit
                   border-2 border-white text-white font-semibold text-sm
                   hover:bg-white hover:text-primary transition-all duration-200"
            >
                Continuar aprendiendo
                <ArrowRight size={16}/>
            </button>
        </div>
    )
}

/* ── Weekly Goal ────────────────────────────────────────────────── */
function CertificatesCard({onNavigate}: {onNavigate: () => void}) {
    return (
        <div className="bg-surface rounded-2xl border border-mid/20 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-primary">Mis certificados</h2>
                <Award size={18} className="text-secondary"/>
            </div>

            {/* Ícono decorativo */}
            <div className="flex justify-center py-4">
                <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center">
                    <Award size={32} className="text-secondary"/>
                </div>
            </div>

            {/* Texto motivacional */}
            <div className="text-center">
                <p className="text-sm font-semibold text-primary mb-1">
                    Tus logros certificados
                </p>
                <p className="text-xs text-secondary">
                    Visualiza y descarga todos tus certificados completados.
                </p>
            </div>

            {/* Botón */}
            <button
                onClick={onNavigate}
                className="w-full py-2 px-4 rounded-lg bg-secondary text-white font-semibold text-sm
                         hover:bg-secondary/90 transition-colors mt-2"
            >
                Ver certificados
            </button>
        </div>
    )
}

/* ── In Progress Card ───────────────────────────────────────────── */
function InProgressCard({
                            course,
                            onClick,
                        }: {
    course: EnrichedCourse
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className="bg-surface rounded-2xl border border-mid/20 p-5 flex flex-col gap-3
                 text-left hover:shadow-md transition-all duration-200 w-full"
        >
      <span className="inline-flex items-center px-3 py-1 rounded-full
                       bg-secondary/15 text-secondary text-xs font-semibold w-fit">
        En progreso
      </span>

            <h3 className="text-xl font-bold text-primary leading-snug">{course.displayTitle}</h3>
            <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                {course.displayDescription || 'Domina los conceptos y herramientas para avanzar en tu carrera profesional.'}
            </p>

            <div className="mt-auto">
                <div className="flex justify-between items-center text-xs font-medium text-secondary mb-1.5">
                    <span>Progreso</span>
                    <span>{course.porcentajeProgreso}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-mid/25 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-secondary transition-all duration-700"
                        style={{width: `${course.porcentajeProgreso}%`}}
                    />
                </div>
            </div>
        </button>
    )
}

/* ── Up Next Card ───────────────────────────────────────────────── */
function UpNextCard({onClick}: { onClick: () => void }) {
    return (
        <div className="bg-surface rounded-2xl border border-mid/20 p-5 flex items-center gap-4">
            {/* Thumbnail izquierdo — fondo teal claro */}
            <div className="w-14 h-14 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                <Play size={20} className="text-secondary ml-0.5"/>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Siguiente</p>
                <p className="text-sm font-bold text-primary truncate mt-0.5">
                    Implementando la regla del "No-Line"
                </p>
                <p className="text-xs text-mid mt-0.5">Video · 12 min restantes</p>
            </div>

            {/* Botón play derecho — fondo oscuro */}
            <button
                onClick={onClick}
                className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center
                   shrink-0 hover:bg-secondary transition-colors"
                aria-label="Reproducir"
            >
                <Play size={18} className="text-tertiary ml-0.5"/>
            </button>
        </div>
    )
}

/* ── Learning Path Section ──────────────────────────────────────── */
function LearningPathSection({
                                 courses,
                                 onEnrollRequest,
                                 enrollingCourseId,
                                 onViewMisCursos
                              }: {
    courses: EnrichedCourse[]
    onEnrollRequest: (course: EnrichedCourse) => void
    enrollingCourseId: string | null
    onViewMisCursos: () => void
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Catálogo de cursos</h2>
                <button
                    onClick={onViewMisCursos}
                    className="flex items-center gap-2 px-4 py-2 rounded-full
                               bg-secondary/10 text-secondary text-sm font-bold
                               hover:bg-secondary hover:text-white cursor-pointer
                               transition-all duration-300 shadow-sm"
                >
                    Ir a Mis Cursos
                    <ArrowRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                    <CourseGridCard
                        key={course.idCurso}
                        course={course}
                        // CAMBIO AQUÍ: Ahora onClick lanza la solicitud del modal
                        onClick={() => onEnrollRequest(course)}
                        onEnroll={() => onEnrollRequest(course)}
                        isEnrolling={enrollingCourseId === course.idCurso}
                    />
                ))}
            </div>
        </section>
    )
}

/* ── Course Grid Card ───────────────────────────────────────────── */
function CourseGridCard({
                            course,
                            onClick,
                            onEnroll,
                            isEnrolling,
                        }: {
    course: EnrichedCourse
    onClick: () => void
    onEnroll: () => void
    isEnrolling: boolean
}) {
    return (
        <div
            onClick={onClick}
            className="bg-surface rounded-2xl overflow-hidden border border-mid/20
                 flex flex-col text-left hover:shadow-md transition-all duration-200 w-full cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-primary/10">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.displayTitle}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                        <GraduationCap size={32} className="text-primary/50" />
                    </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1
                        rounded-full bg-white/90 backdrop-blur-sm
                        text-[11px] font-semibold text-primary">
                    <GraduationCap size={12}/>
                    Curso
                </div>
            </div>

            {/* Cuerpo */}
            <div className="p-4 flex flex-col gap-1.5 flex-1">
                <p className="font-bold text-sm text-primary line-clamp-2 leading-snug">{course.displayTitle}</p>
                <p className="text-xs text-secondary line-clamp-2">{course.displayDescription}</p>

                {/* Footer: botón de inscripción */}
                <div className="flex flex-col gap-2 mt-auto pt-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEnroll()
                        }}
                        disabled={isEnrolling}
                        className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-white
                                     bg-secondary hover:bg-secondary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isEnrolling ? 'Procesando...' : 'Inscribirse'}
                    </button>
                </div>
            </div>
        </div>
    )
}
