import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useParams, Link, useNavigate} from 'react-router-dom'
import {
    ArrowLeft, Check, Lock, Play,
    FileText, HelpCircle, Image as ImageIcon, Table,
} from 'lucide-react'

import { useStudentProgressStore } from '../../../stores/studentProgressStore'
import {studentService} from '../services/studentService'
import {ContentModal} from '../content-modal/ContentModal'
import { trackIniciarModulo, trackCursoCompletado, trackCertificadoObtenido } from '../../reports/events/TagManagerEvents'
import { CongratulationsModal } from './CongratulationsModal'
import type {
    Course,
    AnyContentData
} from '../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

/* ── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_COURSE: Course = {
    id: '1',
    title: 'Introducción a la Programación con Python',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80',
    modules: [
        {
            id: 'm1', title: 'Módulo 1: Fundamentos', order: 1,
            contents: [
                {id: 'c1', title: '¿Qué es Python?', order: 1, type: 'video'},
                {id: 'c2', title: 'Instalación y entorno', order: 2, type: 'text'},
                {id: 'c3', title: 'Tu primer programa', order: 3, type: 'video'},
                {id: 'c4', title: 'Variables y tipos', order: 4, type: 'text'},
                {id: 'c5', title: 'Quiz: Fundamentos', order: 5, type: 'quiz'},
            ],
        },
        {
            id: 'm2', title: 'Módulo 2: Control de Flujo', order: 2,
            contents: [
                {id: 'c6', title: 'Condicionales if/else', order: 1, type: 'video'},
                {id: 'c7', title: 'Bucles for y while', order: 2, type: 'video'},
                {id: 'c8', title: 'Funciones básicas', order: 3, type: 'text'},
                {id: 'c9', title: 'Quiz: Control de flujo', order: 4, type: 'quiz'},
            ],
        },
        {
            id: 'm3', title: 'Módulo 3: Estructuras de Datos', order: 3,
            contents: [
                {id: 'c10', title: 'Listas y tuplas', order: 1, type: 'video'},
                {id: 'c11', title: 'Diccionarios', order: 2, type: 'text'},
                {id: 'c12', title: 'Conjuntos', order: 3, type: 'image'},
                {id: 'c14', title: 'Guía de referencia PDF', order: 4, type: 'pdf'},
                {id: 'c15', title: 'Ejercicios en Excel', order: 5, type: 'xlsx'},
                {id: 'c13', title: 'Quiz: Estructuras', order: 6, type: 'quiz'},
            ],
        },
    ],
}

const MOCK_CONTENT_DETAIL: Record<string, AnyContentData> = {
    c1: {
        id: 'c1',
        title: '¿Qué es Python?',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 120,
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400'
    },
    c2: {
        id: 'c2',
        title: 'Instalación y entorno',
        type: 'text',
        body: '<h3>Instalación de Python</h3><p>Visita <strong>python.org</strong>, descarga e instala la versión más reciente.</p><p>Verifica con <code>python --version</code>.</p>'
    },
    c3: {
        id: 'c3',
        title: 'Tu primer programa',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 90
    },
    c4: {
        id: 'c4',
        title: 'Variables y tipos',
        type: 'text',
        body: '<h3>Variables en Python</h3><p>Se crean al asignarles un valor:</p><pre><code>nombre = "Ana"\nedad = 25</code></pre>'
    },
    c5: {
        id: 'c5', title: 'Quiz: Fundamentos', type: 'quiz',
        questions: [
            {
                id: 'q1',
                text: '¿Qué símbolo se usa para asignar un valor a una variable?',
                options: [{id: 'o1', text: '=='}, {id: 'o2', text: '='}, {id: 'o3', text: ':='}, {
                    id: 'o4',
                    text: '->'
                }],
                correctOptionId: 'o2'
            },
            {
                id: 'q2',
                text: '¿Cuál es un tipo de dato en Python?',
                options: [{id: 'o5', text: 'integer'}, {id: 'o6', text: 'int'}, {id: 'o7', text: 'number'}, {
                    id: 'o8',
                    text: 'num'
                }],
                correctOptionId: 'o6'
            },
            {
                id: 'q3',
                text: '¿Cómo se imprime "Hola mundo" en Python?',
                options: [{id: 'o9', text: 'echo(...)'}, {id: 'o10', text: 'console.log(...)'}, {
                    id: 'o11',
                    text: 'print(...)'
                }, {id: 'o12', text: 'printf(...)'}],
                correctOptionId: 'o11'
            },
        ],
    },
    c12: {
        id: 'c12',
        title: 'Conjuntos',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
        alt: 'Diagrama de conjuntos',
        caption: 'Representación visual de conjuntos y sus operaciones'
    },
    c14: {
        id: 'c14',
        title: 'Guía de referencia PDF',
        type: 'pdf',
        url: '/docs/guia-python.pdf',
        filename: 'guia-python.pdf'
    },
    c15: {
        id: 'c15',
        title: 'Ejercicios en Excel',
        type: 'xlsx',
        url: '/docs/ejercicios-estructuras.xlsx',
        filename: 'ejercicios-estructuras.xlsx'
    },
}

function getDefaultContent(id: string): AnyContentData {
    return MOCK_CONTENT_DETAIL[id] ?? {
        id,
        title: 'Contenido no disponible',
        type: 'text',
        body: '<p>Este contenido aún no está disponible.</p>'
    }
}

function getCurrentUserId(): string | null {
    const userData = localStorage.getItem('user')
    if (!userData) return null
    try {
        const parsedUser = JSON.parse(userData)
        return parsedUser.id || parsedUser.idUsuario || null
    } catch {
        return null
    }
}

function mapContentType(type: string): Course['modules'][number]['contents'][number]['type'] {
    if (type === 'texto') return 'text'
    if (type === 'imagen') return 'image'
    if (type === 'archivo') return 'pdf'
    return type as Course['modules'][number]['contents'][number]['type']
}

function isXlsx(url: string) {
    return /\.(xlsx|xls)(\?|$)/i.test(url)
}

function buildContentDetail(content: {
    idContenido: string
    titulo: string
    descripcion: string
    tipo: string
    url_o_texto?: string
    urlOTexto?: string
}): AnyContentData {
    const url = content.url_o_texto ?? content.urlOTexto ?? ''
    const type = mapContentType(content.tipo)

    switch (type) {
        case 'video':
            return { id: content.idContenido, title: content.titulo, type: 'video', url }
        case 'image':
            return {
                id: content.idContenido,
                title: content.titulo,
                type: 'image',
                url,
                alt: content.titulo,
                caption: content.descripcion || undefined,
            }
        case 'pdf':
            if (isXlsx(url)) {
                return { id: content.idContenido, title: content.titulo, type: 'xlsx', url }
            }
            return { id: content.idContenido, title: content.titulo, type: 'pdf', url }
        case 'quiz':
            return { id: content.idContenido, title: content.titulo, type: 'quiz', questions: [] }
        case 'text':
        default:
            return {
                id: content.idContenido,
                title: content.titulo,
                type: 'text',
                body: url || content.descripcion || 'Sin contenido disponible',
            }
    }
}

/* ── Colores por módulo ──────────────────────────────────────────────────── */
const MODULE_COLORS = ['#5A878C', '#059669', '#7C3AED']

/* ── Patrón de posición orgánica en desktop ─────────────────────────────── */
const LAYOUT_PATTERNS: [number, number][] = [
    [1, 9],
    [9, 1],
    [1, 4],
    [6, 1],
    [2, 5],
    [5, 1],
    [1, 5],
    [4, 1],
    [1, 3],
    [5, 2],
    [1, 7],
    [7, 1],
    [3, 5],
]

const VERTICAL_GAPS = [56, 44, 72, 48, 64, 40, 68, 52, 44, 60, 48, 72, 52]

/* ── Tipos ──────────────────────────────────────────────────────────────── */
type ContentStatus = 'completed' | 'current' | 'locked'

interface FlatItem {
    contentId: string
    contentTitle: string
    contentType: string
    moduleId: string
    moduleTitle: string
    moduleIndex: number
    indexInModule: number
    moduleLength: number
    isFirstInModule: boolean
    globalIndex: number
    status: ContentStatus
}

function computeContentStatuses(
    modules: typeof MOCK_COURSE.modules,
    completedIds: string[],
): ContentStatus[] {
    let currentAssigned = false
    return modules.flatMap(mod =>
        mod.contents.map(content => {
            if (currentAssigned) return 'locked'
            if (completedIds.includes(content.id)) return 'completed'
            currentAssigned = true
            return 'current'
        })
    )
}

/* ── Bug fix: conteo correcto de módulos ─────────────────────────────────── */
function computeModuleStatuses(
    modules: typeof MOCK_COURSE.modules,
    completedIds: string[],
): ModuleStatus[] {
    const result: ModuleStatus[] = []
    let currentAssigned = false
    for (const mod of modules) {
        const allDone = mod.contents.every(c => completedIds.includes(c.id))
        if (allDone) {
            result.push('completed')
        } else if (!currentAssigned) {
            result.push('current')
            currentAssigned = true
        } else {
            result.push('locked')
        }
    }
    return result
}

interface SegmentParams {
    stroke: string
    opacity: number
    dasharray?: string
    strokeWidth: number
}

function computeSegment(itemA: FlatItem): SegmentParams {
    if (itemA.status === 'completed') {
        const color = MODULE_COLORS[itemA.moduleIndex % MODULE_COLORS.length]
        return {stroke: color, opacity: 0.75, strokeWidth: 2.5}
    }
    return {stroke: '#D1D5DB', opacity: 0.5, dasharray: '6 6', strokeWidth: 1.5}
}

/* ═══════════════════════════════════════════════════════════════════════════
   Página principal
══════════════════════════════════════════════════════════════════════════════ */
export function CourseMapPage() {
    const {courseId = '1'} = useParams()
    const navigate = useNavigate()
    const progress = useStudentProgressStore(s => s.getProgress(courseId))

    const [activeContent, setActiveContent] = useState<AnyContentData | null>(null)
    const [activeModuleId, setActiveModuleId] = useState<string>('')
    const [courseData, setCourseData] = useState<{
        raw: CursoDetalleConProgreso
        course: Course
        contentDetails: Record<string, AnyContentData>
    } | null>(null)
    const [loadingCourse, setLoadingCourse] = useState(true)
    const [courseError, setCourseError] = useState<string | null>(null)

    /* ── Estado mutable de progreso ─────────────────────────────────────── */
    const [completedIds, setCompletedIds] = useState<string[]>([])
    const [markingComplete, setMarkingComplete] = useState(false)
    const [congratsCourse, setCongratsCourse] = useState<string | null>(null)

    useEffect(() => {
        const loadCourse = async () => {
            const usuarioId = getCurrentUserId()
            if (!usuarioId) {
                setCourseError('Usuario no autenticado')
                setLoadingCourse(false)
                return
            }

            try {
                setLoadingCourse(true)
                const data = await studentService.getCursoDetalleConProgreso(courseId, usuarioId)
                console.log('📚 Curso detallado:', data)

                const cursoImagenUrl = studentService.getImagenUrl(data.curso.idImagen)

                const mappedCourse: Course = {
                    id: data.curso.idCurso,
                    title: data.curso.titulo,
                    descripcion: data.curso.descripcion,
                    thumbnail: cursoImagenUrl ?? 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80',
                    modules: data.modulos.map((modulo) => ({
                        id: modulo.idModulo,
                        title: modulo.titulo,
                        order: modulo.orden,
                        contents: modulo.contenidos.map((contenido) => ({
                            id: contenido.idContenido,
                            title: contenido.titulo,
                            order: contenido.orden,
                            type: mapContentType(contenido.tipo),
                        })),
                    })),
                }

                const contentDetails: Record<string, AnyContentData> = {}
                data.modulos.forEach((modulo) => {
                    modulo.contenidos.forEach((contenido) => {
                        contentDetails[contenido.idContenido] = buildContentDetail(contenido)
                    })
                })

                setCourseData({raw: data, course: mappedCourse, contentDetails})
                setCourseError(null)

                // Inicializa completedIds desde el backend.
                // Si el backend reporta 0 contenidos completados en el agregado, los flags
                // individuales pueden ser registros huérfanos de una inscripción anterior
                // (el DELETE de inscripciones no borra progreso_estudiante en el backend).
                // En ese caso se ignoran los flags obsoletos para que el progreso arranque en 0.
                const overallCompleted = data.progresoCurso?.contenidosCompletados ?? null
                const ids = (overallCompleted === 0)
                    ? []
                    : data.modulos.flatMap((m) =>
                        m.contenidos
                            .filter((c) => Boolean(c.completado))
                            .map((c) => c.idContenido)
                    )
                setCompletedIds(ids)
            } catch (error) {
                console.error('Error loading course detail:', error)
                setCourseError(error instanceof Error ? error.message : 'Error al cargar curso')
                setCourseData(null)
                // Fallback al store local si falla el backend
                setCompletedIds(progress?.completedContents ?? [])
            } finally {
                setLoadingCourse(false)
            }
        }

        loadCourse()
    }, [courseId])

    const course = courseData?.course ?? MOCK_COURSE
    const contentDetails = courseData?.contentDetails ?? MOCK_CONTENT_DETAIL

    const allContents = course.modules.flatMap(m => m.contents)
    const activeIdx = activeContent ? allContents.findIndex(c => c.id === activeContent.id) : -1
    const totalContents = allContents.length
    const completedCount = completedIds.filter(id => allContents.some(c => c.id === id)).length
    const globalProgress = totalContents > 0
        ? Math.round((completedCount / totalContents) * 100)
        : 0

    const moduleStatuses = useMemo(
        () => computeModuleStatuses(course.modules, completedIds),
        [course.modules, completedIds]
    )
    const contentStatuses = useMemo(
        () => computeContentStatuses(course.modules, completedIds),
        [course.modules, completedIds]
    )
    const completedModules = moduleStatuses.filter(s => s === 'completed').length
    const activeModuleName = course.modules.find(m => m.id === activeModuleId)?.title ?? ''

    /* Lista plana de contenidos */
    const flatItems = useMemo((): FlatItem[] => {
        const items: FlatItem[] = []
        let gi = 0
        for (const [mi, mod] of course.modules.entries()) {
            for (const [ci, content] of mod.contents.entries()) {
                items.push({
                    contentId: content.id, contentTitle: content.title, contentType: content.type,
                    moduleId: mod.id, moduleTitle: mod.title, moduleIndex: mi,
                    indexInModule: ci, moduleLength: mod.contents.length,
                    isFirstInModule: ci === 0, globalIndex: gi, status: contentStatuses[gi],
                })
                gi++
            }
        }
        return items
    }, [contentStatuses, course.modules])

    /* ── Medición SVG ───────────────────────────────────────────────────── */
    const containerRef = useRef<HTMLDivElement>(null)
    const [circles, setCircles] = useState<{ x: number; y: number }[]>([])
    const [svgDims, setSvgDims] = useState({w: 0, h: 0})

    const measure = useCallback(() => {
        const el = containerRef.current
        if (!el) return
        const box = el.getBoundingClientRect()
        const all = Array.from(el.querySelectorAll('[data-content-circle]')) as HTMLElement[]
        const visible = all.filter(c => c.getBoundingClientRect().height > 0)
        setCircles(visible.map(c => {
            const r = c.getBoundingClientRect()
            return {x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top}
        }))
        setSvgDims({w: el.offsetWidth, h: el.offsetHeight})
    }, [])

    useEffect(() => {
        const t = setTimeout(measure, 60)
        const ro = new ResizeObserver(measure)
        if (containerRef.current) ro.observe(containerRef.current)
        return () => {
            clearTimeout(t)
            ro.disconnect()
        }
    }, [measure])

    useEffect(() => {
        measure()
    }, [contentStatuses, measure])

    /* ── Scroll al nodo actual ──────────────────────────────────────────── */
    const prevCurrentIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (circles.length === 0) return
        const currentItem = flatItems.find(i => i.status === 'current')
        if (!currentItem) return
        if (prevCurrentIdRef.current === currentItem.contentId) return

        const isFirstLoad = prevCurrentIdRef.current === null
        prevCurrentIdRef.current = currentItem.contentId

        const delay = isFirstLoad ? 150 : 400
        const timer = setTimeout(() => {
            const nodes = containerRef.current?.querySelectorAll(
                `[data-content-id="${currentItem.contentId}"]`
            )
            if (!nodes) return
            const el = Array.from(nodes).find(
                n => (n as HTMLElement).offsetParent !== null
            ) as HTMLElement | undefined
            el?.scrollIntoView({behavior: 'smooth', block: 'center'})
        }, delay)

        return () => clearTimeout(timer)
    }, [flatItems, circles.length])

    /* ── Navegación ─────────────────────────────────────────────────────── */
    const openContent = (contentId: string, moduleId: string) => {
        setActiveContent(contentDetails[contentId] ?? getDefaultContent(contentId))
        setActiveModuleId(moduleId)
        useStudentProgressStore.getState().updateLastAccessed(courseId)
    }

    /**
     * Marca el contenido actual como completado en el backend y cierra
     * el modal para que el usuario vea el mapa actualizarse.
     * Funciona también en el último contenido (alcanza el 100%).
     */
    const goNext = async () => {
        if (!activeContent) return

        const currentContentId = activeContent.id
        const usuarioId = getCurrentUserId()
        const activeModule = course.modules.find(m => m.id === activeModuleId)
        const courseName = course.title
        const moduleName = activeModule?.title ?? activeModuleName
        const isFirstInModule = activeModule?.contents[0]?.id === currentContentId

        if (!completedIds.includes(currentContentId) && !markingComplete) {
            setMarkingComplete(true)
            try {
                const result = await studentService.marcarContenidoCompletado(currentContentId, usuarioId ?? '')

                if (isFirstInModule) {
                    trackIniciarModulo(courseName, moduleName)
                }

                setCompletedIds((prev) => {
                    if (prev.includes(currentContentId)) return prev
                    return [...prev, currentContentId]
                })

                // Si el backend generó el certificado automáticamente, mostrar modal y redirigir
                if (result?.completado && result?.certificado) {
                    trackCursoCompletado(courseName)
                    trackCertificadoObtenido(courseName)
                    setActiveContent(null)
                    setCongratsCourse(courseName)
                    return
                }
            } catch (err) {
                console.error('Error al marcar contenido completado:', err)
            } finally {
                setMarkingComplete(false)
            }
        }

        // Cierra el modal → el usuario ve el mapa actualizarse
        setActiveContent(null)
    }

    const goPrev = () => {
        if (activeIdx > 0) openContent(allContents[activeIdx - 1].id, activeModuleId)
    }

    /* ── hasNext: visible también en el último si aún no está completado ── */
    const isActiveCompleted = activeContent ? completedIds.includes(activeContent.id) : false
    const hasNext = activeIdx < allContents.length - 1 || !isActiveCompleted

    /* ── Render ─────────────────────────────────────────────────────────── */
    if (loadingCourse) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div
                        className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"/>
                    <p className="text-muted-foreground">Cargando curso...</p>
                </div>
            </div>
        )
    }

    if (courseError && !courseData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-600">
                    <p className="font-semibold">Error al cargar curso</p>
                    <p className="text-sm">{courseError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 rounded text-white"
                        style={{backgroundColor: 'var(--color-primary)'}}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* ── Timeline ──────────────────────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    <div
                        className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 py-2 mb-4">
                        <Link
                            to="/student/dashboard"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary transition-colors"
                        >
                            <ArrowLeft size={14}/>
                            Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight">
                        {course.title}
                    </h1>
                    <p className="text-sm md:text-base text-secondary leading-relaxed mt-3 max-w-xl">
                        {course.descripcion ?? 'Explora el mapa del curso, sigue tu progreso y accede a los contenidos de cada módulo.'}
                    </p>

                    <div ref={containerRef} className="relative mt-10 pb-4">

                        {/* ── SVG: curvas con flechas ── */}
                        {circles.length >= 2 && (
                            <svg
                                className="absolute inset-0 pointer-events-none z-0"
                                width={svgDims.w}
                                height={svgDims.h}
                                style={{overflow: 'visible'}}
                                aria-hidden="true"
                            >
                                <defs>
                                    {MODULE_COLORS.map((color, mi) => (
                                        <marker key={`arrow-mod-${mi}`}
                                                id={`arrow-mod-${mi}`}
                                                markerWidth="7" markerHeight="6"
                                                refX="6" refY="3" orient="auto">
                                            <polygon points="0 0, 7 3, 0 6" fill={color} opacity="0.85"/>
                                        </marker>
                                    ))}
                                    <marker id="arrow-gray" markerWidth="7" markerHeight="6" refX="6" refY="3"
                                            orient="auto">
                                        <polygon points="0 0, 7 3, 0 6" fill="#D1D5DB" opacity="0.7"/>
                                    </marker>
                                </defs>

                                {flatItems.slice(0, -1).map((itemA, i) => {
                                    if (!circles[i] || !circles[i + 1]) return null
                                    const seg = computeSegment(itemA)
                                    const c0 = circles[i], c1 = circles[i + 1]
                                    const dy = c1.y - c0.y
                                    const d = `M ${c0.x} ${c0.y} C ${c0.x} ${c0.y + dy * 0.45}, ${c1.x} ${c1.y - dy * 0.45}, ${c1.x} ${c1.y}`
                                    const markerId = itemA.status === 'completed'
                                        ? `arrow-mod-${itemA.moduleIndex % MODULE_COLORS.length}`
                                        : 'arrow-gray'
                                    return (
                                        <path
                                            key={i}
                                            d={d}
                                            fill="none"
                                            stroke={seg.stroke}
                                            strokeWidth={seg.strokeWidth}
                                            strokeDasharray={seg.dasharray}
                                            opacity={seg.opacity}
                                            strokeLinecap="round"
                                            markerMid={`url(#${markerId})`}
                                            style={{transition: 'stroke 600ms ease, opacity 600ms ease'}}
                                        />
                                    )
                                })}
                            </svg>
                        )}

                        {/* ── Nodos ── */}
                        <div>
                            {flatItems.map(item => (
                                <div key={item.contentId}>
                                    {item.isFirstInModule && (
                                        <ModuleDivider
                                            title={item.moduleTitle}
                                            index={item.moduleIndex}
                                            color={MODULE_COLORS[item.moduleIndex % MODULE_COLORS.length]}
                                        />
                                    )}
                                    <ContentNodeRow
                                        item={item}
                                        onAction={() => openContent(item.contentId, item.moduleId)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Panel resumen ─────────────────────────────────────────────── */}
                <div className="w-full lg:w-72 xl:w-80 shrink-0">
                    <div className="lg:sticky lg:top-8 space-y-4">

                        <div className="rounded-2xl overflow-hidden aspect-video bg-primary relative">
                            <img src={course.thumbnail} alt={course.title}
                                 className="w-full h-full object-cover opacity-50"/>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                <span
                                    className="text-[10px] font-bold text-tertiary/70 uppercase tracking-widest">Masterclass</span>
                                <span
                                    className="text-sm font-bold text-tertiary text-center mt-1 leading-snug">{course.title}</span>
                            </div>
                        </div>

                        <div className="bg-surface rounded-2xl border border-mid/20 p-5 space-y-5">
                            <h2 className="text-base font-bold text-primary">Resumen del curso</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-mid uppercase tracking-wider mb-0.5">Instructor</p>
                                    <p className="text-sm font-semibold text-primary">
                                        {courseData?.raw.curso.nombreUsuario ?? 'Sin asignar'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-mid uppercase tracking-wider mb-0.5">Módulos</p>
                                    <p className="text-sm font-semibold text-primary">
                                        {completedModules} / {course.modules.length}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                                    Progreso general
                                </p>
                                <div className="flex justify-between items-center text-xs text-secondary mb-1.5">
                                    <span className="font-semibold">{globalProgress}%</span>
                                    <span className="text-mid">{completedCount} / {totalContents} contenidos</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-mid/25 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-secondary transition-all duration-700"
                                        style={{width: `${globalProgress}%`}}
                                    />
                                </div>
                            </div>

                            {globalProgress >= 100 && (
                                <Link
                                    to="/student/grades"
                                    className="flex items-center justify-center gap-2 w-full min-h-10 rounded-xl
                   text-sm font-semibold text-white transition-all duration-300
                   hover:opacity-90 hover:scale-[1.02]"
                                    style={{
                                        background: `linear-gradient(135deg, #059669, #5A878C)`,
                                        boxShadow: '0 4px 14px #05966940',
                                    }}
                                >
                                    <Check size={15} strokeWidth={2.5}/>
                                    Ver mi certificado
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {activeContent && (
                <ContentModal
                    content={activeContent}
                    currentStep={activeIdx + 1}
                    totalSteps={totalContents}
                    moduleName={activeModuleName}
                    onClose={() => setActiveContent(null)}
                    onPrev={goPrev}
                    onNext={goNext}
                    hasPrev={activeIdx > 0}
                    hasNext={hasNext}
                    isMarkingComplete={markingComplete}
                />
            )}

            {congratsCourse && (
                <CongratulationsModal
                    courseName={congratsCourse}
                    onRedirect={() => {
                        setCongratsCourse(null)
                        navigate('/student/grades')
                    }}
                />
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Separador de módulo
══════════════════════════════════════════════════════════════════════════════ */
function ModuleDivider({title, index, color}: { title: string; index: number; color: string }) {
    return (
        <div className={`flex items-center gap-3 relative z-20 mb-5 ${index > 0 ? 'mt-8' : ''}`}>
            <div className="h-px flex-1 rounded-full" style={{backgroundColor: color, opacity: 0.25}}/>
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: color}}/>
                <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap" style={{color}}>
                    {title}
                </span>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: color}}/>
            </div>
            <div className="h-px flex-1 rounded-full" style={{backgroundColor: color, opacity: 0.25}}/>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Fila de nodo de contenido
══════════════════════════════════════════════════════════════════════════════ */
function ContentNodeRow({item, onAction}: { item: FlatItem; onAction: () => void }) {
    const [leftFr, rightFr] = LAYOUT_PATTERNS[item.globalIndex % LAYOUT_PATTERNS.length]
    const gap = VERTICAL_GAPS[item.globalIndex % VERTICAL_GAPS.length]
    const cardOnLeft = leftFr >= rightFr
    const circle = <ContentCircle type={item.contentType} status={item.status} moduleIndex={item.moduleIndex}
                                  onAction={onAction}/>
    const card = <ContentCard item={item} onAction={onAction}/>

    return (
        <>
            {/* Mobile: lineal */}
            <div
                data-content-id={item.contentId}
                className="flex md:hidden items-start gap-3 relative z-10"
                style={{marginBottom: `${gap * 0.6}px`}}
            >
                <div className="shrink-0 mt-1">{circle}</div>
                <div className="flex-1 min-w-0">{card}</div>
            </div>

            {/* Desktop: posición orgánica */}
            <div
                data-content-id={item.contentId}
                className="hidden md:grid items-center relative z-10"
                style={{gridTemplateColumns: `${leftFr}fr auto ${rightFr}fr`, gap: '12px', marginBottom: `${gap}px`}}
            >
                <div className="flex justify-end">
                    {cardOnLeft ? card : <span/>}
                </div>
                <div className="flex items-center justify-center">
                    {circle}
                </div>
                <div className="flex justify-start">
                    {!cardOnLeft ? card : <span/>}
                </div>
            </div>
        </>
    )
}

/* ── Círculo ────────────────────────────────────────────────────────────── */
const CONTENT_ICON: Record<string, React.ElementType> = {
    video: Play,
    text: FileText,
    quiz: HelpCircle,
    image: ImageIcon,
    pdf: FileText,
    xlsx: Table,
}

function ContentCircle({type, status, moduleIndex, onAction}: {
    type: string; status: ContentStatus; moduleIndex: number; onAction: () => void
}) {
    const Icon = CONTENT_ICON[type] ?? FileText
    const color = MODULE_COLORS[moduleIndex % MODULE_COLORS.length]

    if (status === 'completed') {
        return (
            <button
                data-content-circle
                onClick={onAction}
                aria-label="Ver contenido"
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
            >
                <Check size={16} className="text-gray-500" strokeWidth={2.5}/>
            </button>
        )
    }
    if (status === 'current') {
        return (
            <button
                data-content-circle
                onClick={onAction}
                aria-label="Continuar aquí"
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-105"
                style={{
                    backgroundColor: color,
                    outline: `3px solid ${color}`,
                    outlineOffset: '3px',
                    boxShadow: `0 6px 20px ${color}50`,
                }}
            >
                <Icon size={22} className="text-white"/>
            </button>
        )
    }
    return (
        <div
            data-content-circle
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gray-100 border-2 border-gray-200 cursor-not-allowed"
        >
            <Lock size={13} className="text-gray-400"/>
        </div>
    )
}

/* ── Card ───────────────────────────────────────────────────────────────── */
const CONTENT_TYPE_LABEL: Record<string, string> = {
    video: 'Video', text: 'Texto', quiz: 'Quiz', image: 'Imagen', pdf: 'PDF', xlsx: 'Excel',
}

function ContentCard({item, onAction}: { item: FlatItem; onAction: () => void }) {
    const isCurrent = item.status === 'current'
    const isCompleted = item.status === 'completed'
    const typeLabel = CONTENT_TYPE_LABEL[item.contentType] ?? item.contentType
    const color = MODULE_COLORS[item.moduleIndex % MODULE_COLORS.length]

    if (isCurrent) {
        return (
            <div
                onClick={onAction}
                className="relative overflow-hidden rounded-3xl w-full md:max-w-52.5 cursor-pointer transition-all duration-300 hover:scale-[1.03]"
                style={{
                    border: `3px solid ${color}`,
                    boxShadow: `0 0 0 1px ${color}30, 0 8px 28px ${color}35`,
                    background: `linear-gradient(160deg, white 55%, ${color}10 100%)`,
                }}
            >
                <div className="h-1.5 w-full" style={{backgroundColor: color}}/>
                <div className="p-3.5">
                    <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 text-white"
                        style={{backgroundColor: color}}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                        Aquí estás
                    </span>
                    <span
                        className="ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{backgroundColor: color + '18', color}}
                    >
                        {typeLabel}
                    </span>
                    <p className="mt-2 text-sm font-bold text-primary leading-snug line-clamp-2">
                        {item.contentTitle}
                    </p>
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            onAction()
                        }}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 min-h-9 px-3 rounded-xl text-white text-xs font-semibold transition-colors hover:opacity-90"
                        style={{backgroundColor: color}}
                    >
                        <Play size={12} className="ml-0.5"/>
                        Continuar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            onClick={isCompleted ? onAction : undefined}
            className={[
                'bg-gray-50 rounded-2xl p-3.5 w-full md:max-w-50',
                'border border-gray-200 transition-colors duration-200',
                isCompleted ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed',
            ].join(' ')}
        >
            <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 bg-gray-200 text-gray-500">
                {typeLabel}
            </span>
            <p className="text-sm font-semibold text-gray-500 leading-snug line-clamp-2">
                {item.contentTitle}
            </p>
            {isCompleted && (
                <p className="mt-1.5 text-[10px] font-medium flex items-center gap-1 text-gray-400">
                    <Check size={10}/>
                    Completado
                </p>
            )}
            {item.status === 'locked' && (
                <p className="mt-1.5 text-[10px] font-medium flex items-center gap-1 text-gray-400">
                    <Lock size={10}/>
                    Bloqueado
                </p>
            )}
        </div>
    )
}
