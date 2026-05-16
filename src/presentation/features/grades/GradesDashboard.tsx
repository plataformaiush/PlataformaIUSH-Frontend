import { CertificationCenter } from './components/CertificationCenter';

export default function GradesDashboard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* ── Main content ───────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <CertificationCenter />
      </main>
    </div>
  );
}
