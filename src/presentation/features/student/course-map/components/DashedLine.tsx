interface DashedLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  opacity?: number
}

export function DashedLine({ from, to, color, opacity = 1 }: DashedLineProps) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray="8 6"
      strokeLinecap="round"
      opacity={opacity}
    />
  )
}
