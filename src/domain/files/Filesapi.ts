import api from '../../presentation/lib/axios'

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:3000/api'

// ─────────────────────────────────────────────
// Pon en true para usar datos falsos sin backend
// ─────────────────────────────────────────────
const MOCK_MODE = false

export type Carpeta = 'documentos' | 'imagenes'

export interface Documento {
  id: string       // id_maestro_documento (UUID)
  nombre: string
  tipo: 'pdf' | 'docx' | 'xlsx' | 'png' | 'jpg' | string
  tamaño: number
  url?: string
  creadoEn?: string
  carpeta?: Carpeta
}

// ─────────────────────────────────────────────
// Extensiones que van a la carpeta "imagenes"
// Todo lo demás va a "documentos"
// ─────────────────────────────────────────────
const EXTENSIONES_IMAGEN = new Set(['png', 'jpg', 'jpeg'])

export function inferirCarpeta(nombreArchivo: string): Carpeta {
  const ext = nombreArchivo.split('.').pop()?.toLowerCase() || ''
  return EXTENSIONES_IMAGEN.has(ext) ? 'imagenes' : 'documentos'
}

// ─────────────────────────────────────────────
// Base de datos en memoria para los mocks
// ─────────────────────────────────────────────
const mockDB: Documento[] = [
  {
    id: 'documentos/1747100000001_Guía_Metodología_Investigación.pdf',
    nombre: 'Guía_Metodología_Investigación.pdf',
    tipo: 'pdf',
    tamaño: 2516582,
    url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf',
    creadoEn: '2025-04-12T10:00:00Z',
    carpeta: 'documentos',
  },
  {
    id: 'documentos/1747100000002_Syllabus_Programación_2025.docx',
    nombre: 'Syllabus_Programación_2025.docx',
    tipo: 'docx',
    tamaño: 91136,
    url: 'https://file-examples.com/storage/fe6b5a5b7b6209b519e6fc7/2017/02/file-sample_100kB.docx',
    creadoEn: '2025-04-08T09:00:00Z',
    carpeta: 'documentos',
  },
  {
    id: 'documentos/1747100000003_Notas_Semestre_I_2025.xlsx',
    nombre: 'Notas_Semestre_I_2025.xlsx',
    tipo: 'xlsx',
    tamaño: 353280,
    url: 'https://file-examples.com/storage/fe6b5a5b7b6209b519e6fc7/2017/02/file_example_XLS_10.xlsx',
    creadoEn: '2025-03-20T08:00:00Z',
    carpeta: 'documentos',
  },
  {
    id: 'imagenes/1747100000004_banner_evento_graduacion.png',
    nombre: 'banner_evento_graduacion.png',
    tipo: 'png',
    tamaño: 1887437,
    url: 'https://picsum.photos/seed/iush/1920/1080',
    creadoEn: '2025-04-05T15:00:00Z',
    carpeta: 'imagenes',
  },
  {
    id: 'documentos/1747100000005_clase_01_introduccion_programacion.mp4',
    nombre: 'clase_01_introduccion_programacion.mp4',
    tipo: 'mp4',
    tamaño: 134217728,
    url: 'https://youtu.be/RBaSiVjtKR4',
    creadoEn: '2025-04-01T07:00:00Z',
    carpeta: 'documentos',
  },
]

// Simula delay de red (ms)
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms))

// ─────────────────────────────────────────────
// Implementaciones mock
// ─────────────────────────────────────────────
const mock = {
  listar: async (carpeta?: Carpeta): Promise<Documento[]> => {
    await delay()
    if (carpeta) return mockDB.filter((d) => d.carpeta === carpeta)
    return [...mockDB]
  },

  subir: async (
    archivo: File,
    onProgress?: (pct: number, cargado: number) => void
  ): Promise<Documento> => {
    const carpeta = inferirCarpeta(archivo.name)
    for (let i = 20; i <= 100; i += 20) {
      await delay(300)
      onProgress?.(i, Math.round((archivo.size * i) / 100))
    }
    const timestamp = Date.now()
    const nombre = archivo.name
    const id = `${carpeta}/${timestamp}_${nombre}`
    const nuevo: Documento = {
      id,
      nombre,
      tipo: nombre.split('.').pop()?.toLowerCase() || 'unknown',
      tamaño: archivo.size,
      url: URL.createObjectURL(archivo),
      creadoEn: new Date().toISOString(),
      carpeta,
    }
    mockDB.unshift(nuevo)
    return nuevo
  },

  buscar: async (query: string): Promise<Documento[]> => {
    await delay(400)
    const q = query.toLowerCase()
    return mockDB.filter((d) => d.nombre.toLowerCase().includes(q))
  },

  obtenerPorId: async (id: string): Promise<Documento> => {
    await delay(400)
    const doc = mockDB.find((d) => d.id === id)
    if (!doc) throw new Error(`Documento ${id} no encontrado`)
    return { ...doc }
  },

  eliminar: async (id: string): Promise<void> => {
    await delay(500)
    const idx = mockDB.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error(`Documento ${id} no encontrado`)
    mockDB.splice(idx, 1)
  },

  descargarUrl: (id: string): string => {
    const doc = mockDB.find((d) => d.id === id)
    return doc?.url || `${API_BASE}/api/documentos/${encodeURIComponent(id)}/descargar`
  },
}

const real = {
  // GET /api/documentos
  listar: async (carpeta?: Carpeta): Promise<Documento[]> => {
    const params = carpeta ? { carpeta } : {}
    const { data } = await api.get('/documentos', { params })
    return data.data.map((d: any) => ({
      id: d.id_maestro_documento,
      nombre: d.numero_documento,
      tipo: d.tipo_extension,
      tamaño: d.tamanno,
      url: `${API_BASE}/documentos/${encodeURIComponent(d.id_maestro_documento)}/descargar`,
      creadoEn: d.fecha_creacion,
      carpeta: d.ruta_documento.split('/')[0] as Carpeta,
    }))
  },
  subir: async (
    archivo: File,
    onProgress?: (pct: number, cargado: number) => void
  ): Promise<Documento> => {
    const carpeta = inferirCarpeta(archivo.name)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', carpeta)

    const { data } = await api.post('/documentos', formData, {
      timeout: 120000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (evt) => {
        if (evt.total && onProgress)
          onProgress(Math.round((evt.loaded * 100) / evt.total), evt.loaded)
      },
    })

    const d = data.data
    return {
      id: d.id_maestro_documento,
      nombre: d.numero_documento,
      tipo: d.tipo_extension,
      tamaño: d.tamanno,
      url: `${API_BASE}/documentos/${encodeURIComponent(d.id_maestro_documento)}/descargar`,
      creadoEn: d.fecha_creacion,
      carpeta,
    }
  },

  buscar: async (query: string): Promise<Documento[]> => {
    const { data } = await api.get('/documentos/buscar', { params: { q: query } })
    return data
  },

  // GET /api/documentos/:id
  obtenerPorId: async (id: string): Promise<Documento> => {
    const { data } = await api.get(`/documentos/${encodeURIComponent(id)}`)
    const d = data.data
    return {
      id: d.id_maestro_documento,
      nombre: d.numero_documento,
      tipo: d.tipo_extension,
      tamaño: d.tamanno,
      url: `${API_BASE}/documentos/${encodeURIComponent(d.id_maestro_documento)}/descargar`,
      creadoEn: d.fecha_creacion,
      carpeta: d.ruta_documento.split('/')[0] as Carpeta,
    }
  },

  // DELETE /api/documentos/:id
  eliminar: async (id: string): Promise<void> => {
    await api.delete(`/documentos/${encodeURIComponent(id)}`)
  },

  // GET /api/documentos/:id/descargar
  descargarUrl: (id: string): string =>
    `${API_BASE}/documentos/${encodeURIComponent(id)}/descargar`,
}

// ─────────────────────────────────────────────
// Exporta mock o real según la variable MOCK_MODE
// ─────────────────────────────────────────────
export const filesApi = MOCK_MODE ? mock : real