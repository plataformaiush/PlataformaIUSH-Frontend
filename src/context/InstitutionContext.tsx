import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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

const POLLING_INTERVAL = 60000 // 60 segundos

// Función para generar hash simple de los datos de institución
function generateConfigHash(data: Institution): string {
  return JSON.stringify(data)
}

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState('')
  const [colors, setColors] = useState(defaultInstitutionColors)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [hasConnectionError, setHasConnectionError] = useState(false)
  const previousConfigHashRef = useRef<string>('')

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
      const currentHash = generateConfigHash(data)
      
      // Solo actualizar si los datos cambiaron
      if (currentHash !== previousConfigHashRef.current) {
        previousConfigHashRef.current = currentHash
        setLogo(data.logo)
        setColors(data.colors)
        institutionStorageService.setLogo(data.logo)
        saveColorsToStorage(data.colors)
      }
      
      setAuthError(false)
      setHasConnectionError(false)
    } catch (error) {
      const errorMessage = String(error)
      
      // Detectar si es error de autenticación
      if (isAuthenticationError(error)) {
        setAuthError(true)
      }
      
      // Detectar si es error de conexión (no 401)
      if (!errorMessage.includes('HTTP 401') && errorMessage.includes('ERR_')) {
        setHasConnectionError(true)
        console.error('Connection error - polling stopped:', error)
      } else if (!errorMessage.includes('HTTP 401')) {
        console.error('Error loading institution config:', error)
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
    // Se detiene si hay error de autenticación (401) o error de conexión
    const interval = setInterval(() => {
      if (!authError && !hasConnectionError) {
        loadConfig()
      }
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [authError, hasConnectionError])

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
