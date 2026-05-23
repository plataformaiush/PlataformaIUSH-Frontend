import { useState, useEffect } from 'react'
import { InstitutionColors, defaultInstitutionColors, generateCSSVariables } from '../../../../domain/institution/types'

const COLOR_FIELDS: { key: keyof InstitutionColors; label: string; category: string }[] = [
  { key: 'primary',       label: 'Primary - Botones principales',      category: 'Colores principales' },
  { key: 'secondary',     label: 'Secondary - Botones secundarios',     category: 'Colores principales' },
  { key: 'tertiary',      label: 'Tertiary - Botones alternativos',     category: 'Colores principales' },
  { key: 'background',    label: 'Background - Fondo de la página',     category: 'Fondos' },
  { key: 'input',         label: 'Input - Fondo de campos de entrada',  category: 'Fondos' },
  { key: 'textTertiary',  label: 'Muted - Colores suaves',              category: 'Fondos' },
  { key: 'textBase',      label: 'Foreground - Texto principal',        category: 'Texto' },
  { key: 'textSecondary', label: 'Muted Foreground - Texto secundario', category: 'Texto' },
  { key: 'textOnDark',    label: 'Text on Dark - Texto sobre oscuros',  category: 'Texto' },
  { key: 'border',        label: 'Border - Bordes',                     category: 'Bordes' },
]

const STORAGE_KEY = 'student_colors'

function applyStudentTheme(colors: InstitutionColors) {
  const root = document.getElementById('student-root') || document.body
  const vars = generateCSSVariables(colors)
  Object.entries(vars).forEach(([k, v]) => {
    root.style.setProperty(k, v)
  })
  // also map the common vars used across the app
  root.style.setProperty('--color-background', colors.background)
  root.style.setProperty('--color-foreground', colors.textBase)
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-secondary', colors.secondary)
  root.style.setProperty('--color-tertiary', colors.tertiary)
  root.style.setProperty('--color-muted-foreground', colors.textSecondary)
  root.style.setProperty('--color-muted', colors.textTertiary)
  root.style.setProperty('--color-border', colors.border)
  root.style.setProperty('--color-input', colors.input)
  root.style.setProperty('--color-text-on-dark', colors.textOnDark)
}

export default function StudentPersonalization({ onClose }: { onClose: () => void }) {
  const [colors, setColors] = useState<InstitutionColors>(defaultInstitutionColors)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as InstitutionColors
        setColors(parsed)
        applyStudentTheme(parsed)
      } catch {
        setColors(defaultInstitutionColors)
      }
    }
  }, [])

  function handleChange(key: keyof InstitutionColors, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
    applyStudentTheme(colors)
    onClose()
  }

  return (
    <div className="fixed top-16 right-4 z-50 w-80 p-3 bg-white rounded-lg shadow-lg text-sm" style={{ color: 'var(--color-foreground)' }}>
      <div className="flex items-center justify-between mb-2">
        <strong>Personalización (estudiante)</strong>
        <button onClick={onClose} aria-label="Cerrar" className="text-xs">✕</button>
      </div>

      <div className="space-y-2">
        {['Colores principales', 'Fondos', 'Texto', 'Bordes'].map((category) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--color-muted-foreground)' }}>{category}</h3>
            <div className="grid grid-cols-1 gap-2">
              {COLOR_FIELDS.filter((f) => f.category === category).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="text-xs w-36" style={{ color: 'var(--color-muted-foreground)' }}>{label}</label>
                  <input type="color" value={colors[key]} onChange={(e) => handleChange(key, e.target.value)} className="w-10 h-8" />
                  <input type="text" value={colors[key]} onChange={(e) => handleChange(key, e.target.value)} className="flex-1 text-xs font-mono px-2 py-1.5 border rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={handleSave} className="flex-1 px-3 py-1 rounded bg-primary text-white">Guardar</button>
        <button onClick={onClose} className="flex-1 px-3 py-1 rounded border">Cancelar</button>
      </div>
    </div>
  )
}

