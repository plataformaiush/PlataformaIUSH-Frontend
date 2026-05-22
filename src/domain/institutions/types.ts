// Personalización por institución - Requisito del correo

export interface Institution {
  id: string
  name: string
  logo: string  // Logo personalizable
  colors: InstitutionColors  // 5 niveles de colores hex
  settings: InstitutionSettings
}

export interface InstitutionColors {
  background: string      // Fondos
  textBase: string        // Textos base
  textPrimary: string     // Texto primario
  textSecondary: string   // Texto secundario
  textTertiary: string    // Texto terciario
}

export interface InstitutionSettings {
  customDomain?: string
  primaryColor: string
  secondaryColor: string
  allowCustomBranding: boolean
  subscriptionActive: boolean
}

// Ejemplo de implementación
export const defaultInstitutionColors: InstitutionColors = {
  background: '#ffffff',
  textBase: '#374151',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af'
}

// CSS Variables para personalización dinámica
export const generateCSSVariables = (colors: InstitutionColors) => ({
  '--bg-color': colors.background,
  '--text-base': colors.textBase,
  '--text-primary': colors.textPrimary,
  '--text-secondary': colors.textSecondary,
  '--text-tertiary': colors.textTertiary,
})
