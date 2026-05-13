// src/presentation/features/grades/components/InstructorGradeEditor.tsx

import { useState } from 'react';
import { Save, X, Edit2, Check } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { mockStudents } from '../data/mock-grades';
import type { Student } from '../../../../domain/grades';

interface EditValues { moduleN: string; moduleNPlus1: string }

/** Teal (#58838C) para aprobado, rojo para reprobado */
const scoreColor = (score: number) => (score >= 70 ? '#58838C' : '#DC2626');

export function InstructorGradeEditor() {
  const [students, setStudents]     = useState<Student[]>(mockStudents);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({ moduleN: '', moduleNPlus1: '' });
  const [hasChanges, setHasChanges] = useState(false);

  const startEditing = (student: Student) => {
    setEditingId(student.id);
    setEditValues({
      moduleN:      student.moduleN.toString(),
      moduleNPlus1: student.moduleNPlus1 > 0 ? student.moduleNPlus1.toString() : '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ moduleN: '', moduleNPlus1: '' });
  };

  const saveGrade = (studentId: string) => {
    const moduleN      = parseFloat(editValues.moduleN)      || 0;
    const moduleNPlus1 = parseFloat(editValues.moduleNPlus1) || 0;
    if (moduleN < 0 || moduleN > 100 || moduleNPlus1 < 0 || moduleNPlus1 > 100) {
      alert('Las calificaciones deben estar entre 0 y 100');
      return;
    }
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const hasNPlus1    = moduleNPlus1 > 0;
      const finalAverage = hasNPlus1 ? (moduleN + moduleNPlus1) / 2 : moduleN;
      const progress     = hasNPlus1 ? 100 : 50;
      const status: Student['status'] = hasNPlus1 && finalAverage >= 70 ? 'approved' : 'in-progress';
      return { ...s, moduleN, moduleNPlus1, finalAverage, progress, status };
    }));
    setEditingId(null);
    setHasChanges(true);
  };

  const saveAllChanges = () => {
    setHasChanges(false);
    alert('¡Calificaciones guardadas exitosamente!');
  };

  const inputStyle: React.CSSProperties = {
    width: 72,
    padding: '0.375rem 0.5rem',
    textAlign: 'center',
    border: '1.5px solid #84B9BF',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    outline: 'none',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold mb-1" style={{ fontSize: '1.5rem', color: '#0F172A' }}>
            Editor de Calificaciones
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Ingresa y edita las calificaciones de los estudiantes
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={saveAllChanges}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#16a34a', color: '#ffffff', fontSize: '0.875rem', flexShrink: 0 }}
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        )}
      </div>

      {/* Table */}
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
                {['Nombre del Estudiante','Progreso','Módulo N','Módulo N+1','Promedio Final','Estado','Acciones'].map(
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
              {students.map((student, idx) => {
                const isEditing = editingId === student.id;
                return (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: idx < students.length - 1 ? '1px solid #F1F5F9' : 'none',
                      backgroundColor: isEditing ? '#F0F9FF' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!isEditing) (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC'; }}
                    onMouseLeave={(e) => { if (!isEditing) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    {/* Name */}
                    <td style={{ padding: '1rem 1.25rem', color: '#0F172A', fontWeight: 500 }}>
                      {student.name}
                    </td>

                    {/* Progress */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <div className="flex items-center justify-center gap-2">
                        <div style={{ width: 90, height: 6, backgroundColor: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${student.progress}%`, height: '100%', backgroundColor: '#58838C', borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B', minWidth: '3ch' }}>{student.progress}%</span>
                      </div>
                    </td>

                    {/* Module N */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      {isEditing ? (
                        <input
                          type="number" min="0" max="100"
                          value={editValues.moduleN}
                          onChange={e => setEditValues(p => ({ ...p, moduleN: e.target.value }))}
                          style={inputStyle}
                        />
                      ) : (
                        <span style={{ color: scoreColor(student.moduleN), fontWeight: 600 }}>
                          {student.moduleN}
                        </span>
                      )}
                    </td>

                    {/* Module N+1 */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      {isEditing ? (
                        <input
                          type="number" min="0" max="100"
                          value={editValues.moduleNPlus1}
                          onChange={e => setEditValues(p => ({ ...p, moduleNPlus1: e.target.value }))}
                          style={inputStyle}
                          placeholder="—"
                        />
                      ) : (
                        <span style={{ color: student.moduleNPlus1 ? scoreColor(student.moduleNPlus1) : '#94A3B8', fontWeight: student.moduleNPlus1 ? 600 : 400 }}>
                          {student.moduleNPlus1 || '—'}
                        </span>
                      )}
                    </td>

                    {/* Average */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', color: '#0F172A', fontWeight: 600 }}>
                      {student.finalAverage.toFixed(1)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <Badge variant={student.status === 'approved' ? 'success' : 'warning'}>
                        {student.status === 'approved' ? 'Aprobado' : 'En Progreso'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveGrade(student.id)}
                              title="Guardar"
                              style={{
                                padding: '0.375rem',
                                backgroundColor: '#16a34a',
                                color: '#fff',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              title="Cancelar"
                              style={{
                                padding: '0.375rem',
                                backgroundColor: '#F1F5F9',
                                color: '#64748B',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(student)}
                            title="Editar"
                            style={{
                              padding: '0.375rem',
                              backgroundColor: '#223740',
                              color: '#fff',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div
        className="mt-6 rounded-xl p-5"
        style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}
      >
        <h3 className="font-semibold mb-3" style={{ color: '#0369A1', fontSize: '0.9rem' }}>
          Instrucciones
        </h3>
        <ul className="space-y-1" style={{ color: '#0284C7', fontSize: '0.8125rem' }}>
          {[
            'Haz clic en el botón de editar (lápiz) para modificar las calificaciones de un estudiante',
            'Las calificaciones deben estar entre 0 y 100',
            'El promedio final se calcula automáticamente basado en los módulos completados',
            'El estado cambia a "Aprobado" cuando ambos módulos están completados y el promedio es ≥ 70',
            'No olvides guardar tus cambios con el botón "Guardar Cambios"',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ marginTop: 2 }}>•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
