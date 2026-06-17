import type { ReactNode } from 'react'

interface ReportAccordionSectionProps {
  isOpen: boolean
  title: string
  onToggle: () => void
  right?: ReactNode
  children: ReactNode
  id?: string
}

export function ReportAccordionSection({
  isOpen,
  title,
  onToggle,
  right,
  children,
  id,
}: ReportAccordionSectionProps) {
  return (
    <section id={id} className="ui-accordion" data-open={isOpen ? 'true' : 'false'}>
      <button
        aria-expanded={isOpen}
        className="ui-accordion__head"
        type="button"
        onClick={onToggle}
      >
        <span className="ui-accordion__title"><h3>{title}</h3></span>
        <span className="ui-accordion__right">
          {right}
          <svg
          aria-hidden="true"
          className="ui-accordion__chev"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3.3335 6L8.00016 10.6667L12.6668 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        </span>
      </button>
      <div className="ui-accordion__body" role="region">
        <div className="ui-accordion__inner">
          {children}
        </div>
      </div>
    </section>
  )
}
