import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    ArrowRight, Target, Trophy,
    Play, GraduationCap, Wrench, CheckCircle2,
} from 'lucide-react'
import {useStudentProgressStore} from '../../../stores/studentProgressStore'
import {EmptyCoursesState, DEMO_COURSES} from './components/EmptyCoursesState'

const STUDENT_NAME = 'Ana'
const STREAK_DAYS = 14
const WEEKLY_DONE = 4
const WEEKLY_TOTAL = 5
const CIRC = 2 * Math.PI * 40   // ≈ 251.3

type CourseType = 'Curso' | 'Taller'
type CourseStatus = 'locked' | 'progress' | 'approved'

interface CourseMeta {
    type: CourseType;
    instructor: string;
    module: string
}

const COURSE_META: Record<string, CourseMeta> = {
    '1': {type: 'Curso', instructor: 'Carlos Mendez', module: 'Módulo 3: Funciones'},
    '2': {type: 'Taller', instructor: 'Laura Ramírez', module: 'Módulo 5: Prototipado'},
    '3': {type: 'Curso', instructor: 'Diego Torres', module: 'Módulo 2: JOIN y GROUP BY'},
    '4': {type: 'Curso', instructor: 'Ana Martínez', module: 'Módulo 1: Fundamentos'},
    '5': {type: 'Taller', instructor: 'Paula Gómez', module: 'Módulo 4: Analíticas'},
    '6': {type: 'Curso', instructor: 'Sergio Ruiz', module: 'Módulo 3: Regresión'},
}

const DEFAULT_META: CourseMeta = {type: 'Curso', instructor: 'Instructor', module: 'Módulo 1'}

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
    const enrolledCourses = useStudentProgressStore(s => s.enrolledCourses)
    const progressMap = useStudentProgressStore(s => s.progress)
    const enrollCourses = useStudentProgressStore(s => s.enrollCourses)

    const hasEnrolled = enrolledCourses.length > 0 || Object.keys(progressMap).length > 0

    const courses = enrolledCourses.length > 0
        ? enrolledCourses
        : hasEnrolled ? DEMO_COURSES : []

    const inProgress = useMemo(() =>
            [...courses]
                .filter(c => c.progress > 0 && c.progress < 100)
                .sort((a, b) => b.progress - a.progress)[0] ?? null
        , [courses])

    const goToCourse = (id: string) => navigate(`/student/courses/${id}`)

    if (!hasEnrolled) {
        return (
            <div className="px-6 md:px-8 py-6 md:py-8">
                <EmptyCoursesState onEnroll={() => enrollCourses(DEMO_COURSES)}/>
            </div>
        )
    }

    return (
        <div className="w-full px-6 md:px-8 py-4 md:py-6 space-y-6 max-w-6xl mx-auto">

            {/* Fila 1: Hero + Weekly Goal */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                <HeroBanner
                    name={STUDENT_NAME}
                    streak={STREAK_DAYS}
                    courseName={inProgress?.title ?? null}
                    onContinue={() => inProgress && goToCourse(inProgress.id)}
                />
                <WeeklyGoalCard done={WEEKLY_DONE} total={WEEKLY_TOTAL}/>
            </div>

            {/* Fila 2: In Progress + Up Next */}
            {inProgress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InProgressCard
                        course={inProgress}
                        onClick={() => goToCourse(inProgress.id)}
                    />
                    <UpNextCard onClick={() => goToCourse(inProgress.id)}/>
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
             style={{background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 70%, black) 0%, var(--color-primary) 55%, color-mix(in srgb, var(--color-primary) 70%, white) 100%)'}}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      bg-white/15 text-white text-xs font-semibold w-fit">
                🔥 ¡{streak} días seguidos!
            </div>

       <div>
    <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.1]"
        style={{ color: 'var(--color-text-on-dark)' }}>
        Bienvenid@,<br/>{name}.
    </h1>
    <p className="text-sm lg:text-base leading-relaxed mt-3 max-w-md"
       style={{ color: 'var(--color-text-on-dark)', opacity: 0.7 }}>
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
    course: typeof DEMO_COURSES[0]
    onClick: () => void
}) {
    const meta = COURSE_META[course.id] ?? DEFAULT_META

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

            <h3 className="text-xl font-bold text-primary leading-snug">{course.title}</h3>
            <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                Domina los conceptos y herramientas para avanzar en tu carrera profesional.
            </p>

            <div className="mt-auto">
                <div className="flex justify-between items-center text-xs font-medium text-secondary mb-1.5">
                    <span>{meta.module}</span>
                    <span>{course.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-mid/25 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-secondary transition-all duration-700"
                        style={{width: `${course.progress}%`}}
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
    courses: typeof DEMO_COURSES
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
                        key={course.id}
                        course={course}
                        onClick={() => onCourseClick(course.id)}
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
    course: typeof DEMO_COURSES[0]
    onClick: () => void
}) {
    const meta = COURSE_META[course.id] ?? DEFAULT_META
    const status = statusOf(course.progress)

    return (
        <button
            onClick={onClick}
            className="bg-surface rounded-2xl overflow-hidden border border-mid/20
                 flex flex-col text-left hover:shadow-md transition-all duration-200 w-full"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-primary/10">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1
                        rounded-full bg-white/90 backdrop-blur-sm
                        text-[11px] font-semibold text-primary">
                    {meta.type === 'Taller' ? <Wrench size={12}/> : <GraduationCap size={12}/>}
                    {meta.type}
                </div>
            </div>

            {/* Cuerpo */}
            <div className="p-4 flex flex-col gap-1.5 flex-1">
                <p className="font-bold text-sm text-primary line-clamp-2 leading-snug">{course.title}</p>
                <p className="text-xs text-secondary">Instructor: {meta.instructor}</p>

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
                                <p className="text-[11px] font-semibold text-secondary mb-1">{course.progress}%</p>
                                <div className="h-1.5 rounded-full bg-mid/25 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-secondary transition-all duration-700"
                                        style={{width: `${course.progress}%`}}
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
        </button>
    )
}
