interface ContenidoTipo {
  tipo: string
  cantidad: number
  porcentaje: number
}

interface ContentPieChartProps {
  data: ContenidoTipo[]
}

export function ContentPieChart({ data }: ContentPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p style={{ color: 'var(--color-muted-foreground)' }}>No hay datos de contenido</p>
      </div>
    )
  }

  const colors = ['#0891B2', '#06B6D4', '#22D3EE']
  const radius = 85
  const size = 350
  const centerX = size / 2
  const centerY = size / 2

  // Calcular ángulos
  let currentAngle = -90
  const slices = data.map((item, idx) => {
    const sliceAngle = (item.porcentaje / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle

    // Punto inicio
    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    // Punto final
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    
    const largeArc = sliceAngle > 180 ? 1 : 0

    // Ángulo del centro del slice para label
    const labelAngle = (startAngle + endAngle) / 2
    
    // Para slices pequeños (< 10%): mostrar etiqueta fuera con línea conectora
    // Para slices grandes: mostrar dentro del slice
    const isSmallSlice = item.porcentaje < 10
    
    if (isSmallSlice) {
      // Posición del borde del slice
      const borderRadius = radius
      const borderX = centerX + borderRadius * Math.cos((labelAngle * Math.PI) / 180)
      const borderY = centerY + borderRadius * Math.sin((labelAngle * Math.PI) / 180)
      
      // Posición exterior (más lejos)
      const outerRadius = radius * 1.8
      const labelX = centerX + outerRadius * Math.cos((labelAngle * Math.PI) / 180)
      const labelY = centerY + outerRadius * Math.sin((labelAngle * Math.PI) / 180)
      
      // Control point para línea curva
      const controlRadius = radius * 1.2
      const controlX = centerX + controlRadius * Math.cos((labelAngle * Math.PI) / 180)
      const controlY = centerY + controlRadius * Math.sin((labelAngle * Math.PI) / 180)
      
      return {
        path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: colors[idx % colors.length],
        label: item.tipo,
        pct: item.porcentaje,
        labelX,
        labelY,
        borderX,
        borderY,
        controlX,
        controlY,
        isSmallSlice: true,
      }
    } else {
      // Para slices grandes: label dentro
      const labelRadius = radius * 0.65
      const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180)
      const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180)
      
      return {
        path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: colors[idx % colors.length],
        label: item.tipo,
        pct: item.porcentaje,
        labelX,
        labelY,
        isSmallSlice: false,
      }
    }
  })

  return (
    <div className="flex items-center gap-8">
      {/* Gráfica circular */}
      <div className="flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
          <defs>
            <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
            </filter>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891B2" stopOpacity="1" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="1" />
              <stop offset="100%" stopColor="#0891B2" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Slices */}
          {slices.map((slice, i) => {
            const gradId = `grad${(i % 3) + 1}`
            return (
              <g key={i}>
                <path
                  d={slice.path}
                  fill={`url(#${gradId})`}
                  stroke="white"
                  strokeWidth="2"
                  filter="url(#circleShadow)"
                  className="transition-all duration-300 hover:filter hover:brightness-110 cursor-pointer"
                  style={{
                    filter: 'url(#circleShadow)',
                  }}
                />
              </g>
            )
          })}

          {/* Líneas conectoras curvas para slices pequeños */}
          {slices.map((slice, i) =>
            slice.isSmallSlice && slice.borderX && slice.borderY && slice.controlX && slice.controlY ? (
              <g key={`line-${i}`}>
                {/* Línea curva Bezier */}
                <path
                  d={`M ${slice.borderX} ${slice.borderY} Q ${slice.controlX} ${slice.controlY} ${slice.labelX} ${slice.labelY}`}
                  stroke={slice.color}
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.7"
                  className="transition-all duration-300 hover:opacity-100 hover:stroke-width[3]"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Punto en el inicio */}
                <circle
                  cx={slice.borderX}
                  cy={slice.borderY}
                  r="2.5"
                  fill={slice.color}
                  opacity="0.5"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Punto en el final (junto a la etiqueta) */}
                <circle
                  cx={slice.labelX - 8}
                  cy={slice.labelY}
                  r="2.5"
                  fill={slice.color}
                  opacity="0.8"
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            ) : null
          )}

          {/* Porcentajes */}
          {slices.map((slice, i) => (
            <g key={`label-${i}`}>
              {/* Fondo para etiquetas externas */}
              {slice.isSmallSlice && (
                <rect
                  x={slice.labelX - 2}
                  y={slice.labelY - 12}
                  width="32"
                  height="24"
                  rx="6"
                  fill="white"
                  stroke={slice.color}
                  strokeWidth="1.5"
                  opacity="0.95"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <text
                x={slice.isSmallSlice ? slice.labelX + 8 : slice.labelX}
                y={slice.labelY}
                textAnchor={slice.isSmallSlice ? 'start' : 'middle'}
                dominantBaseline="middle"
                fontSize={slice.isSmallSlice ? '13' : '20'}
                fontWeight="700"
                fill={slice.isSmallSlice ? slice.color : 'white'}
                style={{
                  textShadow: slice.isSmallSlice ? 'none' : '0 1px 3px rgba(0,0,0,0.3)',
                  pointerEvents: 'none',
                }}
              >
                {slice.pct}%
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Leyenda al lado */}
      <div className="flex-1 space-y-3">
        {data.map((c, idx) => (
          <div
            key={`${c.tipo}-${idx}`}
            className="rounded-lg p-3 transition-all duration-300 hover:scale-105 cursor-pointer border"
            style={{
              borderColor: colors[idx % colors.length],
              background: `${colors[idx % colors.length]}08`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-md"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    {c.tipo}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
                    {c.cantidad} items
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold ml-2 flex-shrink-0" style={{ color: colors[idx % colors.length] }}>
                {c.porcentaje}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
