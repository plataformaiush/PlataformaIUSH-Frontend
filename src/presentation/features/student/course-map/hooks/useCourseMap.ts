import { useMemo } from 'react'
import type { Module } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

export interface NodePosition {
  id: string
  moduleId: string
  moduleIndex: number
  x: number
  y: number
  order: number
}

function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Genera un número en [0, 1) determinístico a partir de una semilla string
function seededRandom(seed: string): number {
  return (djb2(seed) % 100000) / 100000
}

export function useCourseMap(
  modules: Module[],
  canvasWidth: number
): { positions: NodePosition[]; totalHeight: number } {
  return useMemo(() => {
    const isMobile = canvasWidth < 640
    const NODE_RADIUS  = isMobile ? 34 : 40
    const MARGIN       = NODE_RADIUS + 22
    const X_USABLE     = canvasWidth - MARGIN * 2
    const Y_SPACING    = isMobile ? 165 : 185
    const Y_JITTER     = isMobile ? 14 : 20   // variación vertical ±px
    const MODULE_GAP   = 80                    // espacio extra entre módulos
    // Separación horizontal mínima entre dos nodos consecutivos
    // garantiza que la curva sea visible y no quede casi recta
    const MIN_H_GAP    = X_USABLE * 0.30

    const positions: NodePosition[] = []
    let globalY = NODE_RADIUS + 110

    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi]

      if (mi > 0) globalY += MODULE_GAP

      let prevX: number | null = null

      for (let ci = 0; ci < mod.contents.length; ci++) {
        const content = mod.contents[ci]

        // ── X totalmente libre dentro del canvas ─────────────────────────
        // La semilla combina el id con el índice del módulo para que el mismo
        // id en módulos distintos tenga posiciones distintas
        const rawX = seededRandom(`${mi}-${content.id}-x`)
        let x = MARGIN + rawX * X_USABLE

        // Si el nodo cae demasiado cerca horizontalmente del anterior,
        // lo empujamos al lado opuesto del canvas para que la curva sea notoria
        if (prevX !== null && Math.abs(x - prevX) < MIN_H_GAP) {
          if (prevX < canvasWidth / 2) {
            // Anterior en la mitad izquierda → este va a la derecha
            const r = seededRandom(`${mi}-${content.id}-xr`)
            x = canvasWidth / 2 + MARGIN * 0.5 + r * (X_USABLE * 0.48)
          } else {
            // Anterior en la mitad derecha → este va a la izquierda
            const r = seededRandom(`${mi}-${content.id}-xl`)
            x = MARGIN + r * (X_USABLE * 0.48)
          }
        }

        // Clamp final: nunca salir de los márgenes
        x = Math.max(MARGIN, Math.min(canvasWidth - MARGIN, x))

        // ── Y con jitter suave ────────────────────────────────────────────
        const jy = (seededRandom(`${mi}-${content.id}-y`) - 0.5) * Y_JITTER * 2
        const y  = globalY + jy

        positions.push({
          id: content.id,
          moduleId: mod.id,
          moduleIndex: mi,
          x,
          y,
          order: ci + 1,
        })

        prevX    = x
        globalY += Y_SPACING
      }
    }

    return { positions, totalHeight: globalY + NODE_RADIUS + 48 }
  }, [modules, canvasWidth])
}
