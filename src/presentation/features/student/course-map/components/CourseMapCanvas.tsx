import { useEffect, useRef, useState } from 'react'
import { CurvedPath } from './CurvedPath'
import { ContentNode } from './ContentNode'
import { ModuleSection } from './ModuleSection'
import { useCourseMap } from '../hooks/useCourseMap'
import { getModuleColor } from '../hooks/useModuleColor'
import type { Module } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'
import type { NodeStatus } from './ContentNode'

interface CourseMapCanvasProps {
  modules: Module[]
  completedContentIds: string[]
  currentContentId: string | null
  onNodeClick: (contentId: string, moduleId: string) => void
}

function getNodeStatus(
  contentId: string,
  moduleBlocked: boolean,
  completedIds: string[],
  prevContentId: string | null
): NodeStatus {
  if (moduleBlocked) return 'locked'
  if (completedIds.includes(contentId)) return 'completed'
  if (!prevContentId || completedIds.includes(prevContentId)) return 'available'
  return 'locked'
}

function isModuleBlocked(moduleIndex: number, modules: Module[], completedIds: string[]): boolean {
  if (moduleIndex === 0) return false
  const prev = modules[moduleIndex - 1]
  return prev.contents.some(c => !completedIds.includes(c.id))
}

export function CourseMapCanvas({
  modules,
  completedContentIds,
  currentContentId,
  onNodeClick,
}: CourseMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(360)
  const hasScrolled = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w > 0) setWidth(w)
    })
    ro.observe(containerRef.current)
    setWidth(containerRef.current.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const NODE_RADIUS  = width < 640 ? 34 : 40
  const { positions, totalHeight } = useCourseMap(modules, width)
  const posMap = Object.fromEntries(positions.map(p => [p.id, p]))

  // Scroll automático al nodo actual (solo una vez, cuando el ancho real está disponible)
  useEffect(() => {
    if (hasScrolled.current || !currentContentId || width === 360) return
    const pos = posMap[currentContentId]
    if (!pos || !containerRef.current) return
    hasScrolled.current = true

    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY
    const nodePageY    = containerTop + pos.y
    const HEADER_H     = 140 // sticky header + módulo badge
    const scrollTarget = nodePageY - HEADER_H - window.innerHeight * 0.25

    setTimeout(() => {
      window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' })
    }, 100)
  }, [width, currentContentId, posMap])

  // Calcular la Y de cada separador de módulo
  const moduleSeparatorY: Record<string, number> = {}
  for (const mod of modules) {
    const firstPos = posMap[mod.contents[0]?.id]
    if (firstPos) moduleSeparatorY[mod.id] = firstPos.y - NODE_RADIUS - 36
  }

  return (
    <div ref={containerRef} className="w-full overflow-y-auto overflow-x-hidden">
      <svg
        width={width}
        height={totalHeight}
        className="overflow-visible"
        role="img"
        aria-label="Mapa de aprendizaje del curso"
      >
        {/* Curvas entre nodos consecutivos del mismo módulo */}
        {modules.map((mod, mi) => {
          const color   = getModuleColor(mi)
          const blocked = isModuleBlocked(mi, modules, completedContentIds)
          return mod.contents.map((content, ci) => {
            if (ci === 0) return null
            const from = posMap[mod.contents[ci - 1].id]
            const to   = posMap[content.id]
            if (!from || !to) return null

            // Curvatura proporcional a la distancia horizontal entre nodos:
            // - nodos muy separados en X → curva más pronunciada (hasta 0.45)
            // - nodos cerca en X       → curva suave (mínimo 0.20)
            // Esto crea el efecto de río que fluye naturalmente
            const dx = Math.abs(to.x - from.x)
            const curvature = 0.20 + (dx / width) * 0.50

            return (
              <CurvedPath
                key={`path-${content.id}`}
                from={from}
                to={to}
                color={blocked ? 'var(--color-mid)' : color}
                opacity={blocked ? 0.25 : 0.65}
                curvature={curvature}
              />
            )
          })
        })}

        {/* Separadores de módulo */}
        {modules.map((mod, mi) => {
          const color   = getModuleColor(mi)
          const blocked = isModuleBlocked(mi, modules, completedContentIds)
          const sepY    = moduleSeparatorY[mod.id]
          if (!sepY) return null
          return (
            <ModuleSection
              key={`sep-${mod.id}`}
              title={mod.title}
              y={sepY}
              canvasWidth={width}
              color={color}
              isLocked={blocked}
            />
          )
        })}

        {/* Nodos de contenido */}
        {modules.map((mod, mi) =>
          mod.contents.map((content, ci) => {
            const pos         = posMap[content.id]
            if (!pos) return null
            const color       = getModuleColor(mi)
            const moduleBlocked = isModuleBlocked(mi, modules, completedContentIds)
            const prevId      = ci > 0 ? mod.contents[ci - 1].id : null
            const status      = getNodeStatus(content.id, moduleBlocked, completedContentIds, prevId)

            return (
              <ContentNode
                key={content.id}
                id={content.id}
                title={content.title}
                contentType={content.type}
                position={pos}
                color={color}
                status={status}
                order={ci + 1}
                nodeRadius={NODE_RADIUS}
                onClick={() => {
                  if (status !== 'locked') onNodeClick(content.id, mod.id)
                }}
              />
            )
          })
        )}
      </svg>
    </div>
  )
}
