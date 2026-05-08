import { useRef, useState } from 'react'
import type { VideoContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface VideoContentProps {
  data: VideoContentData
  onComplete: () => void
}

export function VideoContent({ data, onComplete }: VideoContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [completed, setCompleted] = useState(false)

  const handleTimeUpdate = () => {
    if (completed || !videoRef.current) return
    const { currentTime, duration } = videoRef.current
    if (duration > 0 && currentTime / duration >= 0.9) {
      setCompleted(true)
      onComplete()
    }
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral">
        <video
          ref={videoRef}
          src={data.url}
          poster={data.thumbnail}
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-contain"
          aria-label={data.title}
        />
      </div>
      {completed && (
        <p className="text-center text-sm text-secondary font-medium">
          ✓ Contenido completado
        </p>
      )}
    </div>
  )
}
