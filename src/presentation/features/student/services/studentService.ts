import { createAxiosInstance } from '../../../services/axiosInterceptor'
import { tokenManager } from '../../../services/tokenManager'

const API_URL = 'http://localhost:3000/api'
const ROOT_URL = 'http://localhost:3000' // Base para las rutas que no usan /api

const apiAxiosInstance = createAxiosInstance(API_URL)
const rootAxiosInstance = createAxiosInstance(ROOT_URL)

// ─── Tipos ───
export interface MisCursos {
  idCurso: string
  titulo: string
  descripcion?: string
  thumbnail?: string
  modulosTotal: number
  modulosCompletados: number
  porcentajeProgreso: number
}

export interface CursoDetalle {
  idCurso: string
  idUsuario: string
  titulo: string
  descripcion: string
  activo: boolean
  creacion: string
  modulos: ModuloItem[]
}

export interface ModuloItem {
  idModulo: string
  titulo: string
  descripcion: string | null
  activo: boolean
  orden: number
  contenidosCount: number
  creacion: string
}

export interface ModuloDetalle {
  idModulo: string
  idCurso: string
  titulo: string
  descripcion: string | null
  activo: boolean
  orden: number
  creacion: string
  contenidos: ContenidoItem[]
}

export interface ContenidoItem {
  idContenido: string
  titulo: string
  descripcion: string
  tipo: 'video' | 'texto' | 'archivo' | 'imagen'
  orden: number
  activo: boolean
  creacion: string
}

export interface ContenidoDetalle {
  idContenido: string
  idModulo: string
  titulo: string
  descripcion: string
  tipo: 'video' | 'texto' | 'archivo' | 'imagen'
  urlOTexto: string
  orden: number
  activo: boolean
  creacion: string
}

export interface ProgresoDetalle {
  cursoId: string
  titulo: string
  porcentajeProgreso: number
  modulos: ModuloProgreso[]
}

export interface ModuloProgreso {
  idModulo: string
  titulo: string
  porcentajeProgreso: number
  contenidos: ContenidoProgreso[]
}

export interface ContenidoProgreso {
  idContenido: string
  titulo: string
  completado: boolean
}

export interface Certificado {
  id: string
  userId: string
  courseId: string
  courseName: string
  fecha: string
}

export interface Calificacion {
  id: string
  userId: string
  courseId: string
  grade: number
  creacion: string
}

// ─── Servicios ───
export const studentService = {
  // Obtener todos los cursos disponibles (Endpoint con /api)
  async getAllCursos(): Promise<MisCursos[]> {
    const response = await apiAxiosInstance.get('/cursos')
    return response.data.data ?? response.data
  },

  // Obtener mis cursos inscritos (Endpoint sin /api)
  // Obtener mis cursos inscritos (Endpoint sin /api)
  async getMisCursos(): Promise<MisCursos[]> {
    // Al usar baseURL: ROOT_URL, la petición irá a: http://localhost:3000/progreso/mis-cursos
    const response = await rootAxiosInstance.get('/progreso/mis-cursos', {
      headers: tokenManager.getAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener detalle de curso (Endpoint con /api)
  async getCursoDetalle(cursoId: string): Promise<CursoDetalle> {
    const response = await apiAxiosInstance.get(`/cursos/${cursoId}`)
    return response.data.data
  },

  // Obtener módulos de un curso (Endpoint con /api)
  async getModulos(cursoId: string): Promise<ModuloItem[]> {
    const response = await apiAxiosInstance.get(`/cursos/${cursoId}/modulos`)
    return response.data.data
  },

  // Obtener detalle de módulo (Endpoint con /api)
  async getModuloDetalle(cursoId: string, moduloId: string): Promise<ModuloDetalle> {
    const response = await apiAxiosInstance.get(`/cursos/${cursoId}/modulos/${moduloId}`)
    return response.data.data
  },

  // Obtener contenidos de un módulo (Endpoint con /api)
  async getContenidos(moduloId: string): Promise<ContenidoItem[]> {
    const response = await apiAxiosInstance.get(`/modulos/${moduloId}/contenidos`)
    return response.data.data
  },

  // Obtener detalle de contenido (Endpoint con /api)
  async getContenidoDetalle(moduloId: string, contenidoId: string): Promise<ContenidoDetalle> {
    const response = await apiAxiosInstance.get(`/modulos/${moduloId}/contenidos/${contenidoId}`)
    return response.data.data
  },

  // Marcar contenido como completado (Endpoint sin /api)
  async marcarContenidoCompletado(contenidoId: string): Promise<void> {
    await rootAxiosInstance.post(`/progreso/contenido/${contenidoId}/completar`, {}, {
      headers: tokenManager.getAuthHeaders(),
    })
  },

  // Obtener progreso detallado de curso (Endpoint sin /api)
  async getProgresoDetallado(cursoId: string): Promise<ProgresoDetalle> {
    const response = await rootAxiosInstance.get(`/progreso/curso/${cursoId}`, {
      headers: tokenManager.getAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener mis certificados (Endpoint sin /api)
  async getMisCertificados(): Promise<Certificado[]> {
    const userId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').id
        : null
    if (!userId) throw new Error('User ID not found')
    const response = await rootAxiosInstance.get(`/certificates/${userId}`, {
      headers: tokenManager.getAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener mis calificaciones (Endpoint sin /api)
  async getMisCalificaciones(): Promise<Calificacion[]> {
    const userId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').id
        : null
    if (!userId) throw new Error('User ID not found')
    const response = await rootAxiosInstance.get(`/grades/student/${userId}`, {
      headers: tokenManager.getAuthHeaders(),
    })
    return response.data.data
  },

  // Responder evaluación (Endpoint sin /api)
  async responderEvaluacion(
      contenidoId: string,
      respuestas: Array<{ id_pregunta: string; respuesta: string }>
  ): Promise<any> {
    const response = await rootAxiosInstance.post(`/evaluaciones/contenido/${contenidoId}/responder`, {
      respuestas,
    }, {
      headers: tokenManager.getAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener resultado de evaluación (Endpoint sin /api)
  async getResultadoEvaluacion(contenidoId: string, userId: string): Promise<any> {
    const response = await rootAxiosInstance.get(`/evaluaciones/contenido/${contenidoId}/resultado/${userId}`, {
      headers: tokenManager.getAuthHeaders(),
    })
    return response.data.data
  },
}