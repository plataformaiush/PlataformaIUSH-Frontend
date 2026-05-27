import { useEffect, useRef, useState } from 'react'
import { Institution, InstitutionColors, defaultInstitutionColors } from '../../../../domain/institution/types'
import { institutionService, applyTheme } from '../../../../domain/institution/institutionService'
import { useInstitution } from '../../../../context/InstitutionContext'
import { useAuthStore } from '../../../stores/auth.store'
import { buildCertificateHtml } from '../../../../domain/shared/certificateTemplate'

// ─── Constantes de campos de color ───────────────────────────────────────────

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



// ─── Tipos ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | null

// ─── Componente principal ─────────────────────────────────────────────────────

export function PersonalizacionView() {
  const { updateColors } = useInstitution()
  
  // Obtener usuario del store para verificar permisos
  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = user?.roles?.includes('SuperAdmin') ?? false

  const [logo, setLogo]       = useState('')
  const [colors, setColors]   = useState<InstitutionColors>(defaultInstitutionColors)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [toast, setToast]     = useState<{ type: ToastType; msg: string }>({ type: null, msg: '' })

  // Previsualización del certificado
  const [showCertPreview, setShowCertPreview] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // ── Carga inicial ──────────────────────────────────────────────────────────

  useEffect(() => {
    institutionService
      .getConfig()
      .then((data: Institution) => {
        setLogo(data.logo)
        setColors(data.colors)
        applyTheme(data.colors)
      })
      .catch((error) => {
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

  // ── Actualiza el iframe cuando cambian logo o colores ──────────────────────

  useEffect(() => {
    if (!showCertPreview || !iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    doc.open()
    doc.write(buildCertificateHtml(logo, colors))
    doc.close()
  }, [showCertPreview, logo, colors])

  // ── Helpers ────────────────────────────────────────────────────────────────

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

  // ── Estados de carga / error total ────────────────────────────────────────

  // Verificar permisos
  if (!isSuperAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 space-y-3">
        <p className="text-sm text-red-600 font-medium">⚠ Acceso denegado</p>
        <p className="text-xs text-muted-foreground">Solo los SuperAdministradores pueden personalizar la institución</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 space-y-3">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando configuración...</p>
      </div>
    )
  }

  if (
    toast.type === 'error' &&
    !logo &&
    Object.values(colors).every(
      (c) =>
        c ===
        defaultInstitutionColors[
          Object.keys(defaultInstitutionColors)[0] as keyof InstitutionColors
        ],
    )
  ) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 space-y-3">
        <p className="text-sm text-red-600 font-medium">⚠ Error al cargar la configuración</p>
        <p className="text-xs text-muted-foreground">Intenta recargar la página</p>
      </div>
    )
  }

  // ── Render principal ───────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Encabezado */}
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
          Gestión de Personalización
        </h1>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          Identidad visual de la institución
        </p>
      </div>

      {/* ── Logo ── */}
      <div
        className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="p-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: 'var(--color-text-on-dark)',
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider">Logo de la institución</p>
        </div>

        <div className="p-4 space-y-3" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#475569' }}>
              URL del logo
            </label>
            <input
              type="text"
              value={logo}
              onChange={(e) => { setLogo(e.target.value); setLogoError(false) }}
              placeholder="https://mi-institucion.edu/logo.png"
              className="w-full text-sm px-3 py-2 border rounded-lg outline-none"
              style={{
                borderColor: '#E2E8F0',
                backgroundColor: 'var(--color-input)',
                color: '#0F172A',
              }}
            />
          </div>

          <div
            className="flex items-center justify-center p-6 border border-dashed rounded-lg min-h-[120px]"
            style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
          >
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
                <p className="text-xs font-medium mb-1" style={{ color: '#0F172A' }}>
                  No se pudo cargar
                </p>
                <p className="text-[10px]" style={{ color: '#475569' }}>
                  Verifica la URL del logo
                </p>
              </div>
            ) : (
              <p className="text-xs" style={{ color: '#475569' }}>
                 Ingresa una URL para ver el logo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Paleta de colores ── */}
      <div
        className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="p-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: 'var(--color-text-on-dark)',
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider">Paleta de colores</p>
          <p className="text-xs mt-0.5 text-white/80">
            Haz clic en el cuadro de color o escribe el hexadecimal
          </p>
        </div>

        <div className="p-4 space-y-4" style={{ backgroundColor: 'var(--color-muted)' }}>
          {['Colores principales', 'Fondos', 'Texto', 'Bordes'].map((category) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: '#475569' }}>
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {COLOR_FIELDS.filter((f) => f.category === category).map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs mb-1 block" style={{ color: '#475569' }}>
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                      />
                      <input
                        type="text"
                        value={colors[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        maxLength={7}
                        className="flex-1 text-xs font-mono px-2 py-1.5 border rounded-lg outline-none uppercase"
                        style={{
                          borderColor: '#E2E8F0',
                          backgroundColor: 'var(--color-input)',
                          color: '#0F172A',
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

      {/* ── Vista previa de componentes UI ── */}
      <div
        className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="p-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: 'white',
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider">Vista previa</p>
        </div>

        <div className="p-4 space-y-3" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <button
                className="w-full py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.primary }}
              >
                Primario
              </button>
            </div>
            <div>
              <button
                className="w-full py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.secondary }}
              >
                Secundario
              </button>
            </div>
            <div>
              <button
                className="w-full py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.tertiary, color: colors.textBase }}
              >
                Terciario
              </button>
            </div>

            <div
              className="col-span-1 md:col-span-2 lg:col-span-3 p-2 rounded-lg"
              style={{ backgroundColor: '#F8FAFC', borderColor: colors.border, borderWidth: '1px' }}
            >
              <p style={{ color: colors.textBase }}>Texto principal: Como ta muchachos</p>
            </div>

            <div
              className="col-span-1 md:col-span-2 lg:col-span-3 p-2 rounded-lg"
              style={{ backgroundColor: '#F8FAFC', borderColor: colors.border, borderWidth: '1px' }}
            >
              <p style={{ color: colors.textSecondary }}>Texto secundario: Información adicional</p>
            </div>

            <div
              className="col-span-1 md:col-span-2 lg:col-span-3 p-2 rounded-lg"
              style={{
                backgroundColor: 'var(--color-muted)',
                borderColor: colors.border,
                borderWidth: '1px',
              }}
            >
              <p style={{ color: 'var(--color-foreground)' }}>Muted tenue: Fondos mínimos</p>
            </div>

            <div
              className="col-span-1 md:col-span-2 lg:col-span-3 p-4 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              }}
            >
              <p style={{ color: colors.textOnDark }} className="font-semibold">
                Texto sobre fondo oscuro: Headers y gradientes
              </p>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <input
                type="text"
                placeholder="Ejemplo de input"
                className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
                style={{
                  backgroundColor: 'var(--color-input)',
                  borderColor: colors.border,
                  color: colors.textBase,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Plantilla de certificado ── */}
      <div
        className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Header del panel */}
        <div
          className="p-4 flex items-center justify-between cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: 'white',
          }}
          onClick={() => setShowCertPreview((v) => !v)}
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider">Plantilla de certificado</p>
            <p className="text-xs mt-0.5 text-white/80">
              Previsualización con los colores y logo actuales
            </p>
          </div>
          <span
            className="text-white text-lg transition-transform duration-300"
            style={{ transform: showCertPreview ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
          >
            ▾
          </span>
        </div>

        {/* Previsualización escalada del certificado */}
        {showCertPreview && (
          <div className="p-4" style={{ backgroundColor: 'var(--color-muted)' }}>
            {/* Contenedor con scroll horizontal por si la pantalla es pequeña */}
            <div className="overflow-x-auto">
              {/*
                El certificado mide 1240×1754 px.
                Lo escalamos al 50 % → 620×877 px.
                El wrapper tiene ese tamaño para que no colapse.
              */}
              <div style={{ width: 620, height: 877, flexShrink: 0, position: 'relative' }}>
                <iframe
                  ref={iframeRef}
                  title="Previsualización del certificado"
                  style={{
                    width: 1240,
                    height: 1754,
                    border: 'none',
                    transformOrigin: 'top left',
                    transform: 'scale(0.5)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Nota informativa */}
            <p className="text-[10px] mt-2" style={{ color: '#475569' }}>
              * Esta es una previsualización al 50 %. El certificado real mide 1240 × 1754 px. Los campos
              <code className="mx-1 font-mono bg-gray-100 px-1 rounded">{'{{nombre}}'}</code>
              <code className="font-mono bg-gray-100 px-1 rounded">{'{{curso}}'}</code>
              <code className="mx-1 font-mono bg-gray-100 px-1 rounded">{'{{fecha}}'}</code>
              <code className="font-mono bg-gray-100 px-1 rounded">{'{{firma1}}'}</code>
              <code className="mx-1 font-mono bg-gray-100 px-1 rounded">{'{{firma2}}'}</code>
              serán reemplazados por el backend al generar cada certificado.
            </p>
          </div>
        )}
      </div>

      {/* ── Botón de guardar ── */}
      <div
        className="flex items-center gap-3 pt-4"
        style={{ borderTopColor: 'var(--color-border)', borderTopWidth: '1px' }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {toast.type && (
          <div
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
              color:           toast.type === 'success' ? '#166534' : '#991b1b',
              borderColor:     toast.type === 'success' ? '#86efac' : '#fca5a5',
            }}
          >
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  )
}
