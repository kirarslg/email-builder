import { useEffect, useRef, useState } from 'react'
import { PreviewFrame } from '../shared/PreviewFrame'
import { showToast } from '../shared/Toaster'
import { slugifyFilename } from '../../domain/shared/html'

interface ReportPreviewPanelProps {
  generatedHtml: string
  htmlSize: string
  title?: string
}

export function ReportPreviewPanel({ generatedHtml, htmlSize, title }: ReportPreviewPanelProps) {
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
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 2.24252C9 1.41751 8.325 0.742508 7.5 0.742508H2.25C1.4175 0.742508 0.75 1.41751 0.75 2.24252V7.49256C0.75 8.32507 1.4175 8.99257 2.25 8.99257H2.925C2.9625 8.99257 3 9.03007 3 9.06757V9.74258C3 10.5751 3.6675 11.2426 4.5 11.2426H9.75C10.575 11.2426 11.25 10.5751 11.25 9.74258V4.49254C11.25 3.66753 10.575 2.99253 9.75 2.99253H9.075C9.03 2.99253 9 2.96252 9 2.91752V2.24252ZM9 4.04253V7.49256C9 8.32507 8.325 8.99257 7.5 8.99257H4.05C4.005 8.99257 3.975 9.03007 3.975 9.06757V9.74258C3.975 10.0351 4.2075 10.2676 4.5 10.2676H9.75C10.035 10.2676 10.275 10.0351 10.275 9.74258V4.49254C10.275 4.20753 10.035 3.96753 9.75 3.96753H9.075C9.03 3.96753 9 4.00503 9 4.04253ZM8.025 2.24252C8.025 1.95752 7.785 1.71752 7.5 1.71752H2.25C1.9575 1.71752 1.725 1.95752 1.725 2.24252V7.49256C1.725 7.78506 1.9575 8.01756 2.25 8.01756H7.5C7.785 8.01756 8.025 7.78506 8.025 7.49256V2.24252Z"
                  fill="currentColor"
                />
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
                  {
                    const name = slugifyFilename(title || '', 'report') + '.html'
                    a.download = name
                    a.click()
                    showToast({ title: 'Скачивание началось', description: name, variant: 'default' })
                  }
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
                  {
                    const name = slugifyFilename(title || '', 'report') + '.eml'
                    a.download = name
                    a.click()
                    showToast({ title: 'Скачивание началось', description: name, variant: 'default' })
                  }
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
