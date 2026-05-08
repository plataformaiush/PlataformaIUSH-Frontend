interface CurvedPathProps {
  from: { x: number; y: number }
  to:   { x: number; y: number }
  color: string
  opacity?: number
  curvature?: number
}

function buildPath(
  from: { x: number; y: number },
  to:   { x: number; y: number },
  curvature: number
): string {
  const dx = to.x - from.x
  const dy = to.y - from.y

  // Puntos de control perpendiculares para crear la curva orgánica
  const cp1x = from.x + dx * 0.25 + dy * curvature
  const cp1y = from.y + dy * 0.25 - dx * curvature
  const cp2x = from.x + dx * 0.75 - dy * curvature
  const cp2y = from.y + dy * 0.75 + dx * curvature

  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${to.x} ${to.y}`
}

export function CurvedPath({ from, to, color, opacity = 1, curvature = 0.35 }: CurvedPathProps) {
  return (
    <path
      d={buildPath(from, to, curvature)}
      stroke={color}
      strokeWidth={3}
      strokeDasharray="10 7"
      strokeLinecap="round"
      fill="none"
      opacity={opacity}
    />
  )
}
