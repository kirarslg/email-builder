import { useEffect, useRef, useState } from 'react'

interface PreviewFrameProps {
  className?: string
  srcDoc: string
  title: string
  /** Called with the section key when a block tagged data-eb-section is clicked. */
  onSectionClick?: (key: string) => void
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

export function PreviewFrame({ className, srcDoc, title, onSectionClick }: PreviewFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [frameHeight, setFrameHeight] = useState(0)
  const onSectionClickRef = useRef(onSectionClick)
  onSectionClickRef.current = onSectionClick

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
      if (!doc) return

      // Click-to-edit: clicking a tagged block tells the parent which form
      // section to open. The hover affordance + listener live only in the
      // preview document, never in the exported HTML.
      if (onSectionClickRef.current && !doc.getElementById('eb-section-style')) {
        const style = doc.createElement('style')
        style.id = 'eb-section-style'
        style.textContent = '[data-eb-section]{cursor:pointer}[data-eb-section]:hover{background-color:rgba(40,189,107,.1);box-shadow:0 0 0 8px rgba(40,189,107,.1);border-radius:16px}'
        doc.head?.appendChild(style)
        doc.addEventListener('click', (event) => {
          const target = event.target as Element | null
          const el = target && target.closest ? target.closest('[data-eb-section]') : null
          const key = el?.getAttribute('data-eb-section')
          if (key) onSectionClickRef.current?.(key)
        })
      }

      if (typeof ResizeObserver === 'undefined') return

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
