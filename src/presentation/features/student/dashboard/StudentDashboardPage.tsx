import {useMemo, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    ArrowRight, Target, Trophy,
    Play, GraduationCap, CheckCircle2, Loader,
} from 'lucide-react'
import {EmptyCoursesState} from './components/EmptyCoursesState'
import {studentService, type MisCursos} from '../services/studentService'

const STREAK_DAYS = 14
const WEEKLY_DONE = 4
const WEEKLY_TOTAL = 5
const CIRC = 2 * Math.PI * 40   // ≈ 251.3

type CourseStatus = 'locked' | 'progress' | 'approved'

interface EnrichedCourse extends MisCursos {
    displayTitle: string
    displayDescription: string
}

function statusOf(progress: number): CourseStatus {
    if (progress === 0) return 'locked'
    if (progress === 100) return 'approved'
    return 'progress'
}

/* ═══════════════════════════════════════════════════════════════════
   Página principal
══════════════════════════════════════════════════════════════════════ */
export function StudentDashboardPage() {
    const navigate = useNavigate()

    const [studentName, setStudentName] = useState<string>('Estudiante')
    const [enrichedCourses, setEnrichedCourses] = useState<EnrichedCourse[]>([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(false)

    // Obtener nombre del estudiante desde localStorage
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

    // Cargar todos los cursos desde la API
    useEffect(() => {
        const loadCourses = async () => {
            setIsLoadingCourses(true)
            try {
                const cursos = await studentService.getAllCursos()

                const normalizedCourses = cursos.map((curso) => ({
                    ...curso,
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

        loadCourses()
    }, [])

    // Solo usamos los cursos provenientes de la base de datos
    const courses = enrichedCourses

    const hasEnrolled = courses.length > 0

    const inProgress = useMemo(() =>
            [...courses]
                .filter(c => c.porcentajeProgreso > 0 && c.porcentajeProgreso < 100)
                .sort((a, b) => b.porcentajeProgreso - a.porcentajeProgreso)[0] ?? null
        , [courses])

    const goToCourse = (id: string) => navigate(`/student/curso/${id}`)

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
            <div className="px-6 md:px-8 py-6 md:py-8">
                {/*
                  Como ya no usamos el store global para datos falsos,
                  aquí deberías redirigir a un catálogo o llamar a tu API real de matriculación.
                */}
                <EmptyCoursesState onEnroll={() => console.log("Aquí debes implementar la lógica hacia la API para matricular un curso")} />
            </div>
        )
    }

    return (
        <div className="w-full px-6 md:px-8 py-4 md:py-6 space-y-6 max-w-6xl mx-auto">

            {/* Fila 1: Hero + Weekly Goal */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                <HeroBanner
                    name={studentName}
                    streak={STREAK_DAYS}
                    courseName={inProgress?.displayTitle ?? null}
                    onContinue={() => inProgress && goToCourse(inProgress.idCurso)}
                />
                <WeeklyGoalCard done={WEEKLY_DONE} total={WEEKLY_TOTAL}/>
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
                onCourseClick={goToCourse}
            />
        </div>
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
        <div className="rounded-2xl p-8 lg:p-10 flex flex-col gap-5 min-h-[260px]"
             style={{background: 'linear-gradient(135deg, #162830 0%, #223740 55%, #2d5e68 100%)'}}>
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
                className="flex items-center gap-2 min-h-[44px] px-6 rounded-xl mt-auto w-fit
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
function WeeklyGoalCard({done, total}: { done: number; total: number }) {
    const dash = (done / total) * CIRC

    return (
        <div className="bg-surface rounded-2xl border border-mid/20 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-primary">Meta semanal</h2>
                <Target size={18} className="text-secondary"/>
            </div>

            {/* Anillo SVG */}
            <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 104 104" className="w-32 h-32">
                    <circle cx="52" cy="52" r="40" fill="none"
                            stroke="currentColor" strokeWidth="8"
                            className="text-mid/25"/>
                    <circle cx="52" cy="52" r="40" fill="none"
                            stroke="currentColor" strokeWidth="8"
                            strokeLinecap="round"
                            className="text-primary transition-all duration-700"
                            style={{
                                strokeDasharray: `${dash} ${CIRC}`,
                                transform: 'rotate(-90deg)',
                                transformOrigin: '52px 52px',
                            }}/>
                </svg>
                <div className="absolute flex flex-col items-center pointer-events-none">
                    <span className="text-2xl font-black text-primary leading-none">{done}/{total}</span>
                    <span className="text-xs text-secondary mt-0.5">Módulos</span>
                </div>
            </div>

            {/* Sub-card motivacional */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted">
                <Trophy size={20} className="text-secondary shrink-0"/>
                <div>
                    <p className="text-sm font-bold text-primary">¡Casi lo logras!</p>
                    <p className="text-xs text-secondary">
                        Te {total - done === 1 ? 'falta' : 'faltan'} {total - done} módulo{total - done !== 1 ? 's' : ''} para
                        tu meta.
                    </p>
                </div>
            </div>
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
                                 onCourseClick,
                             }: {
    courses: EnrichedCourse[]
    onCourseClick: (id: string) => void
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Tu ruta de aprendizaje</h2>
                <button className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
                    Ver todos
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                    <CourseGridCard
                        key={course.idCurso}
                        course={course}
                        onClick={() => onCourseClick(course.idCurso)}
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
                        }: {
    course: EnrichedCourse
    onClick: () => void
}) {
    const status = statusOf(course.porcentajeProgreso)

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

                {/* Footer estado con botones dinámicos */}
                <div className="flex flex-col gap-2 mt-auto pt-3">
                    {status === 'locked' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick()
                            }}
                            className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-white
                                     bg-mid hover:bg-mid/90 transition-colors"
                        >
                            Empezar curso
                        </button>
                    )}
                    {status === 'progress' && (
                        <>
                            <div className="w-full">
                                <p className="text-[11px] font-semibold text-secondary mb-1">{course.porcentajeProgreso}%</p>
                                <div className="h-1.5 rounded-full bg-mid/25 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-secondary transition-all duration-700"
                                        style={{width: `${course.porcentajeProgreso}%`}}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onClick()
                                }}
                                className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-white
                                         bg-secondary hover:bg-secondary/90 transition-colors"
                            >
                                Continuar viendo
                            </button>
                        </>
                    )}
                    {status === 'approved' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick()
                            }}
                            className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-white
                                     bg-secondary hover:bg-secondary/90 transition-colors
                                     flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Ver certificado
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}