import { createAxiosInstance } from '../../../services/axiosInterceptor'
import { tokenManager } from '../../../services/tokenManager'

const API_URL = 'http://localhost:3000/api'
const ROOT_URL = 'http://localhost:3000' // Base para las rutas que no usan /api

const apiAxiosInstance = createAxiosInstance(API_URL)
const rootAxiosInstance = createAxiosInstance(ROOT_URL)

function getStudentAuthHeaders() {
  return tokenManager.getAuthHeaders()
}

// ─── Tipos ───
export interface MisCursos {
  idCurso: string
  titulo: string
  descripcion?: string
  thumbnail?: string
  idImagen?: string | null
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
  idImagen?: string | null
  creacion: string
  actualizacion?: string
  modulos: ModuloItem[]
  nombreUsuario?: string
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
  courseName: string | null
  nombreEstudiante: string | null
  issuedAt: string
  url?: string
}

export interface Calificacion {
  id: string
  userId: string
  courseId: string
  grade: number
  creacion: string
}

export interface ValidarInscripcionResponse {
  success: boolean
  enrolled: boolean
}

export interface InscripcionPayload {
  idCurso: string
  idUsuario: string
  fechaInicio: string
}

export interface ProgresoCurso {
  idProgresoCurso: string
  idUsuario: string
  idCurso: string
  porcentaje: number
  contenidosCompletados: number
  totalContenidos: number
  completado: boolean
  aprobado: boolean
  fechaInicio: string
  fechaCompletado: string | null
}

export interface ContenidoEnModulo {
  idContenido: string
  titulo: string
  descripcion: string
  tipo: 'video' | 'texto' | 'archivo' | 'imagen'
  url_o_texto?: string
  orden: number
  activo: boolean
  creacion: string
  actualizacion?: string
  completado?: boolean
  completadoEn?: string | null
}

export interface ModuloConContenidos {
  idModulo: string
  titulo: string
  descripcion: string | null
  activo: boolean
  orden: number
  creacion: string
  actualizacion: string
  contenidosCompletados: number
  totalContenidos: number
  porcentaje: number
  contenidos: ContenidoEnModulo[]
}

export interface CursoDetalleConProgreso {
  curso: CursoDetalle
  progresoCurso: ProgresoCurso
  modulos: ModuloConContenidos[]
}

export interface CursoInscritoBackend {
  id_inscripcion: string
  inscripcion_fecha_inicio: string
  inscripcion_fecha_finalizacion: string | null
  id_curso: string
  id_creador_curso: string
  titulo: string
  descripcion: string
  curso_activo: boolean
  curso_creacion: string
  porcentaje_progreso: string
  contenidos_completados: number
  modulos_total: number
  completado: boolean
  aprobado: boolean
  thumbnail?: string
}

// ─── Servicios ───
export const studentService = {
  // Devuelve la URL del endpoint público que stremea los bytes de la imagen del curso.
  // El backend (Equipo 2) sirve los bytes en GET /api/documentos/:id/descargar con
  // Content-Type image/* — el navegador la usa como <img src> sin necesidad de fetch previo.
  getImagenUrl(idImagen: string | null | undefined): string | null {
    if (!idImagen) return null
    return `${API_URL}/documentos/${idImagen}/descargar`
  },

  // Obtener todos los cursos disponibles (Endpoint con /api)
  async getAllCursos(): Promise<MisCursos[]> {
    const response = await apiAxiosInstance.get('/cursos?limit=1000', {
      headers: getStudentAuthHeaders(),
    })
    const payload = response.data?.data ?? response.data

    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.cursos)) return payload.cursos
    if (Array.isArray(response.data?.cursos)) return response.data.cursos

    return []
  },

  async validarInscripcion(cursoId: string, userId: string): Promise<ValidarInscripcionResponse> {
    const response = await apiAxiosInstance.get('/inscripciones/validar', {
      params: {
        id_curso: cursoId,
        id_usuario: userId,
      },
      headers: getStudentAuthHeaders(),
    })

    return {
      success: Boolean(response.data?.success),
      enrolled: Boolean(response.data?.enrolled),
    }
  },

  async inscribirCurso(payload: InscripcionPayload): Promise<any> {
    const response = await apiAxiosInstance.post('/inscripciones', {
      id_curso: payload.idCurso,
      id_usuario: payload.idUsuario,
      fecha_inicio: payload.fechaInicio,
    }, {
      headers: getStudentAuthHeaders(),
    })

    return response.data?.data ?? response.data
  },

  // Eliminar inscripción de un curso
  async eliminarInscripcion(idInscripcion: string): Promise<void> {
    await apiAxiosInstance.delete(`/inscripciones/${idInscripcion}`, {
      headers: getStudentAuthHeaders(),
    })
  },

  async getMisCursosInscritos(userId: string): Promise<CursoInscritoBackend[]> {
    const response = await apiAxiosInstance.get(`/inscripciones/mis-cursos/${userId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data?.data || []
  },

  // Obtener mis cursos inscritos (Endpoint sin /api)
  async getMisCursos(): Promise<MisCursos[]> {
    const response = await rootAxiosInstance.get('/progreso/mis-cursos', {
      headers: getStudentAuthHeaders(),
    })
    const raw: any[] = response.data.data ?? []
    return raw.map((r) => ({
      idCurso:             r.id_curso           ?? r.idCurso            ?? '',
      titulo:              r.titulo_curso        ?? r.titulo             ?? '',
      descripcion:         r.descripcion,
      thumbnail:           r.thumbnail,
      modulosTotal:        r.total_contenidos    ?? r.modulosTotal       ?? 0,
      modulosCompletados:  r.contenidos_completados ?? r.modulosCompletados ?? 0,
      porcentajeProgreso:  Number(r.porcentaje   ?? r.porcentajeProgreso ?? 0),
    }))
  },

  // Obtener detalle de curso (Endpoint con /api)
  async getCursoDetalle(cursoId: string): Promise<CursoDetalle> {
    const response = await apiAxiosInstance.get(`/cursos/${cursoId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  async getCursoDetalleConProgreso(cursoId: string, usuarioId: string): Promise<CursoDetalleConProgreso> {
    const response = await apiAxiosInstance.get(`/cursos/${cursoId}/detalle/${usuarioId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener módulos de un curso (Endpoint con /api)
  async getModulos(cursoId: string): Promise<ModuloItem[]> {
    const response = await apiAxiosInstance.get(`/cursos/${cursoId}/modulos`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener detalle de módulo (Endpoint con /api)
  async getModuloDetalle(cursoId: string, moduloId: string): Promise<ModuloDetalle> {
    const response = await apiAxiosInstance.get(`/cursos/${cursoId}/modulos/${moduloId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener contenidos de un módulo (Endpoint con /api)
  async getContenidos(moduloId: string): Promise<ContenidoItem[]> {
    const response = await apiAxiosInstance.get(`/modulos/${moduloId}/contenidos`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener detalle de contenido (Endpoint con /api)
  async getContenidoDetalle(moduloId: string, contenidoId: string): Promise<ContenidoDetalle> {
    const response = await apiAxiosInstance.get(`/modulos/${moduloId}/contenidos/${contenidoId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Marcar contenido como completado (Endpoint sin /api)
  async marcarContenidoCompletado(
    contenidoId: string,
    usuarioId: string
  ): Promise<{ completado: boolean; porcentajeActual: number; certificado: Certificado | null }> {
    const response = await rootAxiosInstance.post(
      `/progreso/contenido/${contenidoId}/completar`,
      { id_usuario: usuarioId },
      { headers: getStudentAuthHeaders() }
    )
    return response.data.data
  },

  // Obtener progreso detallado de curso (Endpoint sin /api)
  async getProgresoDetallado(cursoId: string): Promise<ProgresoDetalle> {
    const response = await rootAxiosInstance.get(`/progreso/curso/${cursoId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener mis certificados (Endpoint sin /api)
  async getMisCertificados(): Promise<Certificado[]> {
    const user = tokenManager.getUser() as { id?: string } | null
    const userId = user?.id
    if (!userId) throw new Error('User ID not found')
    const response = await rootAxiosInstance.get(`/certificates/usuario/${userId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data ?? []
  },

  // Obtener mis calificaciones (Endpoint sin /api)
  async getMisCalificaciones(): Promise<Calificacion[]> {
    const userId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').id
        : null
    if (!userId) throw new Error('User ID not found')
    const response = await rootAxiosInstance.get(`/grades/student/${userId}`, {
      headers: getStudentAuthHeaders(),
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
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Sincronizar progreso_curso desde progreso_estudiante y generar certificado si aplica
  async sincronizarProgreso(
    idUsuario: string,
    idCurso: string
  ): Promise<{ porcentaje: number; completado: boolean; certificado: Certificado | null }> {
    const response = await rootAxiosInstance.post(
      '/progreso/sincronizar',
      { id_usuario: idUsuario, id_curso: idCurso },
      { headers: getStudentAuthHeaders() }
    )
    return response.data.data
  },

  // Obtener resultado de evaluación (Endpoint sin /api)
  async getResultadoEvaluacion(contenidoId: string, userId: string): Promise<any> {
    const response = await rootAxiosInstance.get(`/evaluaciones/contenido/${contenidoId}/resultado/${userId}`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data.data
  },

  // Obtener HTML de vista previa del certificado (Endpoint sin /api)
  async previewCertificado(certId: string): Promise<string> {
    const response = await rootAxiosInstance.get(`/certificates/${certId}/preview`, {
      headers: getStudentAuthHeaders(),
    })
    return response.data
  },

  // Descargar certificado como blob HTML (Endpoint sin /api)
  async descargarCertificado(certId: string): Promise<Blob> {
    const response = await rootAxiosInstance.get(`/certificates/${certId}/descargar`, {
      headers: getStudentAuthHeaders(),
      responseType: 'blob',
    })
    return response.data
  },
}