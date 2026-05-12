interface ModuleSectionProps {
  title: string
  y: number
  canvasWidth: number
  color: string
  isLocked: boolean
}

export function ModuleSection({ title, y, canvasWidth, color, isLocked }: ModuleSectionProps) {
  const badgeH = 26
  const badgeW = Math.min(title.length * 7.5 + 40, canvasWidth * 0.8)
  const badgeX = (canvasWidth - badgeW) / 2
  const lineY  = y - badgeH / 2

  return (
    <g opacity={isLocked ? 0.45 : 1}>
      {/* Línea izquierda */}
      <line
        x1={20} y1={lineY}
        x2={badgeX - 8} y2={lineY}
        stroke={color} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.5}
      />
      {/* Línea derecha */}
      <line
        x1={badgeX + badgeW + 8} y1={lineY}
        x2={canvasWidth - 20} y2={lineY}
        stroke={color} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.5}
      />

      {/* Badge del módulo */}
      <rect
        x={badgeX} y={y - badgeH}
        width={badgeW} height={badgeH}
        rx={badgeH / 2}
        fill={isLocked ? '#f1f5f9' : color}
        opacity={isLocked ? 0.8 : 0.15}
      />
      <rect
        x={badgeX} y={y - badgeH}
        width={badgeW} height={badgeH}
        rx={badgeH / 2}
        fill="none"
        stroke={isLocked ? '#84B9BF' : color}
        strokeWidth={1.5}
        opacity={0.7}
      />
      <text
        x={canvasWidth / 2}
        y={y - badgeH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="700"
        fill={isLocked ? '#84B9BF' : color}
        letterSpacing={0.3}
      >
        {isLocked ? '🔒  ' : ''}{title.toUpperCase()}
      </text>
    </g>
  )
}
