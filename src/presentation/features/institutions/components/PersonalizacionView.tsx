import { useEffect, useRef, useState } from 'react'
import { Institution, InstitutionColors, defaultInstitutionColors } from '../../../../domain/institution/types'
import { institutionService, applyTheme } from '../../../../domain/institution/institutionService'
import { useInstitution } from '../../../../context/InstitutionContext'

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

// ─── Generador del HTML del certificado ──────────────────────────────────────

function buildCertificateHtml(logo: string, colors: InstitutionColors): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Certificado</title>
<style>
  :root {
    --color-background: ${colors.background};
    --color-foreground: ${colors.textBase};
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-tertiary: ${colors.tertiary};
    --color-muted: ${colors.textTertiary};
    --color-muted-foreground: ${colors.textSecondary};
    --color-border: ${colors.border};
    --color-input: ${colors.input};
    --color-text-on-dark: ${colors.textOnDark};
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #e5e7eb;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px;
    font-family: 'Georgia', 'Times New Roman', serif;
  }
  .certificate-wrapper { width: 1240px; height: 1754px; position: relative; flex-shrink: 0; }
  .certificate {
    width: 1240px; height: 1754px;
    background-color: var(--color-background);
    position: absolute; top: 0; left: 0; overflow: hidden;
  }
  .border-outer {
    position: absolute; top: 28px; left: 28px; right: 28px; bottom: 28px;
    border: 3px solid var(--color-primary);
  }
  .border-inner {
    position: absolute; top: 42px; left: 42px; right: 42px; bottom: 42px;
    border: 1px solid var(--color-secondary);
  }
  .corner { position: absolute; width: 60px; height: 60px; }
  .corner svg { width: 60px; height: 60px; }
  .corner-tl { top: 18px; left: 18px; }
  .corner-tr { top: 18px; right: 18px; transform: scaleX(-1); }
  .corner-bl { bottom: 18px; left: 18px; transform: scaleY(-1); }
  .corner-br { bottom: 18px; right: 18px; transform: scale(-1); }
  .top-band {
    position: absolute; top: 56px; left: 56px; right: 56px; height: 8px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-tertiary), var(--color-secondary), var(--color-primary));
  }
  .bottom-band {
    position: absolute; bottom: 56px; left: 56px; right: 56px; height: 8px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-tertiary), var(--color-secondary), var(--color-primary));
  }
  .watermark {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 520px; height: 520px;
    opacity: 0.06;
    display: flex; align-items: center; justify-content: center;
  }
  .watermark img { width: 100%; height: 100%; object-fit: contain; filter: grayscale(100%); }
  .logo-header {
    position: absolute; top: 90px; left: 0; right: 0;
    display: flex; justify-content: center; align-items: center; height: 90px;
  }
  .logo-header img { max-height: 80px; max-width: 240px; object-fit: contain; }
  .divider-top {
    position: absolute; top: 200px; left: 120px; right: 120px;
    display: flex; align-items: center; gap: 0;
  }
  .divider-line { flex: 1; height: 1px; background: var(--color-secondary); }
  .divider-diamond {
    width: 8px; height: 8px; background: var(--color-primary);
    transform: rotate(45deg); flex-shrink: 0; margin: 0 10px;
  }
  .cert-title {
    position: absolute; top: 228px; left: 0; right: 0;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 72px; font-weight: bold; letter-spacing: 18px;
    color: var(--color-primary); text-transform: uppercase;
  }
  .cert-subtitle-ornament {
    position: absolute; top: 332px; left: 0; right: 0;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 18px; letter-spacing: 6px;
    color: var(--color-secondary); text-transform: uppercase;
  }
  .divider-mid {
    position: absolute; top: 376px; left: 120px; right: 120px;
    display: flex; align-items: center;
  }
  .cert-intro {
    position: absolute; top: 420px; left: 0; right: 0;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 26px; color: var(--color-muted-foreground);
    font-style: italic; letter-spacing: 1px;
  }
  .cert-name {
    position: absolute; top: 490px; left: 100px; right: 100px;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 86px; font-weight: bold;
    color: var(--color-primary); line-height: 1.1; word-break: break-word;
  }
  .name-underline {
    position: absolute; top: 638px; left: 180px; right: 180px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-secondary), transparent);
  }
  .cert-connective {
    position: absolute; top: 658px; left: 0; right: 0;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 24px; color: var(--color-muted-foreground); font-style: italic;
  }
  .cert-course-label {
    position: absolute; top: 710px; left: 0; right: 0;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 16px; letter-spacing: 5px;
    text-transform: uppercase; color: var(--color-secondary);
  }
  .cert-course {
    position: absolute; top: 748px; left: 120px; right: 120px;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 46px; font-weight: bold;
    color: var(--color-foreground); line-height: 1.2; word-break: break-word;
  }
  .cert-date-divider {
    position: absolute; top: 910px; left: 400px; right: 400px;
    height: 1px; background: var(--color-border);
  }
  .cert-date-label {
    position: absolute; top: 928px; left: 0; right: 0;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 15px; letter-spacing: 4px;
    text-transform: uppercase; color: var(--color-secondary);
  }
  .cert-date {
    position: absolute; top: 960px; left: 0; right: 0;
    text-align: center; font-family: 'Georgia', serif;
    font-size: 28px; color: var(--color-foreground); letter-spacing: 2px;
  }
  .seal {
    position: absolute; top: 1040px; left: 50%;
    transform: translateX(-50%); width: 160px; height: 160px;
  }
  .seal svg { width: 160px; height: 160px; }
  .signatures {
    position: absolute; bottom: 130px; left: 100px; right: 100px;
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .signature-block { width: 340px; text-align: center; }
  .signature-line { width: 100%; height: 1px; background: var(--color-foreground); margin-bottom: 10px; }
  .signature-name {
    font-family: 'Georgia', serif; font-size: 20px; font-weight: bold;
    color: var(--color-foreground); letter-spacing: 1px; margin-bottom: 4px;
  }
  .signature-role {
    font-family: 'Georgia', serif; font-size: 14px;
    color: var(--color-muted-foreground); letter-spacing: 2px; text-transform: uppercase;
  }
  @media print {
    body { background: none; padding: 0; }
    .certificate-wrapper, .certificate { width: 1240px; height: 1754px; }
  }
</style>
</head>
<body>
<div class="certificate-wrapper">
  <div class="certificate">
    <div class="watermark">
      <img src="${logo}" alt="Marca de agua" onerror="this.style.display='none'" />
    </div>
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="corner corner-tl">
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 56" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L56 4" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L22 22" stroke="${colors.secondary}" stroke-width="1.5"/>
        <circle cx="4" cy="4" r="4" fill="${colors.primary}"/>
        <circle cx="22" cy="4" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <circle cx="4" cy="22" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <rect x="10" y="10" width="6" height="6" fill="${colors.tertiary}" transform="rotate(45 13 13)"/>
      </svg>
    </div>
    <div class="corner corner-tr">
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 56" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L56 4" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L22 22" stroke="${colors.secondary}" stroke-width="1.5"/>
        <circle cx="4" cy="4" r="4" fill="${colors.primary}"/>
        <circle cx="22" cy="4" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <circle cx="4" cy="22" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <rect x="10" y="10" width="6" height="6" fill="${colors.tertiary}" transform="rotate(45 13 13)"/>
      </svg>
    </div>
    <div class="corner corner-bl">
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 56" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L56 4" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L22 22" stroke="${colors.secondary}" stroke-width="1.5"/>
        <circle cx="4" cy="4" r="4" fill="${colors.primary}"/>
        <circle cx="22" cy="4" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <circle cx="4" cy="22" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <rect x="10" y="10" width="6" height="6" fill="${colors.tertiary}" transform="rotate(45 13 13)"/>
      </svg>
    </div>
    <div class="corner corner-br">
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 56" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L56 4" stroke="${colors.primary}" stroke-width="2.5"/>
        <path d="M4 4 L22 22" stroke="${colors.secondary}" stroke-width="1.5"/>
        <circle cx="4" cy="4" r="4" fill="${colors.primary}"/>
        <circle cx="22" cy="4" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <circle cx="4" cy="22" r="3" fill="${colors.secondary}" opacity="0.5"/>
        <rect x="10" y="10" width="6" height="6" fill="${colors.tertiary}" transform="rotate(45 13 13)"/>
      </svg>
    </div>
    <div class="top-band"></div>
    <div class="bottom-band"></div>
    <div class="logo-header">
      <img src="${logo}" alt="Logo institucional" onerror="this.style.display='none'" />
    </div>
    <div class="divider-top">
      <div class="divider-line"></div>
      <div class="divider-diamond"></div>
      <div class="divider-line"></div>
      <div class="divider-diamond"></div>
      <div class="divider-line"></div>
    </div>
    <div class="cert-title">Certificado</div>
    <div class="cert-subtitle-ornament">de participación</div>
    <div class="divider-mid">
      <div class="divider-line"></div>
      <div class="divider-diamond"></div>
      <div class="divider-line"></div>
    </div>
    <div class="cert-intro">La institución certifica que</div>
    <div class="cert-name">{{nombre}}</div>
    <div class="name-underline"></div>
    <div class="cert-connective">ha completado satisfactoriamente el curso</div>
    <div class="cert-course-label">Programa académico</div>
    <div class="cert-course">{{curso}}</div>
    <div class="cert-date-divider"></div>
    <div class="cert-date-label">Fecha de emisión</div>
    <div class="cert-date">{{fecha}}</div>
    <div class="seal">
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="74" stroke="${colors.primary}" stroke-width="2"/>
        <circle cx="80" cy="80" r="66" stroke="${colors.secondary}" stroke-width="1"/>
        <circle cx="80" cy="80" r="58" stroke="${colors.tertiary}" stroke-width="1.5"/>
        <circle cx="80" cy="80" r="44" fill="${colors.primary}" opacity="0.06"/>
        <line x1="80" y1="36" x2="80" y2="124" stroke="${colors.secondary}" stroke-width="1" opacity="0.4"/>
        <line x1="36" y1="80" x2="124" y2="80" stroke="${colors.secondary}" stroke-width="1" opacity="0.4"/>
        <line x1="51" y1="51" x2="109" y2="109" stroke="${colors.secondary}" stroke-width="1" opacity="0.3"/>
        <line x1="109" y1="51" x2="51" y2="109" stroke="${colors.secondary}" stroke-width="1" opacity="0.3"/>
        <rect x="72" y="72" width="16" height="16" fill="${colors.primary}" transform="rotate(45 80 80)" opacity="0.7"/>
        <circle cx="80" cy="6" r="3" fill="${colors.secondary}"/>
        <circle cx="80" cy="154" r="3" fill="${colors.secondary}"/>
        <circle cx="6" cy="80" r="3" fill="${colors.secondary}"/>
        <circle cx="154" cy="80" r="3" fill="${colors.secondary}"/>
      </svg>
    </div>
    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">{{firma1}}</div>
        <div class="signature-role">Firma &amp; cargo</div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">{{firma2}}</div>
        <div class="signature-role">Firma &amp; cargo</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | null

// ─── Componente principal ─────────────────────────────────────────────────────

export function PersonalizacionView() {
  const { updateColors } = useInstitution()

  const [logo, setLogo]       = useState('')
  const [colors, setColors]   = useState<InstitutionColors>(defaultInstitutionColors)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [savingCertificate, setSavingCertificate] = useState(false)
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

  async function handleSaveCertificate() {
    setSavingCertificate(true)
    try {
      const certificateHtml = buildCertificateHtml(logo, colors)
      // Llamar al endpoint específico para guardar el certificado
      await institutionService.saveCertificateTemplate(certificateHtml)
      showToast('success', 'Plantilla de certificado guardada correctamente')
    } catch {
      showToast('error', 'Error al guardar la plantilla de certificado')
    } finally {
      setSavingCertificate(false)
    }
  }

  // ── Estados de carga / error total ────────────────────────────────────────

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
          Personalización
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
                  ❌ No se pudo cargar
                </p>
                <p className="text-[10px]" style={{ color: '#475569' }}>
                  Verifica la URL del logo
                </p>
              </div>
            ) : (
              <p className="text-xs" style={{ color: '#475569' }}>
                📷 Ingresa una URL para ver el logo
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

            {/* Botón de guardar certificado */}
            <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTopColor: 'var(--color-border)', borderTopWidth: '1px' }}>
              <button
                onClick={handleSaveCertificate}
                disabled={savingCertificate}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                {savingCertificate ? 'Guardando plantilla...' : 'Guardar plantilla de certificado'}
              </button>
            </div>
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
