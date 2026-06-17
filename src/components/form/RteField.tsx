import { useRef, useState, useEffect, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { ColorPicker } from '../ui/color-picker'

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
      if (isHtml) {
        el.innerHTML = value
      } else {
        // Plain text: escape and convert \n to <br> so line breaks survive
        // round-tripping through innerHTML once any formatting is applied.
        const escaped = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r?\n/g, '<br>')
        el.innerHTML = escaped
      }
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

  // Remember the selection before opening the color popover (it steals focus).
  const savedRangeRef = useRef<Range | null>(null)
  // The span wrapped during the current picking session — updated live as the
  // user drags in the picker, so we never accumulate nested color spans.
  const sessionSpanRef = useRef<HTMLSpanElement | null>(null)
  const [textColor, setTextColor] = useState('#111111')

  const beginColorSession = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
    }
    sessionSpanRef.current = null
  }, [])

  const applyColor = useCallback((color: string) => {
    const editor = editorRef.current
    if (!editor) return

    // Use !important inline: the email template has a global
    // `span { color: ... !important; -webkit-text-fill-color: ... !important }`
    // rule, and only an important INLINE declaration outranks it.
    const paint = (el: HTMLElement) => {
      el.style.setProperty('color', color, 'important')
      el.style.setProperty('-webkit-text-fill-color', color, 'important')
    }

    // Live update: if a span was already created in this picking session and is
    // still attached, just recolor it — avoids nesting spans on every drag.
    if (sessionSpanRef.current && editor.contains(sessionSpanRef.current)) {
      paint(sessionSpanRef.current)
      emitChange()
      return
    }

    // First application of this session. Operate directly on the saved Range —
    // do NOT focus the editor or touch window.getSelection(), otherwise focus
    // leaves the colour popover and Radix closes it after the first drag.
    let range: Range | null = savedRangeRef.current
    if (!range || range.collapsed) {
      range = document.createRange()
      range.selectNodeContents(editor)
    }

    const span = document.createElement('span')
    paint(span)
    try {
      range.surroundContents(span)
    } catch {
      const frag = range.extractContents()
      span.appendChild(frag)
      range.insertNode(span)
    }
    sessionSpanRef.current = span
    savedRangeRef.current = null

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
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.75722 4.48441C10.089 4.13649 10.0795 3.582 9.73606 3.24592C9.39258 2.90984 8.84517 2.91943 8.51337 3.26735L4 7.99999L8.51337 12.7327C8.84516 13.0806 9.39258 13.0902 9.73606 12.7541C10.0795 12.418 10.089 11.8635 9.75722 11.5156L7.35819 9H13.5C15.9853 9 18 11.0147 18 13.5C18 15.9853 15.9853 18 13.5 18H11C10.4477 18 10 18.4477 10 19C10 19.5523 10.4477 20 11 20H13.5C17.0899 20 20 17.0899 20 13.5C20 9.91015 17.0899 7 13.5 7H7.35818L9.75722 4.48441Z" fill="currentColor"/></svg>
            </button>
            <button className="ui-rte__btn" type="button" aria-label="Повторить" onClick={() => exec('redo')}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.2428 4.48441C13.911 4.13649 13.9205 3.582 14.2639 3.24592C14.6074 2.90984 15.1548 2.91943 15.4866 3.26735L20 7.99999L15.4866 12.7327C15.1548 13.0806 14.6074 13.0902 14.2639 12.7541C13.9205 12.418 13.911 11.8635 14.2428 11.5156L16.6418 9H10.5C8.01472 9 6 11.0147 6 13.5C6 15.9853 8.01472 18 10.5 18H13C13.5523 18 14 18.4477 14 19C14 19.5523 13.5523 20 13 20H10.5C6.91015 20 4 17.0899 4 13.5C4 9.91015 6.91015 7 10.5 7H16.6418L14.2428 4.48441Z" fill="currentColor"/></svg>
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
            <ColorPicker
              value={textColor}
              aria-label="Цвет текста"
              className="ui-rte__btn ui-rte__btn--color"
              onTriggerMouseDown={() => beginColorSession()}
              onChange={(c) => { setTextColor(c); applyColor(c) }}
              trigger={<span className="ui-rte__btn--color__glyph" aria-hidden="true">A</span>}
            />
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
