import { Institution, InstitutionColors, generateCSSVariables, defaultInstitutionColors } from './types'
import { TokenManager } from '../auth/tokenManager'

const API_BASE = 'http://localhost:3000'
const BASE = `${API_BASE}/api/institucion`

function authHeaders(): HeadersInit {
  const token = TokenManager.getToken() ?? ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

/**
 * Normaliza la respuesta del backend a la estructura esperada por el frontend
 * Mapeo directo (sin duplicados):
 * - background_color → background (fondo principal)
 * - text_primary → textBase (texto principal)
 * - primary_color → primary (fondo secundario/menu)
 * - secondary_color → secondary (acentos secundarios)
 * - tertiary_color → tertiary (acentos terciarios)
 * - text_secondary → textSecondary (texto secundario)
 * - text_tertiary → textTertiary (texto tenue)
 * - border_color → border (bordes)
 * - input_color → input (inputs)
 */
function normalizeInstitutionData(data: any): Institution {
  return {
    id: data.id || '',
    name: data.name || '',
    logo: data.logo_url || data.logo || '',
    colors: {
      background: data.background_color || defaultInstitutionColors.background,
      textBase: data.text_primary || defaultInstitutionColors.textBase,
      primary: data.primary_color || defaultInstitutionColors.primary,
      secondary: data.secondary_color || defaultInstitutionColors.secondary,
      tertiary: data.tertiary_color || defaultInstitutionColors.tertiary,
      textSecondary: data.text_secondary || defaultInstitutionColors.textSecondary,
      textTertiary: data.text_tertiary || defaultInstitutionColors.textTertiary,
      border: data.border_color || defaultInstitutionColors.border,
      input: data.input_color || defaultInstitutionColors.input,
    },
    settings: data.settings || {},
  }
}

export const institutionService = {
  async getConfig(): Promise<Institution> {
    const token = TokenManager.getToken()
    
    if (!token) {
      throw new Error('Sin token de autenticación')
    }

    try {
      const res = await fetch(`${BASE}/config`, { headers: authHeaders() })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(`HTTP ${res.status}: ${errorData.message || res.statusText}`)
      }
      
      const data = await res.json()
      return normalizeInstitutionData(data)
    } catch (error) {
      // Solo loguear si no es un error 401 (token expirado)
      const errorMessage = String(error)
      if (!errorMessage.includes('HTTP 401')) {
        console.error('getConfig error:', error)
      }
      throw error
    }
  },

  async updateConfig(data: Partial<Pick<Institution, 'logo' | 'colors'>>): Promise<Institution> {
    const token = TokenManager.getToken()
    
    if (!token) {
      throw new Error('Sin token de autenticación')
    }

    try {
      // Transformar la estructura al formato que espera el backend
      const payload: any = {}
      
      if (data.logo) {
        payload.logo_url = data.logo
      }
      
      if (data.colors) {
        payload.background_color = data.colors.background
        payload.text_primary = data.colors.textBase
        payload.primary_color = data.colors.primary
        payload.secondary_color = data.colors.secondary
        payload.tertiary_color = data.colors.tertiary
        payload.text_secondary = data.colors.textSecondary
        payload.text_tertiary = data.colors.textTertiary
        payload.border_color = data.colors.border
        payload.input_color = data.colors.input
      }

      const res = await fetch(`${BASE}/config`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(`HTTP ${res.status}: ${errorData.message || res.statusText}`)
      }
      
      const responseData = await res.json()
      return normalizeInstitutionData(responseData)
    } catch (error) {
      console.error('updateConfig error:', error)
      throw error
    }
  },
}

// Aplica los colores de la institución en toda la app
// Mapea las variables propias (--bg-color, etc.) y las globales del proyecto
export function applyTheme(colors: InstitutionColors): void {
  const root = document.documentElement
  const cssVars = generateCSSVariables(colors)

  // Variables propias definidas en types.ts
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Variables globales del proyecto - mapeo según especificación
  root.style.setProperty('--color-background', colors.background)
  root.style.setProperty('--color-foreground', colors.textBase)
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-secondary', colors.secondary)
  root.style.setProperty('--color-tertiary', colors.tertiary)
  root.style.setProperty('--color-muted-foreground', colors.textSecondary)
  root.style.setProperty('--color-muted', colors.textTertiary)
  root.style.setProperty('--color-border', colors.border)
  root.style.setProperty('--color-input', colors.input)
}
