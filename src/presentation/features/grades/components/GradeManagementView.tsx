// src/presentation/features/grades/components/GradeManagementView.tsx

import { Badge } from '../../../components/ui/Badge';
import { mockStudents } from '../data/mock-grades';

/** Teal (#58838C) para aprobado, rojo para reprobado — consistente con la paleta IUSH */
const scoreColor = (score: number) => (score >= 70 ? '#58838C' : '#DC2626');

export function GradeManagementView() {
  return (
    <div className="w-full">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-bold mb-1" style={{ fontSize: '1.5rem', color: '#0F172A' }}>
          Gestión de Calificaciones
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          Seguimiento del progreso y rendimiento de los estudiantes en todos los módulos
        </p>
      </div>

      {/* Table card */}
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Nombre del Estudiante', 'Progreso', 'Módulo N', 'Módulo N+1', 'Promedio Final', 'Estado'].map(
                  (col, i) => (
                    <th
                      key={col}
                      style={{
                        padding: '0.875rem 1.25rem',
                        textAlign: i === 0 ? 'left' : 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {mockStudents.map((student, idx) => (
                <tr
                  key={student.id}
                  style={{
                    borderBottom: idx < mockStudents.length - 1 ? '1px solid #F1F5F9' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
                  }
                >
                  {/* Name */}
                  <td style={{ padding: '1rem 1.25rem', color: '#0F172A', fontWeight: 500 }}>
                    {student.name}
                  </td>

                  {/* Progress bar */}
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        style={{
                          width: 90,
                          height: 6,
                          backgroundColor: '#E2E8F0',
                          borderRadius: 99,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${student.progress}%`,
                            height: '100%',
                            backgroundColor: '#58838C',
                            borderRadius: 99,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: '#64748B', minWidth: '3ch' }}>
                        {student.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Module N */}
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <span style={{ color: scoreColor(student.moduleN), fontWeight: 600 }}>
                      {student.moduleN}
                    </span>
                  </td>

                  {/* Module N+1 */}
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <span
                      style={{
                        color: student.moduleNPlus1 ? scoreColor(student.moduleNPlus1) : '#94A3B8',
                        fontWeight: student.moduleNPlus1 ? 600 : 400,
                      }}
                    >
                      {student.moduleNPlus1 || '—'}
                    </span>
                  </td>

                  {/* Average */}
                  <td
                    style={{
                      padding: '1rem 1.25rem',
                      textAlign: 'center',
                      color: '#0F172A',
                      fontWeight: 600,
                    }}
                  >
                    {student.finalAverage.toFixed(1)}
                  </td>

                  {/* Status badge */}
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <Badge variant={student.status === 'approved' ? 'success' : 'warning'}>
                      {student.status === 'approved' ? 'Aprobado' : 'En Progreso'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
