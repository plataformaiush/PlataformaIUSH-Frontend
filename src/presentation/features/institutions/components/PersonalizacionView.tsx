import { useEffect, useState } from 'react'
import { Institution, InstitutionColors, defaultInstitutionColors } from '../../../../domain/institution/types'
import { institutionService, applyTheme } from '../../../../domain/institution/institutionService'
import { useInstitution } from '../../../../context/InstitutionContext'

const COLOR_FIELDS: { key: keyof InstitutionColors; label: string; category: string }[] = [
  // Colores principales
  { key: 'primary', label: 'Primary - Botones principales', category: 'Colores principales' },
  { key: 'secondary', label: 'Secondary - Botones secundarios', category: 'Colores principales' },
  { key: 'tertiary', label: 'Tertiary - Botones alternativos', category: 'Colores principales' },
  // Colores de fondo
  { key: 'background', label: 'Background - Fondo de la página', category: 'Fondos' },
  { key: 'input', label: 'Input - Fondo de campos de entrada', category: 'Fondos' },
  // Colores de texto
  { key: 'textBase', label: 'Foreground - Texto principal', category: 'Texto' },
  { key: 'textSecondary', label: 'Muted Foreground - Texto secundario', category: 'Texto' },
  { key: 'textTertiary', label: 'Muted - Colores suaves', category: 'Texto' },
  // Colores de bordes
  { key: 'border', label: 'Border - Bordes', category: 'Bordes' },
]

type ToastType = 'success' | 'error' | null

export function PersonalizacionView() {
  const { updateColors } = useInstitution()
  const [logo, setLogo] = useState('')
  const [colors, setColors] = useState<InstitutionColors>(defaultInstitutionColors)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; msg: string }>({ type: null, msg: '' })

  useEffect(() => {
    institutionService
      .getConfig()
      .then((data: Institution) => {
        setLogo(data.logo)
        setColors(data.colors)
        applyTheme(data.colors)
      })
      .catch((error) => {
        // Silenciar errores de autenticación (token expirado)
        const errorMessage = String(error)
        if (!errorMessage.includes('HTTP 401')) {
          console.error('Error loading config:', error)
        }
        const token = localStorage.getItem('token')
        const message = !token 
          ? 'Token no encontrado. Por favor inicia sesión'
          : `Error: ${error.message}`
        showToast('error', message)
      })
      .finally(() => setLoading(false))
  }, [])

  function showToast(type: ToastType, msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast({ type: null, msg: '' }), 3000)
  }

  function handleColorChange(key: keyof InstitutionColors, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await institutionService.updateConfig({ logo, colors })
      setLogo(updated.logo)
      setColors(updated.colors)
      updateColors(updated.colors)
      showToast('success', 'Cambios guardados correctamente')
    } catch {
      showToast('error', 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 space-y-3">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Cargando configuración...</p>
      </div>
    )
  }

  if (toast.type === 'error' && !logo && Object.values(colors).every(c => c === defaultInstitutionColors[Object.keys(defaultInstitutionColors)[0] as keyof InstitutionColors])) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 space-y-3">
        <p className="text-sm text-red-600 font-medium">⚠ Error al cargar la configuración</p>
        <p className="text-xs text-muted-foreground">Intenta recargar la página</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Personalización</h1>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Identidad visual de la institución</p>
      </div>

      {/* Logo */}
      <div className="border rounded-xl p-4 space-y-3" 
        style={{ 
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)'
        }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Logo de la institución</p>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--color-muted-foreground)' }}>URL del logo</label>
          <input
            type="text"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://mi-institucion.edu/logo.png"
            className="w-full text-sm px-3 py-2 border rounded-lg outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-input)',
              color: 'var(--color-foreground)'
            }}
          />
        </div>
        <div className="flex items-center justify-center p-6 border border-dashed rounded-lg min-h-[120px]"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-muted)'
          }}>
          {logo && !logoError ? (
            <img
              src={logo}
              alt="Logo preview"
              className="max-h-20 max-w-full rounded object-contain"
              onError={() => setLogoError(true)}
              onLoad={() => setLogoError(false)}
            />
          ) : logo && logoError ? (
            <div className="text-center">
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>❌ No se pudo cargar</p>
              <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>Verifica la URL del logo</p>
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>📷 Ingresa una URL para ver el logo</p>
          )}
        </div>
      </div>

      {/* Colores */}
      <div className="border rounded-xl p-4 space-y-3" 
        style={{ 
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)'
        }}>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Paleta de colores</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
            Haz clic en el cuadro de color o escribe el hexadecimal
          </p>
        </div>

        <div className="space-y-4">
          {['Colores principales', 'Fondos', 'Texto', 'Bordes'].map((category) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {COLOR_FIELDS.filter((f) => f.category === category).map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-muted-foreground)' }}>
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-background)'
                        }}
                      />
                      <input
                        type="text"
                        value={colors[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        maxLength={7}
                        className="flex-1 text-xs font-mono px-2 py-1.5 border rounded-lg outline-none uppercase"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-input)',
                          color: 'var(--color-foreground)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vista previa de colores en componentes */}
      <div className="border rounded-xl p-4 space-y-3" 
        style={{ 
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)'
        }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Vista previa</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Botón primario */}
          <div>
            <button className="w-full py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.primary }}>
              Primario
            </button>
          </div>

          {/* Botón secundario */}
          <div>
            <button className="w-full py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.secondary }}>
              Secundario
            </button>
          </div>

          {/* Botón terciario */}
          <div>
            <button className="w-full py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.tertiary, color: colors.textBase }}>
              Terciario
            </button>
          </div>

          {/* Texto principal */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-2 rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: '1px' }}>
            <p style={{ color: colors.textBase }}>Texto principal: Como ta muchachos</p>
          </div>

          {/* Texto secundario */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-2 rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: '1px' }}>
            <p style={{ color: colors.textSecondary }}>Texto secundario: Information adicional</p>
          </div>

          {/* Texto tenue */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-2 rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: '1px' }}>
            <p style={{ color: colors.textTertiary }}>Texto tenue: Detalles mínimos</p>
          </div>

          {/* Input */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <input type="text" placeholder="Ejemplo de input"
              className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.textBase
              }} />
          </div>
        </div>
      </div>

      {/* Botón de guardar - Fijo al final */}
      <div className="flex items-center gap-3 pt-4" style={{ borderTopColor: 'var(--color-border)', borderTopWidth: '1px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {toast.type && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: toast.type === 'success' ? '#166534' : '#991b1b',
              borderColor: toast.type === 'success' ? '#86efac' : '#fca5a5'
            }}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  )
}
