/**
 * Servicio centralizado para manejar el localStorage de la institución
 * Proporciona un único punto de entrada para persistencia de datos de institución
 */

import { Institution } from './types'

interface StoredInstitution {
  logo: string
  name: string
}

const INSTITUTION_KEY = 'institution'
const LOGO_KEY = 'institutionLogo' // Mantener para compatibilidad
const COLORS_KEY = 'institutionColors'

export const institutionStorageService = {
  /**
   * Obtiene el logo guardado en localStorage
   */
  getLogo(): string {
    const stored = this.getInstitution()
    return stored?.logo || localStorage.getItem(LOGO_KEY) || ''
  },

  /**
   * Guarda el logo en localStorage
   */
  setLogo(logo: string): void {
    const stored = this.getInstitution()
    const data: StoredInstitution = {
      logo,
      name: stored?.name || '',
    }
    this.setInstitution(data)
    // Mantener compatibilidad con la clave antigua
    localStorage.setItem(LOGO_KEY, logo)
  },

  /**
   * Obtiene el nombre guardado en localStorage
   */
  getName(): string {
    return this.getInstitution()?.name || ''
  },

  /**
   * Guarda el nombre en localStorage
   */
  setName(name: string): void {
    const stored = this.getInstitution()
    const data: StoredInstitution = {
      logo: stored?.logo || '',
      name,
    }
    this.setInstitution(data)
  },

  /**
   * Obtiene todos los datos de institución guardados
   */
  getInstitution(): StoredInstitution | null {
    const stored = localStorage.getItem(INSTITUTION_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      console.error('Error al parsear institución guardada')
      return null
    }
  },

  /**
   * Guarda todos los datos de institución
   */
  setInstitution(data: StoredInstitution): void {
    localStorage.setItem(INSTITUTION_KEY, JSON.stringify(data))
  },

  /**
   * Limpia todos los datos de institución del localStorage
   */
  clearInstitution(): void {
    localStorage.removeItem(INSTITUTION_KEY)
    localStorage.removeItem(LOGO_KEY)
  },

  /**
   * Verifica si hay datos de institución guardados
   */
  hasInstitution(): boolean {
    return localStorage.getItem(INSTITUTION_KEY) !== null || localStorage.getItem(LOGO_KEY) !== null
  },

  /**
   * Obtiene los colores guardados en localStorage
   */
  getColors(): Institution['colors'] | null {
    const stored = localStorage.getItem(COLORS_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      console.error('Error al parsear colores guardados')
      return null
    }
  },

  /**
   * Guarda los colores en localStorage
   */
  setColors(colors: Institution['colors']): void {
    localStorage.setItem(COLORS_KEY, JSON.stringify(colors))
  },

  /**
   * Limpia los colores del localStorage
   */
  clearColors(): void {
    localStorage.removeItem(COLORS_KEY)
  },

  /**
   * Limpia TODOS los datos de institución (logo, nombre, colores)
   */
  clearAll(): void {
    this.clearInstitution()
    this.clearColors()
  },
}
