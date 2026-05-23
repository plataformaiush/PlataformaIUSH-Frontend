import React from 'react'

interface AlertCardProps {
  title: string
  description: string
  items: Array<{
    label: string
    value: number | string
  }>
}

export function AlertCard({ title, description, items }: AlertCardProps) {
  return (
    <div className="border-2 border-amber-300 rounded-xl bg-amber-50 p-6 shadow-md"
      style={{ borderColor: 'var(--color-warning)', backgroundColor: 'var(--color-muted)' }}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{title}</h3>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--color-muted-foreground)' }}>{description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white/60 rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{item.value}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
