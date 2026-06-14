import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type Tab = 'email' | 'report' | 'help'
type EmailMode = 'inputs' | 'builder'

export interface HelpTourStep {
  selector: string
  title: string
  text: string
  tab?: Tab
  emailMode?: EmailMode
}

interface HelpTourProps {
  step: HelpTourStep
  onClose: () => void
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  emailViewMode: EmailMode
  setEmailViewMode: (m: EmailMode) => void
}

const CARD_WIDTH = 320
const CARD_HEIGHT_EST = 160
const GAP = 20
const PAD = 16

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

export function HelpTour({
  step,
  onClose,
  activeTab,
  setActiveTab,
  emailViewMode,
  setEmailViewMode,
}: HelpTourProps) {
  const [pos, setPos] = useState({ top: -9999, left: -9999, ready: false })
  const cardRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const liftedRef = useRef<HTMLElement[]>([])

  // Apply tab/mode context once
  useEffect(() => {
    if (step.tab && step.tab !== activeTab) setActiveTab(step.tab)
    if (step.emailMode && step.emailMode !== emailViewMode) setEmailViewMode(step.emailMode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Find target, apply spotlight, position card
  useLayoutEffect(() => {
    let raf = 0
    let tries = 0
    const MAX_TRIES = 30

    const clearHL = () => {
      if (targetRef.current) targetRef.current.classList.remove('tour-target')
      liftedRef.current.forEach((n) => n.classList.remove('tour-lifted'))
      targetRef.current = null
      liftedRef.current = []
    }

    const update = () => {
      const target = document.querySelector(step.selector) as HTMLElement | null
      if (!target || !target.getClientRects().length) {
        tries += 1
        if (tries < MAX_TRIES) raf = requestAnimationFrame(update)
        return
      }

      if (targetRef.current && targetRef.current !== target) {
        targetRef.current.classList.remove('tour-target')
      }
      liftedRef.current.forEach((n) => n.classList.remove('tour-lifted'))

      target.classList.add('tour-target')
      targetRef.current = target

      const lifted: HTMLElement[] = []
      const candidates = [
        target.closest('.card'),
        target.closest('.app-header'),
        target.closest('.report-pane'),
        target.closest('.email-pane'),
      ]
      candidates.forEach((node) => {
        if (node && node !== target && !lifted.includes(node as HTMLElement)) {
          lifted.push(node as HTMLElement)
        }
      })
      lifted.forEach((n) => n.classList.add('tour-lifted'))
      liftedRef.current = lifted

      // Position the card next to target
      const r = target.getBoundingClientRect()
      const cardEl = cardRef.current
      const cW = cardEl?.offsetWidth || CARD_WIDTH
      const cH = cardEl?.offsetHeight || CARD_HEIGHT_EST
      const vw = window.innerWidth
      const vh = window.innerHeight

      const fitsR = r.right + GAP + cW <= vw - PAD
      const fitsL = r.left - GAP - cW >= PAD
      const fitsB = r.bottom + GAP + cH <= vh - PAD
      const fitsT = r.top - GAP - cH >= PAD

      // For small targets (tabs, buttons) or targets in the top quarter of
      // the viewport, prefer placing the card BELOW so it doesn't crowd the
      // header/sticky area or clip awkwardly to a viewport edge.
      const isSmall = r.height < 60 || r.width < 200
      const isTopQuarter = r.top < vh * 0.25

      let top: number, left: number

      if ((isSmall || isTopQuarter) && fitsB) {
        // Place below, centered horizontally on target
        left = r.left + r.width / 2 - cW / 2
        top = r.bottom + GAP
      } else if (fitsR) {
        left = r.right + GAP
        top = r.top + r.height / 2 - cH / 2
      } else if (fitsL) {
        left = r.left - cW - GAP
        top = r.top + r.height / 2 - cH / 2
      } else if (fitsB) {
        left = r.left + r.width / 2 - cW / 2
        top = r.bottom + GAP
      } else if (fitsT) {
        left = r.left + r.width / 2 - cW / 2
        top = r.top - cH - GAP
      } else {
        left = vw / 2 - cW / 2
        top = vh / 2 - cH / 2
      }

      top = clamp(top, PAD, Math.max(PAD, vh - cH - PAD))
      left = clamp(left, PAD, Math.max(PAD, vw - cW - PAD))

      setPos({ top: Math.round(top), left: Math.round(left), ready: true })

      const visible = r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw
      if (!visible) {
        target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
      }
    }

    // Wait two frames for tab/mode commit
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(update)
    })

    const onResize = () => {
      cancelAnimationFrame(raf)
      tries = 0
      raf = requestAnimationFrame(update)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      clearHL()
    }
  }, [step.selector, activeTab, emailViewMode])

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label={step.title}>
      <div className="tour-backdrop" onClick={onClose} />
      <div
        className="tour-card"
        ref={cardRef}
        style={{
          top: pos.top,
          left: pos.left,
          opacity: pos.ready ? 1 : 0,
          pointerEvents: pos.ready ? 'auto' : 'none',
        }}
      >
        <h3 className="tour-card__title">{step.title}</h3>
        <p className="tour-card__text">{step.text}</p>
        <div className="tour-card__actions">
          <button
            className="ui-btn ui-btn--s ui-btn--muted"
            type="button"
            onClick={onClose}
          >
            Закрыть
          </button>
          <span className="tour-card__spacer" />
          <button className="ui-btn ui-btn--s" type="button" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  )
}
