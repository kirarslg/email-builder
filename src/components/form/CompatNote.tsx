import type { ReactNode } from 'react'

interface CompatNoteProps {
  children: ReactNode
}

/**
 * Inline compatibility warning shown in the form next to a choice that renders
 * differently (or breaks) in some email clients. Surfaces the caveat at the
 * moment of the decision instead of leaving it for the recipient to discover.
 */
export function CompatNote({ children }: CompatNoteProps) {
  return (
    <div className="ui-compat-note" role="note">
      <svg
        className="ui-compat-note__icon"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 1.5 15 14H1L8 1.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M8 6.5v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11.7" r="0.8" fill="currentColor" />
      </svg>
      <span className="ui-compat-note__text">{children}</span>
    </div>
  )
}
