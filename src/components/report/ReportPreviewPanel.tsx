import { useEffect, useRef, useState } from 'react'
import { PreviewFrame } from '../shared/PreviewFrame'

interface ReportPreviewPanelProps {
  generatedHtml: string
  htmlSize: string
}

export function ReportPreviewPanel({ generatedHtml, htmlSize }: ReportPreviewPanelProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)
  const downloadMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!downloadMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setDownloadMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [downloadMenuOpen])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generatedHtml)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = generatedHtml
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 1500)
  }

  return (
    <div className="card" id="reportPreviewCard">
      <div className="ui-panel-header">
        <div className="ui-panel-header__left">
          <div className="ui-panel-header__title">Превью отчёта</div>
          <div className="ui-badge ui-badge--muted">{htmlSize}</div>
        </div>
        <div className="ui-panel-header__actions">
          <button
            className={`email-icon-btn${copySuccess ? ' is-success' : ''}`}
            type="button"
            title={copySuccess ? 'Скопировано!' : 'Копировать HTML'}
            onClick={handleCopy}
          >
            {copySuccess ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5" y="5" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-7A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <div className="ui-menu-wrap" ref={downloadMenuRef}>
            <button
              className="email-icon-btn"
              type="button"
              title="Скачать"
              onClick={() => {
                if (!downloadMenuOpen) {
                  const rect = (downloadMenuRef.current?.querySelector('button') as HTMLButtonElement | null)?.getBoundingClientRect()
                  if (rect && downloadMenuRef.current) {
                    const menu = downloadMenuRef.current.querySelector('.ui-menu') as HTMLElement | null
                    if (menu) {
                      menu.style.top = (rect.bottom + 4) + 'px'
                      menu.style.right = (window.innerWidth - rect.right) + 'px'
                    }
                  }
                }
                setDownloadMenuOpen(v => !v)
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1v9M8 10l-3-3M8 10l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 12v1.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="ui-menu" role="menu" style={{ position: downloadMenuOpen ? 'fixed' : undefined, display: downloadMenuOpen ? 'block' : undefined }}>
              <button
                className="ui-menu__item"
                role="menuitem"
                type="button"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(new Blob([generatedHtml], { type: 'text/html' }))
                  a.download = 'report.html'
                  a.click()
                  setDownloadMenuOpen(false)
                }}
              >
                Скачать HTML
              </button>
              <button
                className="ui-menu__item"
                role="menuitem"
                type="button"
                onClick={() => {
                  const eml = [
                    'MIME-Version: 1.0',
                    'Content-Type: text/html; charset=UTF-8',
                    'Subject: Report',
                    'From: noreply@example.com',
                    '',
                    generatedHtml,
                  ].join('\r\n')
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(new Blob([eml], { type: 'message/rfc822' }))
                  a.download = 'report.eml'
                  a.click()
                  setDownloadMenuOpen(false)
                }}
              >
                Скачать .EML
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="body outgrid">
        <div className="preview-shell">
          <PreviewFrame className="email-preview-frame" srcDoc={generatedHtml} title="Report preview" />
        </div>
      </div>
    </div>
  )
}
