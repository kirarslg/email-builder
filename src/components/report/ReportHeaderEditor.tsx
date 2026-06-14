import { useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { CheckboxField } from '../form/CheckboxField'
import { ColorField } from '../form/ColorField'
import { ImageUploadField } from '../form/ImageUploadField'
import { TextField } from '../form/TextField'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportHeaderEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
  onLogoUpload: (files: FileList) => Promise<void>
  onHeroBgUpload: (files: FileList) => Promise<void>
}

export function ReportHeaderEditor({
  state,
  dispatch,
  onLogoUpload,
  onHeroBgUpload,
}: ReportHeaderEditorProps) {
  const [cellsOpen, setCellsOpen] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const dragHandleRef = useRef(false)

  function handleDragStart(e: React.DragEvent, index: number) {
    if (!dragHandleRef.current) {
      e.preventDefault()
      return
    }
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIndex !== index) setOverIndex(index)
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== index) {
      dispatch({ type: 'reorderHeaderCells', from: dragIndex, to: index })
    }
    setDragIndex(null)
    setOverIndex(null)
    dragHandleRef.current = false
  }

  function handleDragEnd() {
    setDragIndex(null)
    setOverIndex(null)
    dragHandleRef.current = false
  }

  return (
    <>
      <div className="field-group">
        <ImageUploadField
          label="Логотип (PNG, JPEG)"
          items={state.ui.logoImage ? [{ src: state.ui.logoImage, name: state.ui.logoImageName || 'Логотип' }] : []}
          onUpload={onLogoUpload}
          onRemove={() => { dispatch({ type: 'setUiField', field: 'logoImage', value: '' }); dispatch({ type: 'setUiField', field: 'logoImageName', value: '' }) }}
        />
        <ImageUploadField
          label="Шапка (PNG, JPEG)"
          items={state.ui.heroBgImage ? [{ src: state.ui.heroBgImage, name: state.ui.heroBgImageName || 'Шапка' }] : []}
          onUpload={onHeroBgUpload}
          onRemove={() => { dispatch({ type: 'setUiField', field: 'heroBgImage', value: '' }); dispatch({ type: 'setUiField', field: 'heroBgImageName', value: '' }) }}
        />
      </div>

      <div className="field-group">
        <TextField
          label="Заголовок"
          value={state.title}
          onChange={(value) => dispatch({ type: 'setTitle', value })}
        />
        <div className="ui-field-with-toggle">
          <TextField
            label="Статус"
            value={state.headerStatus}
            onChange={(value) => dispatch({ type: 'setHeaderStatus', value })}
          />
          <CheckboxField
            label="Показывать статус"
            checked={state.headerStatusVisible}
            onChange={(checked) => dispatch({ type: 'patch', patch: { headerStatusVisible: checked } })}
          />
        </div>
      </div>

      <div className="ui-group-head"><span className="ui-group-head__title">Цвета</span></div>

      <div className="field-group field-group--3">
        <ColorField
          label="Цвет заголовка"
          value={state.ui.heroTitleColor}
          fallback="#000000"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'heroTitleColor', value })}
        />
        <ColorField
          label="Цвет шапки"
          value={state.ui.heroBg}
          fallback="#ecf2f3"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'heroBg', value })}
        />
        <ColorField
          label="Цвет бордера шапки"
          value={state.ui.heroBorder}
          fallback="transparent"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'heroBorder', value })}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          className="ui-group-head"
          style={{ cursor: 'pointer' }}
          onClick={() => setCellsOpen((o) => !o)}
        >
          <span className="ui-group-head__title">Таблица</span>
          <span className="ui-group-head__right">
            <label
              className="ui-checkbox"
              style={{ margin: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={state.headerCellsVisible}
                onChange={(e) => dispatch({ type: 'patch', patch: { headerCellsVisible: e.target.checked } })}
              />
            </label>
            <svg
              aria-hidden="true"
              className="ui-group-head__chevron"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ transform: cellsOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
            >
              <path d="M6 3.3335L10.6667 8.00016L6 12.6668" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>

        {cellsOpen && (
          <>
          <div style={{ background: '#f3f5f7', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="field-group">
              {state.headerCells.map((cell, index) => (
                <div
                  className="ui-editable-list-item"
                  key={cell.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    opacity: dragIndex === index ? 0.35 : 1,
                    transform: dragIndex === index ? 'scale(0.97)' : 'scale(1)',
                    boxShadow: overIndex === index && dragIndex !== null && dragIndex !== index
                      ? '0 -3px 0 0 #3dc47a'
                      : undefined,
                    transition: 'opacity 0.15s ease, transform 0.15s ease, box-shadow 0.12s ease',
                    cursor: dragIndex === index ? 'grabbing' : undefined,
                    userSelect: 'none',
                  }}
                >
                  <div className="ui-editable-list-item__header">
                    <span className="ui-editable-list-item__title">{index + 1} столбец</span>
                    <div className="ui-editable-list-item__actions" style={{ gap: 0 }}>
                      <button
                        aria-label="Перетащить"
                        className="ui-editable-list-item__drag-handle"
                        type="button"
                        onMouseDown={() => { dragHandleRef.current = true }}
                        onMouseUp={() => { dragHandleRef.current = false }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <circle cx="4.5" cy="3.5" r="1.5" fill="currentColor"/>
                          <circle cx="9.5" cy="3.5" r="1.5" fill="currentColor"/>
                          <circle cx="4.5" cy="7" r="1.5" fill="currentColor"/>
                          <circle cx="9.5" cy="7" r="1.5" fill="currentColor"/>
                          <circle cx="4.5" cy="10.5" r="1.5" fill="currentColor"/>
                          <circle cx="9.5" cy="10.5" r="1.5" fill="currentColor"/>
                        </svg>
                      </button>
                      <button
                        aria-label="Удалить столбец"
                        className="ui-btn ui-btn--xxs ui-btn--muted ui-btn--icon"
                        disabled={state.headerCells.length <= 1}
                        title="Удалить столбец"
                        type="button"
                        onClick={() => dispatch({ type: 'removeHeaderCell', index })}
                      >
                        <img alt="" aria-hidden="true" src="/Icons/close.svg" />
                      </button>
                    </div>
                  </div>
                  <div className="ui-editable-list-item__body">
                    <TextField
                      label="Заголовок"
                      value={cell.label}
                      onChange={(value) => dispatch({ type: 'setHeaderCellField', index, field: 'label', value })}
                    />
                    <TextField
                      label="Контент"
                      value={cell.value}
                      onChange={(value) => dispatch({ type: 'setHeaderCellField', index, field: 'value', value })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="button-row">
              <button
                className="ui-btn ui-btn--m ui-btn--link"
                type="button"
                onClick={() => dispatch({ type: 'addHeaderCell' })}
              >
                + Добавить столбец
              </button>
            </div>
          </div>
          <div className="field-group">
            <ColorField
              label="Цвет заголовка ячейки"
              value={state.ui.heroCellLabelColor}
              fallback="#7a7f87"
              onChange={(value) => dispatch({ type: 'setUiField', field: 'heroCellLabelColor', value })}
            />
            <ColorField
              label="Цвет контента ячейки"
              value={state.ui.heroCellValueColor}
              fallback="#111111"
              onChange={(value) => dispatch({ type: 'setUiField', field: 'heroCellValueColor', value })}
            />
          </div>
          </>
        )}
      </div>
    </>
  )
}
