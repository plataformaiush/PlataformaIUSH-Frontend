import { useEffect, useState, type ReactNode } from 'react'
import { tokenManager } from '../../../services/tokenManager'

interface AuthImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallback?: ReactNode
}

function isInternalUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

export function AuthImage({ src, alt, className, fallback }: AuthImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) { setError(true); return }

    setError(false)
    setImgSrc(null)

    if (!isInternalUrl(src)) {
      setImgSrc(src)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(src, { headers: tokenManager.getAuthHeaders() })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) throw new Error('error json')
        const blob = await res.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setImgSrc(objectUrl)
      } catch {
        if (!cancelled) setError(true)
      }
    }

    load()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (error || !src) return <>{fallback ?? null}</>

  if (!imgSrc) return <>{fallback ?? null}</>

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
