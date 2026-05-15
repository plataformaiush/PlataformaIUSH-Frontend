import axios from 'axios'

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:3000'

// ─────────────────────────────────────────────
// Pon en true para usar datos falsos sin backend
// ─────────────────────────────────────────────
const MOCK_MODE = true

export interface Documento {
  id: string
  nombre: string
  tipo: 'pdf' | 'docx' | 'xlsx' | 'png' | 'jpg' | 'mp4' | string
  tamaño: number
  url?: string
  creadoEn?: string
}

// ─────────────────────────────────────────────
// Base de datos en memoria para los mocks
// ─────────────────────────────────────────────
const mockDB: Documento[] = [
  {
    id: '1',
    nombre: 'Guía_Metodología_Investigación.pdf',
    tipo: 'pdf',
    tamaño: 2516582,
    url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf',
    creadoEn: '2025-04-12T10:00:00Z',
  },
  {
    id: '2',
    nombre: 'Syllabus_Programación_2025.docx',
    tipo: 'docx',
    tamaño: 91136,
    url: 'https://file-examples.com/storage/fe6b5a5b7b6209b519e6fc7/2017/02/file-sample_100kB.docx',
    creadoEn: '2025-04-08T09:00:00Z',
  },
  {
    id: '3',
    nombre: 'Notas_Semestre_I_2025.xlsx',
    tipo: 'xlsx',
    tamaño: 353280,
    url: 'https://file-examples.com/storage/fe6b5a5b7b6209b519e6fc7/2017/02/file_example_XLS_10.xlsx',
    creadoEn: '2025-03-20T08:00:00Z',
  },
  {
    id: '4',
    nombre: 'banner_evento_graduacion.png',
    tipo: 'png',
    tamaño: 1887437,
    url: 'https://picsum.photos/seed/iush/1920/1080',
    creadoEn: '2025-04-05T15:00:00Z',
  },
  {
    id: '5',
    nombre: 'clase_01_introduccion_programacion.mp4',
    tipo: 'mp4',
    tamaño: 134217728,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    creadoEn: '2025-04-01T07:00:00Z',
  },
]

// Simula delay de red (ms)
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms))

// ─────────────────────────────────────────────
// Implementaciones mock
// ─────────────────────────────────────────────
const mock = {
  listar: async (): Promise<Documento[]> => {
    await delay()
    return [...mockDB]
  },

  subir: async (
    archivo: File,
    onProgress?: (pct: number, cargado: number) => void
  ): Promise<Documento> => {
    // Simula progreso en pasos de 20%
    for (let i = 20; i <= 100; i += 20) {
      await delay(300)
      onProgress?.(i, Math.round((archivo.size * i) / 100))
    }
    const nuevo: Documento = {
      id: crypto.randomUUID(),
      nombre: archivo.name,
      tipo: archivo.name.split('.').pop() || 'unknown',
      tamaño: archivo.size,
      url: URL.createObjectURL(archivo), // URL temporal del navegador
      creadoEn: new Date().toISOString(),
    }
    mockDB.unshift(nuevo) // agrega al inicio
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
    return doc?.url || `${API_BASE}/api/documentos/${id}/descargar`
  },
}

// ─────────────────────────────────────────────
// Implementaciones reales con axios
// ─────────────────────────────────────────────
const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const real = {
  listar: async (): Promise<Documento[]> => {
    const { data } = await api.get('/api/documentos')
    return data
  },

  subir: async (
    archivo: File,
    onProgress?: (pct: number, cargado: number) => void
  ): Promise<Documento> => {
    const formData = new FormData()
    formData.append('file', archivo)
    const { data } = await api.post('/api/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total && onProgress) {
          onProgress(Math.round((evt.loaded * 100) / evt.total), evt.loaded)
        }
      },
    })
    return data
  },

  buscar: async (query: string): Promise<Documento[]> => {
    const { data } = await api.get('/api/documentos/buscar', { params: { q: query } })
    return data
  },

  obtenerPorId: async (id: string): Promise<Documento> => {
    const { data } = await api.get(`/api/documentos/${id}`)
    return data
  },

  eliminar: async (id: string): Promise<void> => {
    await api.delete(`/api/documentos/${id}`)
  },

  descargarUrl: (id: string): string =>
    `${API_BASE}/api/documentos/${id}/descargar`,
}

// ─────────────────────────────────────────────
// Exporta mock o real según la variable MOCK_MODE
// Cuando el backend esté listo solo cambia a false
// ─────────────────────────────────────────────
export const filesApi = MOCK_MODE ? mock : real