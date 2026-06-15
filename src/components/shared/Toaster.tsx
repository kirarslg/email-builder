import { useEffect, useState } from 'react'

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger'

interface ToastPayload {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastItem extends ToastPayload {
  id: number
}

const TOAST_EVENT = 'app:toast'

/** Fire a toast from anywhere in the app. */
export function showToast(payload: ToastPayload) {
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }))
}

function VariantIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'success') {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
        <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (variant === 'warning') {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
        <path d="M10 6v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
      </svg>
    )
  }
  if (variant === 'danger') {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
        <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  // default — download/info
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
      <path d="M10 5.5v6M10 11.5l-2.5-2.5M10 11.5l2.5-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    let counter = 0
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail
      const id = ++counter
      const item: ToastItem = {
        id,
        title: detail.title,
        description: detail.description,
        variant: detail.variant ?? 'default',
        duration: detail.duration ?? 15000,
      }
      setToasts((prev) => [...prev, item])
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, item.duration)
    }
    window.addEventListener(TOAST_EVENT, handler)
    return () => window.removeEventListener(TOAST_EVENT, handler)
  }, [])

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (!toasts.length) return null

  return (
    <div className="app-toast-stack" role="region" aria-label="Уведомления">
      {toasts.map((t) => (
        <div key={t.id} className={`app-toast app-toast--${t.variant}`} role="status">
          <span className="app-toast__icon">
            <VariantIcon variant={t.variant ?? 'default'} />
          </span>
          <div className="app-toast__body">
            <div className="app-toast__title">{t.title}</div>
            {t.description && <div className="app-toast__desc">{t.description}</div>}
          </div>
          <button
            type="button"
            className="app-toast__close"
            aria-label="Закрыть"
            onClick={() => dismiss(t.id)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
