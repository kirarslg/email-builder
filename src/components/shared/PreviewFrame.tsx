import { useEffect, useRef, useState } from 'react'

interface PreviewFrameProps {
  className?: string
  srcDoc: string
  title: string
}

function measureFrameDocumentHeight(doc: Document): number {
  const body = doc.body
  const html = doc.documentElement
  return Math.max(
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
    html?.scrollHeight ?? 0,
    html?.offsetHeight ?? 0,
  )
}

export function PreviewFrame({ className, srcDoc, title }: PreviewFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [frameHeight, setFrameHeight] = useState(0)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    let rafId = 0
    let intervalId: number | null = null
    let resizeObserver: ResizeObserver | null = null

    const applyHeight = () => {
      const doc = frame.contentDocument
      if (!doc) return
      const nextHeight = measureFrameDocumentHeight(doc)
      if (!nextHeight) return
      setFrameHeight((current) => (Math.abs(current - nextHeight) > 1 ? nextHeight : current))
    }

    const scheduleMeasure = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(applyHeight)
    }

    const startPostLoadChecks = () => {
      let attempts = 0
      if (intervalId != null) {
        window.clearInterval(intervalId)
      }
      intervalId = window.setInterval(() => {
        scheduleMeasure()
        attempts += 1
        if (attempts >= 12 && intervalId != null) {
          window.clearInterval(intervalId)
          intervalId = null
        }
      }, 120)
    }

    const handleLoad = () => {
      scheduleMeasure()
      startPostLoadChecks()

      const doc = frame.contentDocument
      if (!doc || typeof ResizeObserver === 'undefined') return

      resizeObserver = new ResizeObserver(() => {
        scheduleMeasure()
      })
      if (doc.documentElement) resizeObserver.observe(doc.documentElement)
      if (doc.body) resizeObserver.observe(doc.body)
    }

    frame.addEventListener('load', handleLoad)
    scheduleMeasure()
    if (frame.contentDocument?.readyState === 'complete') {
      handleLoad()
    }

    return () => {
      frame.removeEventListener('load', handleLoad)
      if (intervalId != null) window.clearInterval(intervalId)
      if (rafId) cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
    }
  }, [srcDoc])

  return (
    <iframe
      ref={frameRef}
      className={className}
      srcDoc={srcDoc}
      style={frameHeight > 0 ? { height: `${frameHeight}px` } : undefined}
      title={title}
    />
  )
}
