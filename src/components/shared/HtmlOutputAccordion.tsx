import { useState } from 'react'

interface HtmlOutputAccordionProps {
  html: string
  id: string
  title: string
}

export function HtmlOutputAccordion({ html, id, title }: HtmlOutputAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const regionId = `${id}Body`

  return (
    <section className="csec" data-open={isOpen ? 'true' : 'false'} id={id}>
      <button
        className="csec__head"
        type="button"
        aria-expanded={isOpen}
        aria-controls={regionId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="csec__title">
          <h3>{title}</h3>
        </span>
        <span className="csec__right">
          <span aria-hidden="true" className="csec__chev">
            <svg fill="none" height="8" viewBox="0 0 12 8" width="12" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 1L6 6L11 1"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </span>
        </span>
      </button>
      <div className="csec__body" id={regionId} role="region">
        <div className="ui-field">
          <textarea
            className="mono ui-textarea"
            readOnly
            spellCheck={false}
            style={{ minHeight: 240 }}
            value={html}
          />
        </div>
      </div>
    </section>
  )
}
