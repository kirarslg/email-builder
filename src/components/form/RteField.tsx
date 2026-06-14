import { useRef, useState, useEffect, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'

// --- Font size options (Heading / Text scale) ---
interface FontSizeOption {
  value: string
  label: string
  px: number
  weight: number
}

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: 'h64', label: 'Heading 64', px: 64, weight: 700 },
  { value: 'h48', label: 'Heading 48', px: 48, weight: 700 },
  { value: 'h32', label: 'Heading 32', px: 32, weight: 700 },
  { value: 'h24', label: 'Heading 24', px: 24, weight: 700 },
  { value: 'h20', label: 'Heading 20', px: 20, weight: 700 },
  { value: 't18', label: 'Text 18',    px: 18, weight: 400 },
  { value: 't16', label: 'Text 16',    px: 16, weight: 400 },
  { value: 't13', label: 'Text 13',    px: 13, weight: 400 },
]

// --- Kit-style Size dropdown ---
interface RteSizeDropdownProps {
  onSelect: (opt: FontSizeOption) => void
}

function RteSizeDropdown({ onSelect }: RteSizeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<FontSizeOption | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      const fixedMenu = document.getElementById(menuId)
      if (rootRef.current?.contains(e.target as Node) || fixedMenu?.contains(e.target as Node)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [isOpen, menuId])

  const rootClass = ['custom-dropdown ui-dropdown ui-rte__style-dropdown', isOpen && 'is-open'].filter(Boolean).join(' ')
  const triggerClass = ['custom-dropdown__trigger', !selected && 'is-placeholder'].filter(Boolean).join(' ')

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 2, left: rect.left })
    }
    setIsOpen(o => !o)
  }

  const commit = (opt: FontSizeOption) => {
    setSelected(opt)
    setIsOpen(false)
    onSelect(opt)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setIsOpen(false); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!isOpen) handleToggle() }
    if (e.key === 'ArrowUp')   { e.preventDefault(); if (!isOpen) handleToggle() }
  }

  const menu = isOpen && menuPos ? createPortal(
    <div
      className="custom-dropdown ui-dropdown ui-rte__style-dropdown is-open rte-portal-wrap"
      style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
    >
      <ul id={menuId} className="custom-dropdown__menu" role="listbox">
        {FONT_SIZE_OPTIONS.map(opt => (
          <li
            key={opt.value}
            className={['custom-dropdown__option', selected?.value === opt.value && 'is-selected'].filter(Boolean).join(' ')}
            role="option"
            aria-selected={selected?.value === opt.value}
            tabIndex={-1}
            style={{ fontSize: `${Math.min(opt.px, 18)}px`, fontWeight: opt.weight, lineHeight: '1.4' }}
            onMouseDown={(e) => { e.preventDefault(); commit(opt) }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(opt) } }}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>,
    document.body
  ) : null

  return (
    <div ref={rootRef} className={rootClass} onKeyDown={handleKeyDown}>
      <input className="custom-dropdown__value" type="hidden" value={selected?.value ?? ''} readOnly />
      <button
        ref={triggerRef}
        className={triggerClass}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <span className="custom-dropdown__label">
          {selected ? selected.label : 'Size'}
        </span>
        <span className="custom-dropdown__chevron" aria-hidden="true">
          <svg viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {menu}
    </div>
  )
}

interface RteFieldProps {
  label: string
  value: string
  placeholder?: string
  singleLine?: boolean
  onChange: (value: string) => void
}

export function RteField({ label, value, placeholder = 'Текст', singleLine = false, onChange }: RteFieldProps) {
  const [collapsed, setCollapsed] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  // Track last value set by us (to avoid fighting with browser)
  const lastValueRef = useRef<string>('')

  // Sync external value → editor (only when not focused)
  useEffect(() => {
    const el = editorRef.current
    if (!el || document.activeElement === el) return
    if (lastValueRef.current !== value) {
      // Value is HTML if it contains tags, otherwise treat as plain text
      const isHtml = /<[a-z][\s\S]*>/i.test(value)
      el.innerHTML = isHtml ? value : (value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      lastValueRef.current = value
    }
  }, [value])

  // Emit innerHTML on every change
  const emitChange = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? ''
    lastValueRef.current = html
    onChange(html)
  }, [onChange])

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    emitChange()
  }, [emitChange])

  // Apply font size to selected text (or all content if nothing selected)
  const applyFontSize = useCallback((opt: FontSizeOption) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    const sel = window.getSelection()
    // If nothing explicitly selected — select all content first
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      document.execCommand('selectAll')
    }

    // Mark selection with a temp font element, then replace with styled span
    document.execCommand('fontSize', false, '7')
    const fonts = Array.from(editor.querySelectorAll('font[size="7"]'))
    fonts.forEach(font => {
      const span = document.createElement('span')
      span.style.fontSize = `${opt.px}px`
      span.style.fontWeight = String(opt.weight)
      while (font.firstChild) span.appendChild(font.firstChild)
      font.replaceWith(span)
    })

    emitChange()
  }, [emitChange])

  const handleInput = useCallback(() => {
    emitChange()
  }, [emitChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault()
    }
  }, [singleLine])

  const toggleLabel = collapsed ? 'Развернуть тулбар' : 'Свернуть тулбар'
  const rteClass = ['ui-rte has-toggle', collapsed && 'is-collapsed', singleLine && 'is-single-line'].filter(Boolean).join(' ')
  const editorClass = ['ui-rte__editor ui-rte__placeholder has-toggle', singleLine && 'is-single-line'].filter(Boolean).join(' ')

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={inputId}>{label}</label>
      <div className={rteClass}>
        <div className="ui-rte__toolbar">
          {/* Format group: undo/redo | B I U S | clear — always row 1 */}
          <div className="ui-rte__row ui-rte__row--format">
            <button className="ui-rte__btn" type="button" aria-label="Отменить" onClick={() => exec('undo')}>
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 7.5C3 5 5 3 7.5 3c2.2 0 4.1 1.4 4.8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3 4v3.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="Повторить" onClick={() => exec('redo')}>
              <svg viewBox="0 0 16 16" fill="none"><path d="M13 7.5C13 5 11 3 8.5 3c-2.2 0-4.1 1.4-4.8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 4v3.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="ui-rte__sep" />
            <button className="ui-rte__btn" type="button" aria-label="Жирный" onClick={() => exec('bold')}>
              <strong>B</strong>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="Курсив" onClick={() => exec('italic')}>
              <span style={{ fontStyle: 'italic', fontWeight: 600 }}>I</span>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="Подчёркивание" onClick={() => exec('underline')}>
              <span style={{ textDecoration: 'underline', fontWeight: 600 }}>U</span>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="Зачёркивание" onClick={() => exec('strikethrough')}>
              <span style={{ textDecoration: 'line-through', fontWeight: 600 }}>S</span>
            </button>
            <span className="ui-rte__sep" />
            <button className="ui-rte__btn" type="button" aria-label="Очистить форматирование" onClick={() => exec('removeFormat')}>
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 13h10M8.5 3l-5 8h3l5-8H8.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          {/* Size dropdown — row 1 when wide, row 2 when narrow (via @container) */}
          <div className="ui-rte__size-wrap">
            <span className="ui-rte__sep" />
            <RteSizeDropdown onSelect={applyFontSize} />
          </div>
          {/* Row break — shown only in wide mode to push align group to row 2 */}
          <span className="ui-rte__row-break" />
          {/* Align group: alignment | lists — row 2 when wide, follows size in narrow */}
          <div className="ui-rte__row ui-rte__row--align">
            <button className="ui-rte__btn" type="button" aria-label="По левому краю" onClick={() => exec('justifyLeft')}>
              <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="2" y="6.25" width="8" height="1.5" rx="0.75" fill="currentColor"/><rect x="2" y="9.5" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="2" y="12.75" width="8" height="1.5" rx="0.75" fill="currentColor"/></svg>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="По центру" onClick={() => exec('justifyCenter')}>
              <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="4" y="6.25" width="8" height="1.5" rx="0.75" fill="currentColor"/><rect x="2" y="9.5" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="4" y="12.75" width="8" height="1.5" rx="0.75" fill="currentColor"/></svg>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="По правому краю" onClick={() => exec('justifyRight')}>
              <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="6" y="6.25" width="8" height="1.5" rx="0.75" fill="currentColor"/><rect x="2" y="9.5" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="6" y="12.75" width="8" height="1.5" rx="0.75" fill="currentColor"/></svg>
            </button>
            <span className="ui-rte__sep" />
            <button className="ui-rte__btn" type="button" aria-label="Нумерованный список" onClick={() => exec('insertOrderedList')}>
              <svg viewBox="0 0 16 16" fill="none"><rect x="6" y="3" width="8" height="1.5" rx="0.75" fill="currentColor"/><rect x="6" y="7.25" width="8" height="1.5" rx="0.75" fill="currentColor"/><rect x="6" y="11.5" width="8" height="1.5" rx="0.75" fill="currentColor"/><path d="M2 3.5h1.5v5H2M2 3.5V2M2 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .5-.25.9-.6 1.2L3 13h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="Маркированный список" onClick={() => exec('insertUnorderedList')}>
              <svg viewBox="0 0 16 16" fill="none"><circle cx="3" cy="4" r="1.2" fill="currentColor"/><circle cx="3" cy="8" r="1.2" fill="currentColor"/><circle cx="3" cy="12" r="1.2" fill="currentColor"/><rect x="6" y="3.25" width="8" height="1.5" rx="0.75" fill="currentColor"/><rect x="6" y="7.25" width="8" height="1.5" rx="0.75" fill="currentColor"/><rect x="6" y="11.25" width="8" height="1.5" rx="0.75" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
        <div className="ui-rte__editor-stage">
          <button
            className="ui-rte__toggle"
            type="button"
            aria-label={toggleLabel}
            onClick={() => setCollapsed(c => !c)}
          >
            <svg width="18" height="15" viewBox="0 0 18 15" fill="none" aria-hidden="true">
              <path d="M0 0H18V11C18 13.2091 16.2091 15 14 15H4C1.79086 15 0 13.2091 0 11V0Z" fill="#D9DDE2"/>
              <path d="M6.3335 10.3346L9.00016 7.66797L11.6668 10.3346M6.3335 6.33464L9.00016 3.66797L11.6668 6.33464" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div
            id={inputId}
            ref={editorRef}
            className={editorClass}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={placeholder}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  )
}
