import { useNavigate } from 'react-router-dom'
import { useInstitution } from '../../context/InstitutionContext'

export function HomePage() {
  const navigate = useNavigate()
  const { logo } = useInstitution()

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center">
        {/* Logo Cuadrado */}
        <div className="flex justify-center mb-6">
          {logo ? (
            <img
              src={logo}
              alt="Iush Platform Logo"
              className="w-24 h-24 object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}>
              <span className="text-3xl font-bold">IP</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
          Profunsoft
        </h1>
        <p className="text-base mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
          Plataforma Educativa LMS
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted-foreground)' }}>
          Los equipos están trabajando en sus módulos específicos...
        </p>

        {/* Botón para ir a Super Admin */}
        <button
          onClick={() => navigate('/super-admin')}
          className="mt-2 px-6 py-3 text-white text-sm rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Ir a Super Admin (Equipo 3)
        </button>

        <div className="mt-8 p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-muted)',
            borderColor: 'var(--color-border)'
          }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Equipos asignados:</h2>
          <div className="text-left text-sm space-y-1" style={{ color: 'var(--color-muted-foreground)' }}>
            <p>Equipo 1: Cursos, Módulos, Contenidos</p>
            <p>Equipo 2: Gestión de Archivos</p>
            <p>Equipo 3: Vista Institución ✅</p>
            <p>Equipo 4: Vista Administrador</p>
            <p>Equipo 5: Notas y Certificaciones</p>
            <p>Equipo 6: Vista Docente</p>
            <p>Equipo 7: Competencias Socioemocionales</p>
            <p>Equipo 8: Auth, Usuarios, Roles</p>
            <p>Equipo 9: Analytics y Reportes</p>
            <p>Equipo 10: Vista Estudiante</p>
          </div>
        </div>
      </div>
    </div>
  )
}
