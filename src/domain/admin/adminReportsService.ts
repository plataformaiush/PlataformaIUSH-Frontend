import type { AdminDashboard } from './types'
import { createAxiosInstance } from '../../presentation/services/axiosInterceptor'

const API_URL = 'http://localhost:3000'
const axiosInstance = createAxiosInstance(API_URL)

type ApiEnvelope<T> = {
  ok: boolean
  data: T
}

type UsuariosTotalResponse = { totalUsuarios: number }
type UsuariosActivosResponse = { usuariosActivos: number }
type UsuariosPorRolItem = { rol: string; total: number }
type UsuariosPorRolResponse = { distribucion: UsuariosPorRolItem[] }
type EstudiantesInscritosResponse = { totalInscritos: number }
type EstudiantesCompletadosResponse = { totalCompletados: number }
type CursoTopItem = { idCurso: string; titulo: string; total: number }
type TopCursosResponse = { topCursos: CursoTopItem[] }

type UnknownRecord = Record<string, unknown>

function getAdminMockToken(): string | null {
  const envToken = import.meta.env.VITE_ADMIN_DASHBOARD_TOKEN as string | undefined
  return envToken ?? null
}

async function getApiData<T>(path: string, authToken?: string | null): Promise<T> {
  const response = await axiosInstance.get<ApiEnvelope<T>>(path, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  })
  const payload = response.data as unknown

  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

function getNumberValue(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function normalizeTotalCompletados(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 0
  const record = payload as UnknownRecord

  if ('totalCompletados' in record) return getNumberValue(record.totalCompletados)
  if ('total_completados' in record) return getNumberValue(record.total_completados)
  if ('total' in record) return getNumberValue(record.total)

  return 0
}

function normalizeTopCursos(payload: unknown): CursoTopItem[] {
  if (Array.isArray(payload)) return payload as CursoTopItem[]
  if (!payload || typeof payload !== 'object') return []

  const record = payload as UnknownRecord
  const candidates =
    (record.topCursos as unknown) ??
    (record.top_cursos as unknown) ??
    (record.topCursosCompletados as unknown) ??
    (record.cursos as unknown)

  return Array.isArray(candidates) ? (candidates as CursoTopItem[]) : []
}

export const adminReportsService = {
  async getDashboard(): Promise<AdminDashboard> {
    const mockToken = getAdminMockToken()
    const [
      totalUsuarios,
      usuariosActivos,
      usuariosPorRol,
      estudiantesInscritos,
      estudiantesCompletadosRaw,
      topCursosInscritosRaw,
      topCursosCompletadosRaw,
    ] = await Promise.all([
      getApiData<UsuariosTotalResponse>('/api/admin/dashboard/usuarios-total', mockToken),
      getApiData<UsuariosActivosResponse>('/api/admin/dashboard/usuarios-activos', mockToken),
      getApiData<UsuariosPorRolResponse>('/api/admin/dashboard/usuarios-por-rol', mockToken),
      getApiData<EstudiantesInscritosResponse>('/api/admin/dashboard/estudiantes-inscritos', mockToken),
      getApiData<EstudiantesCompletadosResponse | UnknownRecord>('/api/admin/dashboard/estudiantes-completados', mockToken),
      getApiData<TopCursosResponse | CursoTopItem[] | UnknownRecord>('/api/admin/dashboard/top-cursos-inscritos', mockToken),
      getApiData<TopCursosResponse | CursoTopItem[] | UnknownRecord>('/api/admin/dashboard/top-cursos-completados', mockToken),
    ])

    const totalCompletados = normalizeTotalCompletados(estudiantesCompletadosRaw)
    const topCursosInscritos = normalizeTopCursos(topCursosInscritosRaw)
    const topCursosCompletados = normalizeTopCursos(topCursosCompletadosRaw)

    return {
      reports: [
        {
          id: 'usuarios-total-por-mi',
          kind: 'metrics',
          order: 1,
          title: 'Total de usuarios registrados (por mí)',
          description: 'Usuarios creados por tu cuenta',
          metrics: [{ id: 'total', label: 'Total', value: totalUsuarios.totalUsuarios }],
        },
        {
          id: 'usuarios-activos-por-mi',
          kind: 'metrics',
          order: 2,
          title: 'Mis usuarios activos (creados por mí)',
          description: 'Usuarios creados por tu cuenta con estado activo',
          metrics: [{ id: 'activos', label: 'Activos', value: usuariosActivos.usuariosActivos }],
        },
        {
          id: 'usuarios-por-rol-por-mi',
          kind: 'metrics',
          order: 3,
          title: 'Distribución de usuarios por rol (creados por mí)',
          description: 'Conteo por rol de los usuarios que creaste',
          metrics: (usuariosPorRol.distribucion ?? []).map((item) => ({
            id: item.rol,
            label: item.rol,
            value: item.total,
          })),
        },
        {
          id: 'estudiantes-inscritos-mis-cursos',
          kind: 'metrics',
          order: 4,
          title: 'Total de estudiantes inscritos',
          description: 'En cursos creados por ti o por tus docentes',
          metrics: [
            {
              id: 'inscritos',
              label: 'Estudiantes inscritos',
              value: estudiantesInscritos.totalInscritos,
            },
          ],
        },
        {
          id: 'estudiantes-completados-mis-cursos',
          kind: 'metrics',
          order: 5,
          title: 'Total de estudiantes que han completado',
          description: 'En cursos creados por ti o por tus docentes',
          metrics: [
            {
              id: 'completados',
              label: 'Estudiantes completados',
              value: totalCompletados,
            },
          ],
        },
        {
          id: 'top-cursos-inscritos-mis-cursos',
          kind: 'metrics',
          order: 6,
          title: 'Top 5 cursos con más inscritos',
          description: 'Cursos creados por ti o por tus docentes',
          metrics: topCursosInscritos.map((curso) => ({
            id: curso.idCurso,
            label: curso.titulo,
            value: curso.total,
          })),
        },
        {
          id: 'top-cursos-completados-mis-cursos',
          kind: 'metrics',
          order: 7,
          title: 'Top 5 cursos con más completados',
          description: 'Cursos creados por ti o por tus docentes',
          metrics: topCursosCompletados.map((curso) => ({
            id: curso.idCurso,
            label: curso.titulo,
            value: curso.total,
          })),
        },
      ],
    }
  },
}
