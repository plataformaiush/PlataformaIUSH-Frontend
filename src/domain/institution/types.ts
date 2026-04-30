// Personalización por institución - Requisito del correo
 
export interface Institution {
  id: string
  name: string
  logo: string
  colors: InstitutionColors
  settings: InstitutionSettings
}
 
export interface InstitutionColors {
  background: string      // --color-background (fondo_principal)
  textBase: string        // --color-foreground (texto_principal)
  primary: string         // --color-primary (fondo_secundario_menu)
  secondary: string       // --color-secondary (acentos_secundarios)
  tertiary: string        // --color-tertiary (acentos_terciarios)
  textSecondary: string   // --color-muted-foreground (texto_secundario)
  textTertiary: string    // --color-muted (texto_tenue)
  border: string          // --color-border (bordes)
  input: string           // --color-input (inputs)
}
 
export interface InstitutionSettings {
  customDomain?: string
  primaryColor: string
  secondaryColor: string
  allowCustomBranding: boolean
  subscriptionActive: boolean
}
 
export const defaultInstitutionColors: InstitutionColors = {
  background: '#F8FAFC',
  textBase: '#0F172A',
  primary: '#1E40AF',
  secondary: '#0891B2',
  tertiary: '#AEEDF2',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  input: '#FFFFFF',
}

export const generateCSSVariables = (colors: InstitutionColors) => ({
  '--color-background': colors.background,
  '--color-foreground': colors.textBase,
  '--color-primary': colors.primary,
  '--color-secondary': colors.secondary,
  '--color-tertiary': colors.tertiary,
  '--color-muted-foreground': colors.textSecondary,
  '--color-muted': colors.textTertiary,
  '--color-border': colors.border,
  '--color-input': colors.input,
})