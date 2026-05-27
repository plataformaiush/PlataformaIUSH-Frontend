import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trophy } from 'lucide-react'

const CONFETTI_COLORS = ['#5A878C', '#059669', '#7C3AED', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i / 28) * 100}%`,
  delay: `${((i * 0.09) % 1.4).toFixed(2)}s`,
  duration: `${(1.6 + (i % 6) * 0.25).toFixed(2)}s`,
  width: i % 3 === 0 ? 9 : 6,
  height: i % 3 === 0 ? 14 : 10,
  isCircle: i % 5 === 0,
}))

const COUNTDOWN = 5

interface CongratulationsModalProps {
  courseName: string
  onRedirect: () => void
}

export function CongratulationsModal({ courseName, onRedirect }: CongratulationsModalProps) {
  const [tick, setTick] = useState(COUNTDOWN)

  useEffect(() => {
    if (tick <= 0) { onRedirect(); return }
    const t = setTimeout(() => setTick(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [tick, onRedirect])

  const progressPct = ((COUNTDOWN - tick) / COUNTDOWN) * 100

  return createPortal(
    <>
      <style>{`
        @keyframes cg-fade-in {
          from { opacity: 0; transform: scale(0.65); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cg-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cg-bounce {
          0%,100% { transform: translateY(0) scale(1); }
          40%     { transform: translateY(-20px) scale(1.12); }
          65%     { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes cg-confetti {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(800deg); opacity: 0; }
        }
        @keyframes cg-text-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cg-stars {
          0%,100% { opacity: 0.3; transform: scale(0.8); }
          50%     { opacity: 1;   transform: scale(1.2); }
        }
        .cg-overlay { animation: cg-overlay-in 0.3s ease both; }
        .cg-card    { animation: cg-fade-in 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
        .cg-trophy  { animation: cg-bounce 1.3s ease-in-out infinite; }
        .cg-title   { animation: cg-text-in 0.45s 0.35s ease both; }
        .cg-sub     { animation: cg-text-in 0.45s 0.5s  ease both; }
        .cg-actions { animation: cg-text-in 0.45s 0.65s ease both; }
        .cg-star-1  { animation: cg-stars 1.8s 0.1s ease-in-out infinite; }
        .cg-star-2  { animation: cg-stars 1.8s 0.6s ease-in-out infinite; }
        .cg-star-3  { animation: cg-stars 1.8s 1.1s ease-in-out infinite; }
      `}</style>

      {/* Overlay */}
      <div className="cg-overlay fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">

        {/* Confetti */}
        {PARTICLES.map(p => (
          <span
            key={p.id}
            className="pointer-events-none fixed top-0"
            style={{
              left: p.left,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? '50%' : '2px',
              animation: `cg-confetti ${p.duration} ${p.delay} ease-in both`,
            }}
          />
        ))}

        {/* Card */}
        <div className="cg-card relative bg-surface rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5 overflow-hidden">

          {/* Fondo degradado sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/70 via-transparent to-transparent pointer-events-none" />

          {/* Estrellas decorativas */}
          <span className="cg-star-1 absolute top-5 left-7 text-yellow-400 text-xl select-none">★</span>
          <span className="cg-star-2 absolute top-8 right-8 text-yellow-300 text-base select-none">★</span>
          <span className="cg-star-3 absolute bottom-16 left-10 text-yellow-400 text-sm select-none">★</span>

          {/* Trofeo */}
          <div className="cg-trophy relative z-10 w-24 h-24 rounded-full bg-yellow-400/15 border-2 border-yellow-400/30 flex items-center justify-center">
            <Trophy size={48} className="text-yellow-500" strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className="cg-title relative z-10 space-y-1">
            <h2 className="text-3xl font-extrabold text-primary tracking-tight">
              ¡Felicitaciones!
            </h2>
          </div>

          <div className="cg-sub relative z-10 space-y-1.5">
            <p className="text-sm text-secondary leading-relaxed">
              Completaste el curso
            </p>
            <p className="text-base font-bold text-primary line-clamp-2 px-2">
              {courseName}
            </p>
            <p className="text-xs text-mid mt-1">
              Tu certificado ya está disponible 🎓
            </p>
          </div>

          {/* Acciones */}
          <div className="cg-actions relative z-10 w-full space-y-3 mt-1">
            {/* Barra de cuenta regresiva */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-mid/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-mid">
                Redirigiendo en {tick} segundo{tick !== 1 ? 's' : ''}…
              </p>
            </div>

            <button
              onClick={onRedirect}
              className="w-full min-h-[48px] rounded-xl text-sm font-bold text-white
                         hover:opacity-90 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #059669, #5A878C)' }}
            >
              Ver mi certificado →
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
