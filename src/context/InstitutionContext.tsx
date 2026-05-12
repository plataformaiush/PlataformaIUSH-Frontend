import React, { createContext, useContext, useEffect, useState } from 'react'
import { institutionService, applyTheme } from '../domain/institution/institutionService'
import { institutionStorageService } from '../domain/institution/institutionStorageService'
import { Institution, defaultInstitutionColors } from '../domain/institution/types'

interface InstitutionContextType {
  logo: string
  colors: Institution['colors']
  loading: boolean
  refreshConfig: () => Promise<void>
  updateColors: (newColors: Institution['colors']) => void
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined)

const POLLING_INTERVAL = 5000 // 5 segundos

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState('')
  const [colors, setColors] = useState(defaultInstitutionColors)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)

  // Cargar colores desde el servicio de almacenamiento
  const getStoredColors = () => {
    try {
      return institutionStorageService.getColors() || defaultInstitutionColors
    } catch {
      return defaultInstitutionColors
    }
  }

  // Guardar colores en el servicio de almacenamiento
  const saveColorsToStorage = (newColors: Institution['colors']) => {
    institutionStorageService.setColors(newColors)
    applyTheme(newColors)
  }

  const isAuthenticationError = (error: unknown): boolean => {
    const errorMessage = String(error)
    return errorMessage.includes('HTTP 401') || errorMessage.includes('Sin token')
  }

  const loadConfig = async () => {
    try {
      const data = await institutionService.getConfig()
      setLogo(data.logo)
      setColors(data.colors)
      institutionStorageService.setLogo(data.logo)
      saveColorsToStorage(data.colors)
      setAuthError(false)
    } catch (error) {
      // Silenciar errores de autenticación (token expirado)
      const errorMessage = String(error)
      if (!errorMessage.includes('HTTP 401')) {
        console.error('Error loading institution config:', error)
      }
      // Detectar si es error de autenticación
      if (isAuthenticationError(error)) {
        setAuthError(true)
      }
      // Cargar desde almacenamiento como fallback
      const storedColors = getStoredColors()
      setColors(storedColors)
      applyTheme(storedColors)
    } finally {
      setLoading(false)
    }
  }

  const updateColors = (newColors: Institution['colors']) => {
    setColors(newColors)
    saveColorsToStorage(newColors)
  }

  useEffect(() => {
    // Cargar colores del almacenamiento al iniciar (rápido)
    const storedColors = getStoredColors()
    setColors(storedColors)
    applyTheme(storedColors)

    const storedLogo = institutionStorageService.getLogo()
    if (storedLogo) setLogo(storedLogo)

    // Sincronizar con backend
    loadConfig()

    // Polling periódico para detectar cambios desde otros dispositivos/pestañas
    // Se detiene si hay error de autenticación (401)
    const interval = setInterval(() => {
      if (!authError) {
        loadConfig()
      }
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [authError])

  return (
    <InstitutionContext.Provider value={{ logo, colors, loading, refreshConfig: loadConfig, updateColors }}>
      {children}
    </InstitutionContext.Provider>
  )
}

export function useInstitution() {
  const context = useContext(InstitutionContext)
  if (!context) {
    throw new Error('useInstitution must be used within InstitutionProvider')
  }
  return context
}
