import { useDeferredValue, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { CheckboxField } from '../components/form/CheckboxField'
import { ErrorLightIconButton } from '../components/form/ErrorLightIconButton'
import { ColorField } from '../components/form/ColorField'
import { ImageUploadField } from '../components/form/ImageUploadField'
import { NumberField } from '../components/form/NumberField'
import { RichTextField } from '../components/form/RichTextField'
import { SelectField } from '../components/form/SelectField'
import { RteField } from '../components/form/RteField'
import { TextField } from '../components/form/TextField'
import { TextareaField } from '../components/form/TextareaField'
import { HtmlOutputAccordion } from '../components/shared/HtmlOutputAccordion'
import { PreviewFrame } from '../components/shared/PreviewFrame'
import { showToast } from '../components/shared/Toaster'
import { createDefaultEmailFormData } from '../domain/email/defaults'
import { buildEmailHtmlForInputs } from '../domain/email/render'
import { emailFormReducer } from '../domain/email/reducer'
import type { BuilderBlock } from '../domain/email/types'
import { getImageSize, fileToDataUrl } from '../domain/shared/files'
import { formatKilobytes, safeUrl, slugifyFilename } from '../domain/shared/html'

const emailDefaults = createDefaultEmailFormData()

interface EmailPageProps {
  emailViewMode: 'inputs' | 'builder'
  onViewModeChange: (mode: 'inputs' | 'builder') => void
}

export function EmailPage({ emailViewMode, onViewModeChange }: EmailPageProps) {
  const [state, dispatch] = useReducer(emailFormReducer, emailDefaults)
  const [draggingBuilderBlockId, setDraggingBuilderBlockId] = useState<string | null>(null)
  const [builderSectionsOpen, setBuilderSectionsOpen] = useState<Record<string, boolean>>({
    library: true,
    structure: true,
    blocks: true,
    inspectorPreview: true,
    inspectorSettings: true,
  })
  const [inputsSectionsOpen, setInputsSectionsOpen] = useState<Record<string, boolean>>({
    header: false,
    bg: false,
    headerImg: false,
    body: false,
    button: false,
    divider: false,
    signature: false,
  })
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)
  const [canvasImageBlockId, setCanvasImageBlockId] = useState<string | null>(null)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [editingButtonUrl, setEditingButtonUrl] = useState<string>('')
  const handleViewModeChange = (mode: 'inputs' | 'builder') => {
    onViewModeChange(mode)
    dispatch({ type: 'setEmailViewMode', value: mode })
  }
  const editingElemRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (editingBlockId && editingElemRef.current) {
      const el = editingElemRef.current
      el.focus()
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(el)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editingBlockId])
  const builderHeaderInputRef = useRef<HTMLInputElement>(null)
  const builderImageInputRef = useRef<HTMLInputElement>(null)
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

  const deferredState = useDeferredValue(state)

  const generatedHtml = useMemo(() => buildEmailHtmlForInputs(deferredState), [deferredState])
  const htmlSize = useMemo(() => formatKilobytes(new Blob([generatedHtml]).size), [generatedHtml])

  async function handleHeaderUpload(files: FileList) {
    const nextImages = await Promise.all(
      Array.from(files).map(async (file) => ({
        src: await fileToDataUrl(file),
        name: file.name,
      })),
    )

    dispatch({
      type: 'patch',
      patch: {
        headerImages: nextImages,
      },
    })
  }

  async function handleSignatureUpload(files: FileList) {
    const file = files[0]
    if (!file) return

    const src = await fileToDataUrl(file)
    const size = await getImageSize(src)

    dispatch({
      type: 'patch',
      patch: {
        signatureImage: {
          src,
          name: file.name,
          width: size.width,
          height: size.height,
        },
      },
    })
  }

  async function handleBuilderHeaderUpload(files: FileList) {
    const nextImages = await Promise.all(
      Array.from(files).slice(0, 1).map(async (file) => ({
        src: await fileToDataUrl(file),
        name: file.name,
      })),
    )

    dispatch({
      type: 'patch',
      patch: {
        builderHeaderImages: nextImages,
      },
    })
  }

  async function handleBuilderImageUpload(files: FileList, blockId: string) {
    const file = files[0]
    if (!file) return
    const src = await fileToDataUrl(file)
    dispatch({ type: 'setBuilderImageUrl', blockId, value: src })
  }

  const builderColumns = state.builderRows.flatMap((row) => row.columns)
  const hasEmptyBuilderColumn = builderColumns.some((col) => col.blocks.length === 0)
  const selectedBuilderBlock = state.builderRows
    .flatMap((row) => row.columns)
    .flatMap((column) => column.blocks)
    .find((block) => block.id === state.builderSelectedBlockId) || null

  const selectedBuilderColumn = state.builderRows
    .flatMap((row) => row.columns)
    .find((column) => column.blocks.some((block) => block.id === state.builderSelectedBlockId)) || null

  const getBuilderBlockLabel = (type: BuilderBlock['type']) => {
    switch (type) {
      case 'header':
        return 'Шапка письма'
      case 'greeting':
        return 'Приветствие'
      case 'heading':
        return 'Заголовок'
      case 'text':
        return 'Текст'
      case 'button':
        return 'Кнопка'
      case 'divider':
        return 'Разделитель'
      case 'spacer':
        return 'Отступ'
      case 'image':
        return 'Картинка'
    }
  }


  const getBuilderBlockIcon = (type: BuilderBlock['type']) => {
    switch (type) {
      case 'header':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><rect x="0.5" y="0.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 7L3.5 4.5l2 2 1.5-2L9 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
      case 'heading':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 2v6M4.5 2v6M1 5.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 5.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 3.5l1.5 2-1.5 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
      case 'greeting':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2.5 8L5 2l2.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.5 6h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      case 'text':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 2.5h8M1 5h8M1 7.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      case 'image':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><rect x="0.5" y="0.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="3.5" cy="3.5" r="1" fill="currentColor"/><path d="M1 7.5l2.5-3 2 2.5 1.5-2 2.5 2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
      case 'button':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><rect x="0.5" y="2.5" width="9" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      case 'divider':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      case 'spacer':
        return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M5 1.5v7M2 1.5h6M2 8.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
    }
  }

  const getBuilderBlockTitle = (block: BuilderBlock) => {
    return getBuilderBlockLabel(block.type)
  }

  const getBuilderBlockHint = (block: BuilderBlock) => {
    switch (block.type) {
      case 'header':
        return state.builderHeaderImages[0]?.name || 'Изображение шапки не задано'
      case 'greeting':
      case 'heading':
      case 'text':
        return block.text || 'Пустой текстовый блок'
      case 'button':
        return block.text || 'Без текста кнопки'
      case 'divider':
        return 'Разделитель письма'
      case 'spacer':
        return `${block.size}px вертикальный отступ`
      case 'image':
        return block.name || block.src || 'Изображение не задано'
    }
  }

  const renderBuilderBlockPreview = (block: BuilderBlock) => {
    const buttonBackground =
      state.buttonBgMode === 'gradient'
        ? `linear-gradient(90deg, ${state.buttonBg1}, ${state.buttonBg2})`
        : state.buttonBg1
    const buttonHeight = state.buttonSize === 's' ? 36 : 44
    const buttonFontSize = state.buttonSize === 's' ? 13 : 14
    const headerOverlayAlign =
      state.headerBlockAlignMode === 'center'
        ? 'center'
        : state.headerBlockAlignMode === 'right'
          ? 'flex-end'
          : 'flex-start'

    switch (block.type) {
      case 'header':
        return (
          <div className="builder-preview builder-preview--header">
            {state.builderHeaderImages[0]?.src ? (
              <>
                <img alt="" className="builder-preview__image" src={state.builderHeaderImages[0].src} />
                {(state.headerTitleEnabled || state.headerDescEnabled) && (
                  <div
                    className="builder-preview__overlay"
                    style={{ alignItems: headerOverlayAlign, textAlign: state.headerBlockAlignMode }}
                  >
                    {state.headerTitleEnabled && state.headerTitle && (
                      <div className="builder-preview__overlay-title" style={{ color: state.textColor }}>
                        {state.headerTitle}
                      </div>
                    )}
                    {state.headerDescEnabled && state.headerDesc && (
                      <div className="builder-preview__overlay-text" style={{ color: state.textColor }}>
                        {state.headerDesc}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <span className="builder-preview__empty">Изображение шапки</span>
            )}
          </div>
        )
      case 'greeting':
      case 'heading':
      case 'text':
        return (
          <div
            className={`builder-preview builder-preview--text builder-preview--${block.type}`}
            style={{
              color:
                block.type === 'heading'
                  ? state.builderHeadingColor
                  : block.type === 'greeting'
                    ? state.builderGreetingColor
                    : state.textColor,
              fontSize:
                block.type === 'heading'
                  ? `${state.builderHeadingSize}px`
                  : block.type === 'greeting'
                    ? `${state.builderGreetingSize}px`
                    : undefined,
            }}
          >
            {block.text || 'Пустой текст'}
          </div>
        )
      case 'button':
        return (
          <div
            className="builder-preview builder-preview--button"
            style={{
              background: buttonBackground,
              color: state.buttonFg,
              borderRadius: `${state.buttonRadius}px`,
              width: state.buttonWidth ? `${state.buttonWidth}px` : undefined,
              minHeight: `${buttonHeight}px`,
              fontSize: `${buttonFontSize}px`,
              justifySelf:
                state.buttonAlign === 'left' ? 'start' : state.buttonAlign === 'right' ? 'end' : 'center',
            }}
          >
            {block.text || 'Кнопка'}
          </div>
        )
      case 'divider':
        return <div className="builder-preview builder-preview--divider" style={{ background: state.dividerColor }} />
      case 'spacer':
        return (
          <div className="builder-preview builder-preview--spacer" style={{ minHeight: `${Math.max(block.size, 24)}px` }}>
            {block.size}px spacer
          </div>
        )
      case 'image':
        return block.src ? (
          <div className="builder-preview builder-preview--image">
            <img alt="" className="builder-preview__image" src={block.src} />
          </div>
        ) : (
          <div className="builder-preview builder-preview--image builder-preview--empty">Блок изображения</div>
        )
      default:
        return null
    }
  }

  const renderBuilderColumnCanvas = (columnId: string, blocks: BuilderBlock[]) => {
    if (!blocks.length) {
      return <div className="builder-col__empty">Пустая колонка</div>
    }

    const canMoveBuilderBlock = (blockId: string, direction: 'up' | 'down') => {
      const index = blocks.findIndex((block) => block.id === blockId)
      if (index < 0) return false
      return direction === 'up' ? index > 0 : index < blocks.length - 1
    }

    const canClearBuilderBlock = (block: BuilderBlock) => {
      if (block.type === 'header' || block.type === 'divider') return false
      if (block.type === 'button') return Boolean(block.text.trim() || block.url.trim())
      if (block.type === 'image') return Boolean(block.src)
      if (block.type === 'spacer') return block.size !== 16
      if ('text' in block) return Boolean(block.text.trim())
      return false
    }

    const renderBuilderQuickEditor = (block: BuilderBlock) => {
      if (block.type === 'header') {
        return (
          <div className="builder-node__editor" onClick={(event) => event.stopPropagation()}>
            <label className="builder-node__editor-label">Изображение шапки</label>
            <input
              className="ui-input"
              value={state.builderHeaderImages[0]?.src || ''}
              onChange={(event) => dispatch({ type: 'setBuilderHeaderImageUrl', value: event.target.value })}
            />
            <ImageUploadField
              label="Файл шапки"
              items={state.builderHeaderImages}
              onUpload={handleBuilderHeaderUpload}
              onRemove={() => dispatch({ type: 'setBuilderHeaderImageUrl', value: '' })}
              buttonLabel="Выбрать изображение"
            />
            <label className="builder-node__editor-label">Текст поверх шапки</label>
            <input
              className="ui-input"
              value={state.headerTitle}
              onChange={(event) => dispatch({ type: 'setText', field: 'headerTitle', value: event.target.value })}
            />
            <textarea
              className="ui-input builder-node__editor-textarea"
              value={state.headerDesc}
              onChange={(event) => dispatch({ type: 'setText', field: 'headerDesc', value: event.target.value })}
            />
          </div>
        )
      }

      if (block.type === 'button') {
        return (
          <div className="builder-node__editor" onClick={(event) => event.stopPropagation()}>
            <label className="builder-node__editor-label">Текст кнопки</label>
            <input
              className="ui-input"
              value={block.text}
              onChange={(event) => dispatch({ type: 'setBuilderBlockText', blockId: block.id, value: event.target.value })}
            />
            <label className="builder-node__editor-label">Ссылка</label>
            <input
              className="ui-input"
              value={block.url}
              onChange={(event) => dispatch({ type: 'setBuilderBlockUrl', blockId: block.id, value: event.target.value })}
            />
          </div>
        )
      }

      if ('text' in block) {
        return (
          <div className="builder-node__editor" onClick={(event) => event.stopPropagation()}>
            <label className="builder-node__editor-label">Быстрое редактирование</label>
            <textarea
              className="ui-input builder-node__editor-textarea"
              value={block.text}
              onChange={(event) => dispatch({ type: 'setBuilderBlockText', blockId: block.id, value: event.target.value })}
            />
          </div>
        )
      }

      if (block.type === 'spacer') {
        return (
          <div className="builder-node__editor" onClick={(event) => event.stopPropagation()}>
            <label className="builder-node__editor-label">Высота отступа</label>
            <input
              className="ui-input"
              inputMode="numeric"
              value={String(block.size)}
              onChange={(event) => {
                const next = Number(event.target.value.trim())
                if (Number.isFinite(next)) {
                  dispatch({ type: 'setBuilderSpacerSize', blockId: block.id, value: next })
                }
              }}
            />
          </div>
        )
      }

      if (block.type === 'image') {
        return (
          <div className="builder-node__editor" onClick={(event) => event.stopPropagation()}>
            <label className="builder-node__editor-label">URL изображения</label>
            <input
              className="ui-input"
              value={block.src}
              onChange={(event) => dispatch({ type: 'setBuilderImageUrl', blockId: block.id, value: event.target.value })}
            />
            <ImageUploadField
              label="Файл изображения"
              items={block.src ? [{ src: block.src, name: block.name || 'Изображение' }] : []}
              onUpload={(files) => handleBuilderImageUpload(files, block.id)}
              onRemove={() => dispatch({ type: 'setBuilderImageUrl', blockId: block.id, value: '' })}
              buttonLabel="Выбрать изображение"
            />
          </div>
        )
      }

      return null
    }

    return (
      <div className="builder-stack">
        {blocks.map((block, index) => (
          <div key={block.id}>
            <div
              className={`builder-dropzone ${draggingBuilderBlockId ? 'is-visible' : ''}`}
              onDragOver={(event) => {
                event.preventDefault()
              }}
              onDrop={(event) => {
                event.preventDefault()
                if (!draggingBuilderBlockId) return
                dispatch({
                  type: 'moveBuilderBlockToPosition',
                  blockId: draggingBuilderBlockId,
                  targetColumnId: columnId,
                  targetIndex: index,
                })
                setDraggingBuilderBlockId(null)
              }}
            />
            <div
              draggable
              className={`builder-node ${state.builderSelectedBlockId === block.id ? 'is-selected' : ''} ${draggingBuilderBlockId === block.id ? 'is-dragging' : ''}`}
              onDragStart={() => setDraggingBuilderBlockId(block.id)}
              onDragEnd={() => setDraggingBuilderBlockId(null)}
            >
              <div className="builder-node__toolbar">
                <div className="builder-node__toolbar-group">
                  <button
                    type="button"
                    className="ui-btn ui-btn--xs ui-btn--secondary"
                    disabled={!canMoveBuilderBlock(block.id, 'up')}
                    onClick={(event) => {
                      event.stopPropagation()
                      dispatch({ type: 'moveBuilderBlock', blockId: block.id, direction: 'up' })
                    }}
                  >
                    Вверх
                  </button>
                  <button
                    type="button"
                    className="ui-btn ui-btn--xs ui-btn--secondary"
                    disabled={!canMoveBuilderBlock(block.id, 'down')}
                    onClick={(event) => {
                      event.stopPropagation()
                      dispatch({ type: 'moveBuilderBlock', blockId: block.id, direction: 'down' })
                    }}
                  >
                    Вниз
                  </button>
                </div>
                <div className="builder-node__toolbar-group">
                  {canClearBuilderBlock(block) && (
                    <button
                      type="button"
                      className="ui-btn ui-btn--xs ui-btn--secondary"
                      onClick={(event) => {
                        event.stopPropagation()
                        dispatch({ type: 'clearBuilderBlock', blockId: block.id })
                      }}
                    >
                      Очистить
                    </button>
                  )}
                  {block.type !== 'header' && (
                    <button
                      type="button"
                      className="ui-btn ui-btn--xs ui-btn--error-light"
                      onClick={(event) => {
                        event.stopPropagation()
                        dispatch({ type: 'removeBuilderBlock', blockId: block.id })
                      }}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="builder-node__surface"
                onClick={(event) => {
                  event.stopPropagation()
                  dispatch({ type: 'setBuilderActiveColumn', columnId })
                  dispatch({ type: 'setBuilderSelectedBlock', blockId: block.id })
                }}
              >
                <div className="builder-node__meta">
                  <span className="builder-node__type">{getBuilderBlockTitle(block)}</span>
                  <span className="builder-node__hint">{getBuilderBlockHint(block)}</span>
                </div>
                <div className="builder-node__preview">{renderBuilderBlockPreview(block)}</div>
              </button>

              {state.builderSelectedBlockId === block.id && renderBuilderQuickEditor(block)}
            </div>
          </div>
        ))}
        <div
          className={`builder-dropzone ${draggingBuilderBlockId ? 'is-visible' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
          }}
          onDrop={(event) => {
            event.preventDefault()
            if (!draggingBuilderBlockId) return
            dispatch({
              type: 'moveBuilderBlockToPosition',
              blockId: draggingBuilderBlockId,
              targetColumnId: columnId,
              targetIndex: blocks.length,
            })
            setDraggingBuilderBlockId(null)
          }}
        />
      </div>
    )
  }

  const toggleBuilderSection = (key: string) => {
    setBuilderSectionsOpen((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const renderBuilderSection = (key: string, title: string, content: React.ReactNode, right?: React.ReactNode) => {
    const isOpen = builderSectionsOpen[key] !== false
    return (
      <section className="ui-accordion builder-csec" data-open={isOpen ? 'true' : 'false'}>
        <button
          aria-expanded={isOpen}
          className="ui-accordion__head"
          type="button"
          onClick={() => toggleBuilderSection(key)}
        >
          <span className="ui-accordion__title">
            <h3>{title}</h3>
          </span>
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
            <div className="builder-csec__content">{content}</div>
          </div>
        </div>
      </section>
    )
  }

  const renderInputsSection = (title: string, content: React.ReactNode, key: string, rightEl?: React.ReactNode) => {
    const isOpen = inputsSectionsOpen[key] ?? false
    const toggle = () => setInputsSectionsOpen(s => ({ ...s, [key]: !s[key] }))
    return (
      <section className="ui-accordion" data-open={isOpen ? 'true' : 'false'}>
        <button className="ui-accordion__head" type="button" aria-expanded={isOpen} onClick={toggle}>
          <span className="ui-accordion__title"><h3>{title}</h3></span>
          <span className="ui-accordion__right">
            {rightEl}
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
          <div className="ui-accordion__inner">{content}</div>
        </div>
      </section>
    )
  }

  // Collapsible grey sub-group bar from the UI kit (ui-group-head), as used in
  // the report editors. Optional `check` renders the green checkbox toggle.
  const renderHeaderGroup = (
    title: string,
    key: string,
    content: React.ReactNode,
    check?: { checked: boolean; onChange: (value: boolean) => void },
  ) => {
    // Header sub-groups are expanded by default.
    const open = inputsSectionsOpen[key] ?? true
    const toggle = () => setInputsSectionsOpen(s => ({ ...s, [key]: s[key] === undefined ? false : !s[key] }))
    return (
      <div className="form-section">
        <div className="ui-group-head" style={{ cursor: 'pointer' }} onClick={toggle}>
          <span className="ui-group-head__title">{title}</span>
          <span className="ui-group-head__right">
            {check && (
              <label className="ui-checkbox" style={{ margin: 0 }} onClick={(event) => event.stopPropagation()}>
                <input type="checkbox" checked={check.checked} onChange={(event) => check.onChange(event.target.checked)} />
              </label>
            )}
            <svg
              aria-hidden="true"
              className="ui-group-head__chevron"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
            >
              <path d="M6 3.3335L10.6667 8.00016L6 12.6668" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {open && content}
      </div>
    )
  }

  return (
    <>
      <div className={`card email-pane email-pane-inputs${emailViewMode === 'builder' ? ' is-hidden' : ''}`} id="emailInputsCard">
        <div className="ui-panel-header">
          <h2 className="ui-panel-header__title">Настройка через формы</h2>
          <div className="ui-panel-header__actions">
            <div className="email-view-toggle">
              <button
                className={'email-view-btn' + (emailViewMode === 'inputs' ? ' is-active' : '')}
                type="button"
                title="Режим полей"
                onClick={() => handleViewModeChange('inputs')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1" y="2" width="14" height="2" rx="1" fill="currentColor"/>
                  <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor"/>
                  <rect x="1" y="12" width="14" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <button
                className={'email-view-btn' + (emailViewMode === 'builder' ? ' is-active' : '')}
                type="button"
                title="Режим конструктора"
                onClick={() => handleViewModeChange('builder')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor"/>
                  <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor"/>
                  <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor"/>
                  <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="ui-accordion-list">
          {renderInputsSection('Основные стили', <>
            <div className="field-group">
              <ColorField
                label="Цвет основного фона"
                value={state.bgOuter}
                fallback="#edf2f6"
                onChange={(value) => dispatch({ type: 'setText', field: 'bgOuter', value })}
              />
              <ColorField
                label="Цвет тела письма"
                value={state.bgBody}
                fallback="#ffffff"
                onChange={(value) => dispatch({ type: 'setText', field: 'bgBody', value })}
              />
            </div>
            <div className="field-group">
              <NumberField
                label="Отступ сверху"
                value={state.marginTop}
                onChange={(value) => dispatch({ type: 'setNumber', field: 'marginTop', value })}
              />
              <NumberField
                label="Отступ снизу"
                value={state.marginBottom}
                onChange={(value) => dispatch({ type: 'setNumber', field: 'marginBottom', value })}
              />
            </div>
          </>, 'bg')}


          {renderInputsSection('Шапка', <>
            {renderHeaderGroup('Картинка', 'hdrImage', <>
              <ImageUploadField
                description="Файлы будут вставлены в итоговый HTML как data-картинки (base64). Для реальных рассылок надежнее использовать URL на картинку."
                multiple
                items={state.headerImages}
                onUpload={handleHeaderUpload}
                onRemove={(index = 0) =>
                  dispatch({
                    type: 'patch',
                    patch: {
                      headerImages: state.headerImages.filter((_, imageIndex) => imageIndex !== index),
                    },
                  })
                }
              />
              <TextField
                label="URL картинки"
                placeholder="https://example.com/header.png"
                value={state.headerImages[0]?.src || ''}
                onChange={(value) =>
                  dispatch({
                    type: 'patch',
                    patch: {
                      headerImages: value.trim()
                        ? [{ src: safeUrl(value) || value.trim(), name: 'Remote header image' }]
                        : [],
                    },
                  })
                }
              />
              <div className="field-group">
                <TextField
                  label="Ссылка по клику на шапку"
                  placeholder="https://example.com"
                  value={state.headerLinkUrl}
                  onChange={(value) =>
                    dispatch({
                      type: 'setText',
                      field: 'headerLinkUrl',
                      value: safeUrl(value) || value,
                    })
                  }
                />
                <TextField
                  label="Alt-текст"
                  placeholder="Логотип компании"
                  value={state.headerAlt}
                  onChange={(value) => dispatch({ type: 'setText', field: 'headerAlt', value })}
                />
              </div>
            </>)}

            {renderHeaderGroup('Контент', 'hdrContent', <>
              <div className="field-group">
                <TextField
                  label="Заголовок"
                  placeholder="Заголовок письма"
                  value={state.headerTitle}
                  onChange={(value) => dispatch({ type: 'setText', field: 'headerTitle', value })}
                />
                <TextField
                  label="Текст"
                  placeholder="Описание под заголовком"
                  value={state.headerDesc}
                  onChange={(value) => dispatch({ type: 'setText', field: 'headerDesc', value })}
                />
              </div>
              <div className="field-group">
                <SelectField
                  label="Выравнивание заголовка"
                  value={state.headerTitleAlign}
                  options={[
                    { value: 'left', label: 'Слева' },
                    { value: 'center', label: 'По центру' },
                    { value: 'right', label: 'Справа' },
                  ]}
                  onChange={(value) => dispatch({ type: 'patch', patch: { headerTitleAlign: value as typeof state.headerTitleAlign } })}
                />
                <SelectField
                  label="Выравнивание текста"
                  value={state.headerDescAlign}
                  options={[
                    { value: 'left', label: 'Слева' },
                    { value: 'center', label: 'По центру' },
                    { value: 'right', label: 'Справа' },
                  ]}
                  onChange={(value) => dispatch({ type: 'patch', patch: { headerDescAlign: value as typeof state.headerDescAlign } })}
                />
              </div>
            </>, {
              checked: state.headerTitleEnabled || state.headerDescEnabled,
              onChange: (value) =>
                dispatch({ type: 'patch', patch: { headerTitleEnabled: value, headerDescEnabled: value } }),
            })}

            {renderHeaderGroup('Цвета', 'hdrColors', <>
              <div className="field-group">
                <ColorField
                  label="Цвет фона"
                  value={state.headerBgColor}
                  fallback="#ecf2f3"
                  onChange={(value) => dispatch({ type: 'setText', field: 'headerBgColor', value })}
                />
                <ColorField
                  label="Цвет заголовка"
                  value={state.headerTitleColor}
                  fallback="#333333"
                  onChange={(value) => dispatch({ type: 'setText', field: 'headerTitleColor', value })}
                />
              </div>
              <div className="field-group">
                <ColorField
                  label="Цвет бордера шапки"
                  value={state.headerBorderColor}
                  fallback="#dde5ea"
                  onChange={(value) => dispatch({ type: 'setText', field: 'headerBorderColor', value })}
                />
                <ColorField
                  label="Цвет текста"
                  value={state.headerTextColor}
                  fallback="#333333"
                  onChange={(value) => dispatch({ type: 'setText', field: 'headerTextColor', value })}
                />
              </div>
            </>)}
          </>, 'headerImg')}


          {renderInputsSection('Заголовок и приветствие', <>
            <div className="field-group">
              <div className="ui-field-with-toggle">
                <RteField
                  label="Заголовок"
                  placeholder="Заголовок письма"
                  singleLine
                  value={state.subject}
                  onChange={(value) => dispatch({ type: 'setText', field: 'subject', value })}
                />
                <CheckboxField
                  label="Включить"
                  checked={!state.hideSubject}
                  onChange={(checked) => dispatch({ type: 'setBoolean', field: 'hideSubject', value: !checked })}
                />
              </div>
              <div className="ui-field-with-toggle">
                <RteField
                  label="Приветствие"
                  placeholder="Здравствуйте, коллега!"
                  singleLine
                  value={state.greeting}
                  onChange={(value) => {
                    dispatch({ type: 'setText', field: 'greeting', value })
                    const plainText = value.replace(/<[^>]*>/g, '').trim()
                    if (!plainText) dispatch({ type: 'setBoolean', field: 'hideGreeting', value: true })
                  }}
                />
                <CheckboxField
                  label="Включить"
                  checked={!state.hideGreeting && !!state.greeting.replace(/<[^>]*>/g, '').trim()}
                  onChange={(checked) => dispatch({ type: 'setBoolean', field: 'hideGreeting', value: !checked })}
                />
              </div>
            </div>
          </>, 'header')}


          {renderInputsSection('Тело', <>
            <RteField
              label="Текст"
              placeholder="Текст письма"
              value={state.intro}
              onChange={(value) => dispatch({ type: 'setText', field: 'intro', value })}
            />
            <div className="ui-field-with-toggle">
              <TextField
                label="Call to action"
                placeholder="Enter text"
                value={state.cta}
                onChange={(value) => dispatch({ type: 'setText', field: 'cta', value })}
              />
              <CheckboxField
                label="Включить"
                checked={!state.hideCta}
                onChange={(checked) => dispatch({ type: 'setBoolean', field: 'hideCta', value: !checked })}
              />
            </div>
          </>, 'body')}


          {renderInputsSection('Кнопка', <>
            {/* Контент */}
            <div className="form-section">
              <div className="ui-group-head"><span className="ui-group-head__title">Контент</span></div>
              <div className="field-group">
                <TextField
                  label="Текст кнопки"
                  value={state.buttonText}
                  onChange={(value) => dispatch({ type: 'setText', field: 'buttonText', value })}
                />
                <TextField
                  label="URL кнопки"
                  placeholder="https://example.com"
                  value={state.buttonUrl}
                  onChange={(value) => dispatch({ type: 'setText', field: 'buttonUrl', value: safeUrl(value) || value })}
                />
              </div>
            </div>

            {/* Свойства */}
            <div className="form-section">
              <div className="ui-group-head"><span className="ui-group-head__title">Свойства</span></div>
              <div className="field-group field-group--3">
                <SelectField
                  label="Положение"
                  value={state.buttonAlign}
                  options={[
                    { value: 'left', label: 'Слева' },
                    { value: 'center', label: 'По центру' },
                    { value: 'right', label: 'Справа' },
                  ]}
                  onChange={(value) => dispatch({ type: 'patch', patch: { buttonAlign: value as typeof state.buttonAlign } })}
                />
                <SelectField
                  label="Размер"
                  value={state.buttonSize}
                  options={[
                    { value: 's', label: 'S' },
                    { value: 'm', label: 'M' },
                  ]}
                  onChange={(value) => dispatch({ type: 'patch', patch: { buttonSize: value === 's' ? 's' : 'm' } })}
                />
                <ColorField
                  label="Цвет текста"
                  value={state.buttonFg}
                  fallback="#ffffff"
                  onChange={(value) => dispatch({ type: 'setText', field: 'buttonFg', value })}
                />
              </div>
              <div className="field-group field-group--3">
                <NumberField
                  label="Ширина кнопки"
                  value={state.buttonWidth}
                  allowEmpty
                  onChange={(value) => dispatch({ type: 'setNumber', field: 'buttonWidth', value })}
                />
                <NumberField
                  label="Скругление углов"
                  value={state.buttonRadius}
                  onChange={(value) => dispatch({ type: 'setNumber', field: 'buttonRadius', value })}
                />
                <SelectField
                  label="Тип цвета кнопки"
                  value={state.buttonBgMode}
                  options={[
                    { value: 'solid', label: 'Однотонный' },
                    { value: 'gradient', label: 'Градиент' },
                  ]}
                  onChange={(value) => dispatch({ type: 'patch', patch: { buttonBgMode: value === 'gradient' ? 'gradient' : 'solid' } })}
                />
              </div>

              {/* Цвет — зависит от типа */}
              {state.buttonBgMode === 'solid' ? (
                <div className="field-group field-group--3">
                  <ColorField
                    label="Цвет кнопки"
                    value={state.buttonBg1}
                    fallback="#111111"
                    onChange={(value) => dispatch({ type: 'setText', field: 'buttonBg1', value })}
                  />
                </div>
              ) : (
                <div className="field-group field-group--3">
                  <ColorField
                    label="Цвет №1"
                    value={state.buttonBg1}
                    fallback="#111111"
                    onChange={(value) => dispatch({ type: 'setText', field: 'buttonBg1', value })}
                  />
                  <ColorField
                    label="Цвет №2"
                    value={state.buttonBg2}
                    fallback="#0b57d0"
                    onChange={(value) => dispatch({ type: 'setText', field: 'buttonBg2', value })}
                  />
                  <SelectField
                    label="Направление градиента"
                    value={state.buttonGradDir}
                    options={[
                      { value: 'lr', label: 'Слева направо' },
                      { value: 'tb', label: 'Сверху вниз' },
                      { value: 'trbl', label: 'Слева сверху' },
                      { value: 'tlbr', label: 'Справа сверху' },
                    ]}
                    onChange={(value) => dispatch({ type: 'setText', field: 'buttonGradDir', value })}
                  />
                </div>
              )}
            </div>
          </>, 'button', <label className="ui-checkbox ui-checkbox--bare" style={{margin:'0 6px 0 0'}} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={state.withButton} onChange={e=>dispatch({type:'setBoolean',field:'withButton',value:e.target.checked})}/></label>)}


          {renderInputsSection('Разделитель', <>
            <ColorField
              label="Divider color"
              value={state.dividerColor}
              fallback="#1f1f1f"
              onChange={(value) => dispatch({ type: 'setText', field: 'dividerColor', value })}
            />
          </>, 'divider', <label className="ui-checkbox ui-checkbox--bare" style={{margin:'0 6px 0 0'}} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={state.withDivider} onChange={e=>dispatch({type:'setBoolean',field:'withDivider',value:e.target.checked})}/></label>)}


          {renderInputsSection('Подпись', <>
            <ImageUploadField
              label="Картинка (PNG, JPEG)"
              items={state.signatureImage ? [state.signatureImage] : []}
              onUpload={handleSignatureUpload}
              onRemove={() =>
                dispatch({
                  type: 'patch',
                  patch: { signatureImage: null },
                })
              }
            />
            {state.signatureImage && (
              <SelectField
                label="Выравнивание изображения"
                value={state.signatureImageAlign}
                options={[
                  { value: 'left', label: 'Слева' },
                  { value: 'center', label: 'По центру' },
                  { value: 'right', label: 'Справа' },
                ]}
                onChange={(value) =>
                  dispatch({
                    type: 'patch',
                    patch: { signatureImageAlign: value as typeof state.signatureImageAlign },
                  })
                }
              />
            )}
            <div className="ui-group-head">
              <span className="ui-group-head__title">Контакты</span>
            </div>
            <div className="field-group">
              <TextField
                label="Имя"
                value={state.senderName}
                placeholder="Иванов Иван"
                onChange={(value) => dispatch({ type: 'setText', field: 'senderName', value })}
              />
              <TextField
                label="Должность"
                value={state.senderTitle}
                onChange={(value) => dispatch({ type: 'setText', field: 'senderTitle', value })}
              />
            </div>
            <div className="field-group">
              <TextField
                label="Название продукта"
                value={state.senderCompany}
                onChange={(value) => dispatch({ type: 'setText', field: 'senderCompany', value })}
              />
              <TextField
                label="Телефон"
                value={state.senderPhone}
                placeholder="+ 7 000 000 0000"
                onChange={(value) => dispatch({ type: 'setText', field: 'senderPhone', value })}
              />
            </div>
            <div className="field-group">
              <TextField
                label="Email отправителя (From в .eml)"
                placeholder="you@company.com"
                value={state.senderEmail}
                onChange={(value) => dispatch({ type: 'setText', field: 'senderEmail', value })}
              />
            </div>
            {state.senderPhones.map((phone, index) => (
              <div key={index} className="field-group field-group--field-action">
                <TextField
                  label={`Телефон ${index + 2}`}
                  placeholder="+ 7 000 000 0000"
                  value={phone}
                  onChange={(value) => {
                    const phones = [...state.senderPhones]
                    phones[index] = value
                    dispatch({ type: 'patch', patch: { senderPhones: phones } })
                  }}
                />
                <div className="ui-actions ui-actions--compact">
                  <ErrorLightIconButton
                    label="Удалить номер телефона"
                    onClick={() => {
                      const phones = state.senderPhones.filter((_, i) => i !== index)
                      dispatch({ type: 'patch', patch: { senderPhones: phones } })
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              className="ui-btn ui-btn--m ui-btn--link"
              type="button"
              style={{ width: 201, alignSelf: 'flex-start' }}
              onClick={() =>
                dispatch({
                  type: 'patch',
                  patch: { senderPhones: [...state.senderPhones, ''] },
                })
              }
            >
              + Добавить номер телефона
            </button>
          </>, 'signature', <label className="ui-checkbox ui-checkbox--bare" style={{margin:'0 6px 0 0'}} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={state.withSignature} onChange={e=>dispatch({type:'setBoolean',field:'withSignature',value:e.target.checked})}/></label>)}


          {/* Кнопка «Сбросить к дефолтам» временно скрыта
          <div className="button-row">
            <button
              className="ui-btn ui-btn--m ui-btn--secondary"
              type="button"
              onClick={() => dispatch({ type: 'reset', payload: createDefaultEmailFormData() })}
            >
              Сбросить к дефолтам
            </button>
          </div>
          */}
        </div>
      </div>

      <div className={`card email-pane email-pane-builder${emailViewMode === 'inputs' ? ' is-hidden' : ''}`} id="emailBuilderCard">
        <div className="ui-panel-header">
          <h2 className="ui-panel-header__title">Настройка через конструктор</h2>
          <div className="ui-panel-header__actions">
            <div className="email-view-toggle">
              <button
                className={'email-view-btn' + (emailViewMode === 'inputs' ? ' is-active' : '')}
                type="button"
                title="Режим полей"
                onClick={() => handleViewModeChange('inputs')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1" y="2" width="14" height="2" rx="1" fill="currentColor"/>
                  <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor"/>
                  <rect x="1" y="12" width="14" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <button
                className={'email-view-btn' + (emailViewMode === 'builder' ? ' is-active' : '')}
                type="button"
                title="Режим конструктора"
                onClick={() => handleViewModeChange('builder')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor"/>
                  <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor"/>
                  <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor"/>
                  <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="body">
          <div className="ui-accordion-list builder-accordion-list">
                {renderBuilderSection('structure', 'Структура', (
                  <div className="builder-layout-grid">
                    <button className="builder-layout-btn" type="button" onClick={() => dispatch({ type: 'addBuilderRow', layout: 1 })}>
                      <span className="builder-layout-btn-inner">
                        <span className="builder-layout-col"></span>
                      </span>
                    </button>
                    <button className="builder-layout-btn" type="button" onClick={() => dispatch({ type: 'addBuilderRow', layout: 2 })}>
                      <span className="builder-layout-btn-inner">
                        <span className="builder-layout-col"></span>
                        <span className="builder-layout-col"></span>
                      </span>
                    </button>
                    <button className="builder-layout-btn" type="button" onClick={() => dispatch({ type: 'addBuilderRow', layout: 3 })}>
                      <span className="builder-layout-btn-inner">
                        <span className="builder-layout-col"></span>
                        <span className="builder-layout-col"></span>
                        <span className="builder-layout-col"></span>
                      </span>
                    </button>
                  </div>
                ))}
                {renderBuilderSection('blocks', 'Блоки', (
                  <div className="builder-blocks-list">
                    {(['header', 'heading', 'greeting', 'text', 'image', 'button', 'divider', 'spacer'] as BuilderBlock['type'][]).map((type) => (
                      <button
                        key={type}
                        className="builder-block-btn"
                        type="button"
                        disabled={!hasEmptyBuilderColumn}
                        draggable={hasEmptyBuilderColumn}
                        onDragStart={(e) => {
                          if (!hasEmptyBuilderColumn) { e.preventDefault(); return }
                          e.dataTransfer.setData('text/plain', type)
                          e.dataTransfer.effectAllowed = 'copy'
                        }}
                        onClick={() => dispatch({ type: 'addBuilderBlock', blockType: type })}
                      >
                        <span className="icon">{getBuilderBlockIcon(type)}</span>
                        <span>{getBuilderBlockLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                ))}
          </div>
        </div>

      </div>

      <div className="email-preview-col">
        <div className="email-pane email-pane-preview card" id="emailResultCard">
          <div className="ui-panel-header">
            <div className="ui-panel-header__left">
              <div className="ui-panel-header__title">Превью письма</div>
              <div className="ui-badge ui-badge--muted">{htmlSize}</div>
            </div>
            <div className="ui-panel-header__actions">
              <button
                className={`email-icon-btn${copySuccess ? ' is-success' : ''}`}
                type="button"
                title={copySuccess ? 'Скопировано!' : 'Копировать HTML'}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedHtml)
                  } catch {
                    // fallback for non-secure contexts
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
                }}
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
              <div
                className="ui-menu-wrap"
                ref={downloadMenuRef}
              >
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
                        const name = slugifyFilename(state.subject, 'email') + '.html'
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
                      const fromEmail = state.senderEmail.trim()
                      const eml = [
                        'MIME-Version: 1.0',
                        'Content-Type: text/html; charset=UTF-8',
                        'Subject: Email',
                        ...(fromEmail ? [`From: ${fromEmail}`] : []),
                        '',
                        generatedHtml,
                      ].join('\r\n')
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(new Blob([eml], { type: 'message/rfc822' }))
                      {
                        const name = slugifyFilename(state.subject, 'email') + '.eml'
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
          {emailViewMode === 'builder' ? (
            <div className="builder-canvas-wrap">
              <div className="builder-canvas">
                {state.builderRows.map((row) => {
                  const isHeaderRow = row.columns.some(col => col.blocks.some(b => b.type === 'header'))
                  return (
                    <div
                      key={row.id}
                      className={`eb-row${isHeaderRow ? ' eb-row--header' : ''}`}
                      data-row-id={row.id}
                    >
                      {row.columns.map((col) => (
                        <div
                          key={col.id}
                          className={`eb-col${isHeaderRow ? ' eb-col--header' : ''}${col.id === state.builderActiveColumnId ? ' is-active' : ''}${dragOverColId === col.id ? ' is-dragover' : ''}`}
                          data-column-id={col.id}
                          onClick={() => dispatch({ type: 'setBuilderActiveColumn', columnId: col.id })}
                          onDragOver={(e) => { e.preventDefault(); setDragOverColId(col.id) }}
                          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverColId(null) }}
                          onDrop={(e) => {
                            e.preventDefault()
                            setDragOverColId(null)
                            const movePayload = e.dataTransfer.getData('builder-move-block')
                            if (movePayload) {
                              try {
                                const { blockId, fromColumnId } = JSON.parse(movePayload)
                                if (blockId && fromColumnId && fromColumnId !== col.id) {
                                  dispatch({ type: 'moveBuilderBlockToColumn', blockId, targetColumnId: col.id })
                                }
                              } catch {}
                              return
                            }
                            const blockType = e.dataTransfer.getData('text/plain') as BuilderBlock['type']
                            if (blockType) dispatch({ type: 'dropBlockIntoColumn', blockType, columnId: col.id })
                          }}
                        >
                          
                          {col.blocks.map((block) => {
                            const isHeader = block.type === 'header'
                            const blockHasContent = (() => {
                              if (block.type === 'greeting' || block.type === 'heading' || block.type === 'text') return !!block.text.trim()
                              if (block.type === 'button') return !!(block.text.trim() || block.url.trim())
                              if (block.type === 'image') return !!block.src
                              return false
                            })()
                            const closeIcon = <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                            const removeBtn = (
                              <button type="button" className="ui-btn ui-btn--s ui-btn--error-light ui-btn--icon eb-remove"
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); dispatch({ type: 'removeBuilderRow', rowId: row.id }) }}
                                title="Удалить строку">
                                {closeIcon}
                              </button>
                            )
                            const clearBtn = blockHasContent && !isHeader ? (
                              <button type="button" className="ui-btn ui-btn--s ui-btn--secondary ui-btn--icon eb-clear"
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); dispatch({ type: 'removeBuilderBlock', blockId: block.id }) }}
                                title="Очистить блок">
                                <img src="/icons/easer.svg" width="10" height="10" alt="" aria-hidden="true" style={{pointerEvents:'none'}} />
                              </button>
                            ) : null
                            return (
                              <div
                                key={block.id}
                                className={`eb-block${isHeader ? ' eb-block--header' : ''}${block.type === 'spacer' || block.type === 'divider' ? ' eb-block--empty' : ''}${state.builderSelectedBlockId === block.id ? ' is-selected' : ''}`}
                                draggable={!isHeader}
                                data-block-id={block.id}
                                data-column-id={col.id}
                                onDragStart={isHeader ? undefined : (e) => {
                                  e.dataTransfer.effectAllowed = 'move'
                                  e.dataTransfer.setData('builder-move-block', JSON.stringify({ blockId: block.id, fromColumnId: col.id }))
                                  e.dataTransfer.setData('text/plain', 'move')
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (editingBlockId === block.id) return
                                  dispatch({ type: 'setBuilderActiveColumn', columnId: col.id })
                                  dispatch({ type: 'setBuilderSelectedBlock', blockId: block.id })
                                }}
                              >
                                {isHeader ? (
                                  <>
                                    <div className="eb-col-actions eb-col-actions--header">
                                      <button type="button" className="ui-btn ui-btn--s ui-btn--secondary ui-btn--icon eb-clear"
                                        onPointerDown={e => e.stopPropagation()}
                                        onClick={e => { e.stopPropagation(); dispatch({ type: 'removeBuilderBlock', blockId: block.id }) }}
                                        title="Убрать шапку">
                                        <img src="/icons/easer.svg" width="10" height="10" alt="" aria-hidden="true" style={{pointerEvents:'none'}} />
                                      </button>
                                      {removeBtn}
                                    </div>
                                    <div className={`eb-header-block${state.builderHeaderImages[0]?.src ? ' has-image' : ' is-empty'}`}>
                                      <div className="eb-header-media">
                                        {state.builderHeaderImages[0]?.src
                                          ? <img src={state.builderHeaderImages[0].src} alt="Шапка" />
                                          : <span className="eb-header-empty-text">Шапка письма: выберите изображение с компьютера</span>}
                                        <div className="eb-header-overlay" aria-hidden="true" />
                                        <div className="eb-header-actions">
                                          {!state.builderHeaderImages[0]?.src && <span className="eb-header-actions-text">Шапка письма: выберите изображение с компьютера</span>}
                                          <div className="eb-header-actions-buttons">
                                            <button type="button" className="ui-btn ui-btn--m ui-btn--secondary"
                                              onClick={e => { e.stopPropagation(); builderHeaderInputRef.current?.click() }}>
                                              {state.builderHeaderImages[0]?.src ? 'Выбрать файл' : 'Добавить файл'}
                                            </button>
                                            <button type="button" className="ui-btn ui-btn--m ui-btn--error"
                                              disabled={!state.builderHeaderImages[0]?.src}
                                              onClick={e => { e.stopPropagation(); dispatch({ type: 'patch', patch: { builderHeaderImages: [] } }) }}>
                                              Удалить файл
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : block.type === 'heading' ? (
                                  <>
                                    <div className="eb-actions">{clearBtn}{removeBtn}</div>
                                    <div
                                      ref={editingBlockId === block.id ? (el) => { editingElemRef.current = el } : undefined}
                                      className={`eb-heading${editingBlockId === block.id ? ' is-editing' : ''}`}
                                      style={{ color: state.builderHeadingColor, fontSize: state.builderHeadingSize + 'px' }}
                                      contentEditable={editingBlockId === block.id}
                                      suppressContentEditableWarning
                                      onDoubleClick={(e) => { e.stopPropagation(); setEditingBlockId(block.id) }}
                                      onBlur={(e) => { dispatch({ type: 'setBuilderBlockText', blockId: block.id, value: e.currentTarget.textContent || '' }); setEditingBlockId(null) }}
                                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
                                    >
                                      {block.text || (editingBlockId !== block.id && <span style={{color:'#b0bec9'}}>Текст заголовка</span>)}
                                    </div>
                                  </>
                                ) : block.type === 'greeting' || block.type === 'text' ? (
                                  <>
                                    <div className="eb-actions">{clearBtn}{removeBtn}</div>
                                    <div
                                      ref={editingBlockId === block.id ? (el) => { editingElemRef.current = el } : undefined}
                                      className={`eb-text${editingBlockId === block.id ? ' is-editing' : ''}`}
                                      style={block.type === 'greeting' ? { color: state.builderGreetingColor, fontSize: state.builderGreetingSize + 'px' } : {}}
                                      contentEditable={editingBlockId === block.id}
                                      suppressContentEditableWarning
                                      onDoubleClick={(e) => { e.stopPropagation(); setEditingBlockId(block.id) }}
                                      onBlur={(e) => { dispatch({ type: 'setBuilderBlockText', blockId: block.id, value: e.currentTarget.textContent || '' }); setEditingBlockId(null) }}
                                    >
                                      {block.text || (editingBlockId !== block.id && <span style={{color:'#b0bec9'}}>{block.type === 'greeting' ? 'Приветствие' : 'Основной текст'}</span>)}
                                    </div>
                                  </>
                                ) : block.type === 'button' ? (
                                  <>
                                    <div className="eb-actions">{clearBtn}{removeBtn}</div>
                                    {editingBlockId === block.id ? (
                                      <div className="eb-button-edit is-editing-url" onClick={e => e.stopPropagation()}>
                                        <div
                                          ref={(el) => { editingElemRef.current = el }}
                                          className="eb-button"
                                          contentEditable
                                          suppressContentEditableWarning
                                          onBlur={(e) => { dispatch({ type: 'setBuilderBlockText', blockId: block.id, value: e.currentTarget.textContent || '' }) }}
                                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
                                        >{block.text}</div>
                                        <div className="eb-button-url-edit">
                                          <div className="ui-url-input">
                                            <input
                                              className="ui-input"
                                              type="url"
                                              placeholder="https://..."
                                              value={editingButtonUrl}
                                              onChange={(e) => setEditingButtonUrl(e.target.value)}
                                              onKeyDown={(e) => { if (e.key === 'Enter') { dispatch({ type: 'setBuilderBlockUrl', blockId: block.id, value: editingButtonUrl }); setEditingBlockId(null) } }}
                                            />
                                            <button
                                              type="button"
                                              className="ui-btn ui-btn--icon"
                                              onPointerDown={e => e.preventDefault()}
                                              onClick={() => { dispatch({ type: 'setBuilderBlockUrl', blockId: block.id, value: editingButtonUrl }); setEditingBlockId(null) }}
                                            >
                                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{display:'flex',justifyContent:'flex-start',padding:'4px 0'}}>
                                        <div
                                          className="eb-button"
                                          onDoubleClick={(e) => { e.stopPropagation(); setEditingButtonUrl(block.url || ''); setEditingBlockId(block.id) }}
                                        >{block.text || 'Кнопка'}</div>
                                      </div>
                                    )}
                                  </>
                                ) : block.type === 'image' ? (
                                  <>
                                    <div className="eb-actions">{clearBtn}{removeBtn}</div>
                                    <div className={`eb-image${block.src ? ' has-image' : ' is-empty'}`}
                                      onClick={e => { e.stopPropagation(); setCanvasImageBlockId(block.id); builderImageInputRef.current?.click() }}>
                                      {block.src
                                        ? <img src={block.src} alt={block.name || ''} />
                                        : <span style={{color:'#9aa2ab',fontSize:13}}>Картинка</span>}
                                    </div>
                                  </>
                                ) : block.type === 'divider' ? (
                                  <>
                                    <div className="eb-actions">{removeBtn}</div>
                                    <div className="eb-divider" />
                                  </>
                                ) : block.type === 'spacer' ? (
                                  <>
                                    <div className="eb-actions">{removeBtn}</div>
                                    <div className="eb-spacer" style={{height: block.size + 'px'}} />
                                  </>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )
                })}
                {state.builderRows.length === 0 && (
                  <div className="eb-canvas-empty">
                    <p>Добавьте строку через раздел «Структура»</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="body outgrid">
              <div className="preview-shell">
                <PreviewFrame className="email-preview-frame" srcDoc={generatedHtml} title="Email preview" />
              </div>
            </div>
          )}
        </div>
        <HtmlOutputAccordion html={generatedHtml} id="emailOutputSection" title="HTML письма" />
      </div>
      <input
        ref={builderHeaderInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const files = e.target.files
          if (files?.length) await handleBuilderHeaderUpload(files)
          e.target.value = ''
        }}
      />
      <input
        ref={builderImageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const files = e.target.files
          if (files?.length && canvasImageBlockId) await handleBuilderImageUpload(files, canvasImageBlockId)
          setCanvasImageBlockId(null)
          e.target.value = ''
        }}
      />
    </>
  )
}
