// src/presentation/features/grades/GradesDashboard.tsx

import { useState } from 'react';
import { GraduationCap, ClipboardList, Award, User, Edit3 } from 'lucide-react';
import { GradeManagementView } from './components/GradeManagementView';
import { StudentGradebook } from './components/StudentGradebook';
import { CertificationCenter } from './components/CertificationCenter';
import { InstructorGradeEditor } from './components/InstructorGradeEditor';
import { ThemeCustomizer } from './components/ThemeCustomizer';

type View = 'instructor' | 'editor' | 'student' | 'certificates';

const NAV_ITEMS: { view: View; label: string; Icon: React.ElementType }[] = [
  { view: 'instructor',   label: 'Vista General', Icon: ClipboardList },
  { view: 'editor',       label: 'Editar Notas',  Icon: Edit3         },
  { view: 'student',      label: 'Mi Libro',      Icon: User          },
  { view: 'certificates', label: 'Certificados',  Icon: Award         },
];

export default function GradesDashboard() {
  const [currentView, setCurrentView] = useState<View>('instructor');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ backgroundColor: '#223740' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 40, height: 40, backgroundColor: 'rgba(174,235,242,0.15)' }}
            >
              <GraduationCap className="w-6 h-6" style={{ color: '#AEEBF2' }} />
            </div>
            <div>
              <p className="font-bold leading-tight" style={{ color: '#ffffff', fontSize: '1.125rem', margin: 0 }}>
                Dashboard LMS
              </p>
              <p style={{ color: '#84B9BF', fontSize: '0.75rem', margin: 0 }}>
                Notas y Certificaciones
              </p>
            </div>
          </div>

          {/* User chip */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <User className="w-4 h-4" style={{ color: '#84B9BF' }} />
            <span style={{ color: '#E2E8F0', fontSize: '0.875rem' }}>Admin User</span>
            <div
              className="flex items-center justify-center rounded-full font-semibold"
              style={{
                width: 32, height: 32,
                backgroundColor: '#58838C',
                color: '#ffffff',
                fontSize: '0.75rem',
              }}
            >
              AU
            </div>
          </div>
        </div>
      </header>

      {/* ── Nav tabs ───────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40"
        style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map(({ view, label, Icon }) => {
              const active = currentView === view;
              return (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className="flex items-center gap-2 px-5 py-4 whitespace-nowrap transition-all"
                  style={{
                    borderBottom: active ? '2px solid #223740' : '2px solid transparent',
                    color: active ? '#223740' : '#64748B',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.875rem',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {currentView === 'instructor'   && <GradeManagementView />}
        {currentView === 'editor'       && <InstructorGradeEditor />}
        {currentView === 'student'      && <StudentGradebook />}
        {currentView === 'certificates' && <CertificationCenter />}
      </main>

      <ThemeCustomizer />
    </div>
  );
}
