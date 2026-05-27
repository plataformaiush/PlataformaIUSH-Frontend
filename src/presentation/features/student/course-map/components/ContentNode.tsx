import { Play, BookOpen, Image as ImageIcon, HelpCircle, Check, Lock } from 'lucide-react'
import type { ContentType } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

export type NodeStatus = 'completed' | 'available' | 'locked'

const TYPE_ICONS: Record<ContentType, React.FC<{ size: number; color: string }>> = {
  video:  ({ size, color }) => <Play  size={size} color={color} fill={color} />,
  text:   ({ size, color }) => <BookOpen size={size} color={color} />,
  image:  ({ size, color }) => <ImageIcon size={size} color={color} />,
  quiz:   ({ size, color }) => <HelpCircle size={size} color={color} />,
}

interface ContentNodeProps {
  id: string
  title: string
  contentType: ContentType
  position: { x: number; y: number }
  color: string
  status: NodeStatus
  order: number
  onClick: () => void
  nodeRadius?: number
}

export function ContentNode({
  title,
  contentType,
  position,
  color,
  status,
  order,
  onClick,
  nodeRadius = 38,
}: ContentNodeProps) {
  const r = nodeRadius
  const { x, y } = position

  const isLocked    = status === 'locked'
  const isCompleted = status === 'completed'

  const nodeColor   = isLocked ? '#B0C4CC' : color
  const iconColor   = 'white'
  const iconSize    = Math.round(r * 0.52)
  const badgeR      = Math.round(r * 0.28)

  const TypeIcon = TYPE_ICONS[contentType]

  return (
    <g
      onClick={isLocked ? undefined : onClick}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
      role="button"
      aria-label={`${title}${isLocked ? ' (bloqueado)' : ''}`}
      aria-disabled={isLocked}
    >
      {/* Hit area táctil extendida — garantiza mínimo 44px */}
      <circle cx={x} cy={y} r={r + 10} fill="transparent" />

      {/* Sombra de color */}
      {!isLocked && (
        <circle
          cx={x}
          cy={y + 4}
          r={r}
          fill={color}
          opacity={0.25}
          style={{ filter: 'blur(4px)' }}
        />
      )}

      {/* Borde blanco exterior */}
      <circle cx={x} cy={y} r={r + 4} fill="white" opacity={isLocked ? 0.5 : 1} />

      {/* Círculo principal */}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={nodeColor}
        opacity={isLocked ? 0.5 : 1}
      />

      {/* Overlay verde para completados */}
      {isCompleted && (
        <circle cx={x} cy={y} r={r} fill="rgba(46,204,113,0.18)" />
      )}

      {/* Ícono interior */}
      {isLocked ? (
        <foreignObject x={x - iconSize / 2} y={y - iconSize / 2} width={iconSize} height={iconSize}>
          <div
            style={{
              width: iconSize,
              height: iconSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={iconSize - 4} color="white" opacity={0.7} />
          </div>
        </foreignObject>
      ) : isCompleted ? (
        <foreignObject x={x - iconSize / 2} y={y - iconSize / 2} width={iconSize} height={iconSize}>
          <div
            style={{
              width: iconSize,
              height: iconSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={iconSize - 2} color="white" strokeWidth={3} />
          </div>
        </foreignObject>
      ) : (
        <foreignObject x={x - iconSize / 2} y={y - iconSize / 2} width={iconSize} height={iconSize}>
          <div
            style={{
              width: iconSize,
              height: iconSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TypeIcon size={iconSize - 4} color={iconColor} />
          </div>
        </foreignObject>
      )}

      {/* Anillo verde de completado */}
      {isCompleted && (
        <circle
          cx={x}
          cy={y}
          r={r + 7}
          fill="none"
          stroke="#2ECC71"
          strokeWidth={3}
          opacity={0.8}
        />
      )}

      {/* Badge numérico — esquina superior derecha */}
      {!isLocked && (
        <>
          <circle
            cx={x + r * 0.68}
            cy={y - r * 0.68}
            r={badgeR}
            fill="white"
            stroke={isCompleted ? '#2ECC71' : color}
            strokeWidth={1.5}
          />
          <text
            x={x + r * 0.68}
            y={y - r * 0.68}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={badgeR * 0.95}
            fontWeight="800"
            fill={isCompleted ? '#2ECC71' : color}
          >
            {order}
          </text>
        </>
      )}

      {/* Título debajo del nodo */}
      <foreignObject
        x={x - 60}
        y={y + r + 8}
        width={120}
        height={36}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            textAlign: 'center',
            color: isLocked ? '#84B9BF' : '#223740',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </p>
      </foreignObject>
    </g>
  )
}
