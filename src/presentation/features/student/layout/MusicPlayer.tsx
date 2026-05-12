import { useState, useRef, useEffect, useCallback } from 'react'
import { Headphones, X, Music2, Play, Pause, Volume2 } from 'lucide-react'

const STATIONS = [
  { id: 'lofi',  label: 'Lofi Hip Hop',  emoji: '🎵', src: '/music/lofi.mp3'  },
  { id: 'chill', label: 'Chill & Focus', emoji: '🌙', src: '/music/chill.mp3' },
  { id: 'rain',  label: 'Lluvia & Café', emoji: '☕', src: '/music/rain.mp3'  },
]

export function MusicPlayer() {
  const [open, setOpen]       = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume]   = useState(0.5)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => () => { audioRef.current?.pause() }, [])

  const selectStation = useCallback((id: string) => {
    if (activeId === id) {
      if (playing) { audioRef.current?.pause(); setPlaying(false) }
      else          { audioRef.current?.play();  setPlaying(true)  }
      return
    }
    audioRef.current?.pause()
    const station = STATIONS.find(s => s.id === id)!
    const audio   = new Audio(station.src)
    audio.loop    = true
    audio.volume  = volume
    audio.play()
    audioRef.current = audio
    setActiveId(id)
    setPlaying(true)
  }, [activeId, playing, volume])

  const changeVolume = (v: number) => {
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const stop = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setActiveId(null)
    setPlaying(false)
  }

  const activeStation = STATIONS.find(s => s.id === activeId)

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col items-end gap-2">

      {/* Panel */}
      {open && (
        <div className="bg-surface rounded-2xl shadow-2xl border border-mid/20 w-64 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary">
            <div className="flex items-center gap-2">
              <Music2 size={15} className="text-mid" />
              <span className="text-sm font-semibold text-tertiary">Modo concentración</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-mid hover:text-tertiary transition-colors w-8 h-8
                         flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X size={15} />
            </button>
          </div>

          {/* Estaciones */}
          <div className="p-3 space-y-1.5">
            {STATIONS.map(s => (
              <button
                key={s.id}
                onClick={() => selectStation(s.id)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                  activeId === s.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-mid/10 border border-transparent',
                ].join(' ')}
              >
                <span className="text-xl leading-none">{s.emoji}</span>
                <span className="flex-1 text-sm font-medium text-primary">{s.label}</span>

                {activeId === s.id && (
                  playing
                    ? /* barras animadas */
                      <span className="flex items-end gap-px h-4">
                        {[3, 5, 4].map((h, i) => (
                          <span key={i} className="w-1 rounded-full bg-secondary"
                            style={{
                              height: `${h * 2}px`,
                              animation: 'musicBar 0.7s ease-in-out infinite alternate',
                              animationDelay: `${i * 0.18}s`,
                            }} />
                        ))}
                      </span>
                    : <Pause size={14} className="text-secondary" />
                )}
              </button>
            ))}
          </div>

          {/* Controles: play/pause + volumen */}
          {activeStation && (
            <div className="px-4 pb-3 space-y-2 border-t border-mid/10 pt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectStation(activeId!)}
                  className="w-8 h-8 flex items-center justify-center rounded-full
                             bg-primary text-tertiary hover:bg-secondary transition-colors shrink-0"
                >
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <Volume2 size={13} className="text-mid shrink-0" />
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={volume}
                    onChange={e => changeVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 accent-primary cursor-pointer"
                  />
                </div>
                <button
                  onClick={stop}
                  className="text-mid hover:text-primary transition-colors text-xs font-medium"
                >
                  Parar
                </button>
              </div>
            </div>
          )}

          <p className="text-[10px] text-mid text-center pb-3 px-4">
            La música te ayuda a mantener el foco 🎧
          </p>
        </div>
      )}

      {/* Botón flotante */}
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className={[
            'flex items-center justify-center w-12 h-12 rounded-full shadow-lg',
            'transition-all duration-200 hover:scale-105 active:scale-95',
            open || activeId
              ? 'bg-primary text-tertiary shadow-primary/30'
              : 'bg-surface border border-mid/20 text-primary hover:border-secondary/40',
          ].join(' ')}
          aria-label="Música de concentración"
        >
          <Headphones size={22} />
        </button>
        {activeId && playing && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full
                           bg-green-400 border-2 border-surface animate-pulse" />
        )}
      </div>

      <style>{`
        @keyframes musicBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
