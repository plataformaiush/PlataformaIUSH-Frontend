// src/presentation/features/grades/components/StudentGradebook.tsx

import { useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { mockModules } from '../data/mock-grades';

const OVERALL_PROGRESS = 75;
const chartData = [{ name: 'Progress', value: OVERALL_PROGRESS, fill: '#58838C' }];

/**
 * ≥ 90  → verde brillante
 * ≥ 60  → teal (incluye el 65% del Figma)
 * < 60  → ámbar
 */
const pctColor = (pct: number) =>
  pct >= 90 ? '#16a34a' : pct >= 60 ? '#58838C' : '#D97706';

export function StudentGradebook() {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedModule(prev => prev === id ? null : id);

  const averageScore =
    mockModules.reduce((acc, m) => acc + (m.score / m.maxScore) * 100, 0) / mockModules.length;
  const highestScore = Math.max(...mockModules.map(m => m.score));

  const statCards = [
    { label: 'Módulos Completados',   value: String(mockModules.length),       color: '#0F172A' },
    { label: 'Promedio General',       value: `${averageScore.toFixed(1)}%`,    color: '#0F172A' },
    { label: 'Calificación Más Alta',  value: String(highestScore),             color: '#16a34a' },
    { label: 'Certificados Obtenidos', value: '2',                              color: '#0F172A' },
  ];

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-6">
        <h1 className="font-bold mb-1" style={{ fontSize: '1.5rem', color: '#0F172A' }}>
          Mi Libro de Calificaciones
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          Seguimiento de tu progreso de aprendizaje y logros
        </p>
      </div>

      {/* Top summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

        {/* Radial chart card */}
        <div
          className="lg:col-span-1 flex flex-col items-center justify-center p-6"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div className="relative">
            <RadialBarChart
              width={180} height={180}
              cx={90} cy={90}
              innerRadius={54} outerRadius={82}
              barSize={14}
              data={chartData}
              startAngle={90} endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={8} />
            </RadialBarChart>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ pointerEvents: 'none' }}
            >
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
                {OVERALL_PROGRESS}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Completado</span>
            </div>
          </div>
          <p className="mt-3 font-medium" style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Progreso General
          </p>
        </div>

        {/* Stats grid */}
        <div
          className="lg:col-span-2 p-6"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <h3 className="font-semibold mb-4" style={{ color: '#0F172A', fontSize: '1rem' }}>
            Resumen de Rendimiento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {statCards.map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-lg p-4"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}
              >
                <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules accordion */}
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Accordion header */}
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}
        >
          <h3 className="font-semibold" style={{ color: '#0F172A', fontSize: '1rem' }}>Módulos</h3>
        </div>

        <div>
          {mockModules.map((module, idx) => {
            const pct = (module.score / module.maxScore) * 100;
            const isExpanded = expandedModule === module.id;
            const isLast = idx === mockModules.length - 1;

            return (
              <div
                key={module.id}
                style={{ borderBottom: isLast ? 'none' : '1px solid #F1F5F9' }}
              >
                {/* Row */}
                <div
                  className="px-6 py-4 cursor-pointer flex items-center justify-between gap-4 flex-wrap"
                  style={{ backgroundColor: isExpanded ? '#F8FAFC' : 'transparent', transition: 'background 0.15s' }}
                  onClick={() => toggle(module.id)}
                  onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC'; }}
                  onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ width: 36, height: 36, backgroundColor: '#EFF6FF' }}
                    >
                      <BookOpen className="w-4 h-4" style={{ color: '#223740' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: '#0F172A', fontSize: '0.9rem' }}>
                        {module.name}
                      </p>
                      <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                        {module.status === 'completed'
                          ? `Completado el ${new Date(module.completedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          : module.status === 'in-progress'
                          ? 'En progreso'
                          : 'No iniciado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 2 }}>Puntuación</p>
                      <p style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.875rem' }}>
                        {module.score} / {module.maxScore}
                      </p>
                    </div>
                    <div className="text-right" style={{ minWidth: 52 }}>
                      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 2 }}>Nota</p>
                      <p style={{ color: pctColor(pct), fontWeight: 700, fontSize: '1.125rem' }}>
                        {pct.toFixed(0)}%
                      </p>
                    </div>
                    <div style={{ color: '#94A3B8' }}>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded assignments */}
                {isExpanded && (
                  <div className="px-6 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0' }}
                    >
                      <p className="font-semibold mb-3" style={{ color: '#0F172A', fontSize: '0.875rem' }}>
                        Actividades y Calificaciones
                      </p>
                      <div className="space-y-2">
                        {module.assignments.map(assignment => {
                          const aPct = (assignment.score / assignment.maxScore) * 100;
                          return (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between gap-4 rounded-lg p-3"
                              style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" style={{ color: '#0F172A', fontSize: '0.875rem' }}>
                                  {assignment.name}
                                </p>
                                <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: 1 }}>
                                  {assignment.submittedDate
                                    ? `Entregado: ${new Date(assignment.submittedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                    : 'Pendiente de entrega'}
                                </p>
                              </div>
                              <div className="flex items-center gap-5 flex-shrink-0">
                                <div className="text-right">
                                  <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Peso</p>
                                  <p style={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>{assignment.weight}%</p>
                                </div>
                                <div className="text-right">
                                  <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Puntos</p>
                                  <p style={{ color: assignment.score > 0 ? '#0F172A' : '#94A3B8', fontSize: '0.875rem' }}>
                                    {assignment.score} / {assignment.maxScore}
                                  </p>
                                </div>
                                <div className="text-right" style={{ minWidth: 40 }}>
                                  <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Nota</p>
                                  <p style={{ color: assignment.score > 0 ? pctColor(aPct) : '#94A3B8', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {assignment.score > 0 ? `${aPct.toFixed(0)}%` : '—'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Module final grade */}
                      <div
                        className="mt-4 pt-4 flex justify-between items-center"
                        style={{ borderTop: '1px solid #E2E8F0' }}
                      >
                        <span className="font-semibold" style={{ color: '#0F172A', fontSize: '0.875rem' }}>
                          Calificación Final del Módulo:
                        </span>
                        <span style={{ color: pctColor(pct), fontSize: '1.5rem', fontWeight: 700 }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
