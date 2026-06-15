import { useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { ColorField } from '../form/ColorField'
import { NumberField } from '../form/NumberField'
import { SelectField } from '../form/SelectField'
import { TextField } from '../form/TextField'
import { ButtonCard } from './ReportButtonCard'
import type { ReportAction } from '../../domain/report/reducer'
import type { RepoBadgeColor, ReportState } from '../../domain/report/types'

interface ReportRepoTablesEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

const BADGE_COLORS: RepoBadgeColor[] = ['green', 'red', 'blue', 'yellow']

interface GroupHeadProps {
  title: string
  open: boolean
  onToggle: () => void
  checked?: boolean
  onCheck?: (checked: boolean) => void
}

function GroupHead({ title, open, onToggle, checked, onCheck }: GroupHeadProps) {
  return (
    <div className="ui-group-head" style={{ cursor: 'pointer' }} onClick={onToggle}>
      <span className="ui-group-head__title">{title}</span>
      <span className="ui-group-head__right">
        {onCheck && (
          <label className="ui-checkbox" style={{ margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={checked ?? false} onChange={(e) => onCheck(e.target.checked)} />
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
  )
}

function DragHandleIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <circle cx="3" cy="2" r="1" fill="currentColor"/>
      <circle cx="7" cy="2" r="1" fill="currentColor"/>
      <circle cx="3" cy="5" r="1" fill="currentColor"/>
      <circle cx="7" cy="5" r="1" fill="currentColor"/>
      <circle cx="3" cy="8" r="1" fill="currentColor"/>
      <circle cx="7" cy="8" r="1" fill="currentColor"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M7.92 1.18a.7.7 0 0 1 .99.99L5.99 5l2.92 2.93a.7.7 0 1 1-.99.99L5 5.99 2.07 8.92a.7.7 0 0 1-.99-.99L4 5 1.08 2.07a.7.7 0 1 1 .99-.99L5 4l2.92-2.93z" fill="currentColor"/>
    </svg>
  )
}

interface ColumnRowProps {
  label: string
  value: string
  index: number
  disabledDelete?: boolean
  isDragging?: boolean
  isOver?: boolean
  onChange: (value: string) => void
  onDelete: () => void
  onDragStart: () => void
  onDragEnter: () => void
  onDrop: () => void
  onDragEnd: () => void
  beginDrag: () => void
  endDrag: () => void
  canStartDrag: () => boolean
}

function ColumnRow({
  label, value, disabledDelete, isDragging, isOver,
  onChange, onDelete, onDragStart, onDragEnter, onDrop, onDragEnd, beginDrag, endDrag, canStartDrag,
}: ColumnRowProps) {
  return (
    <div
      className="ui-field"
      draggable
      onDragStart={(e) => { if (!canStartDrag()) { e.preventDefault(); return } onDragStart(); e.dataTransfer.effectAllowed = 'move' }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop() }}
      onDragEnd={onDragEnd}
      style={{
        marginTop: 0,
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isOver ? '0 -2px 0 0 #3dc47a' : undefined,
        transition: 'opacity .15s ease, box-shadow .12s ease',
      }}
    >
      <label className="ui-label">{label}</label>
      <div className="ui-editable-input-list__row report-alert-badge-item__row">
        <div className="ui-field report-alert-badge-item__field">
          <input className="ui-input" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
        <button
          type="button"
          className="ui-editable-list-item__drag-handle"
          title="Перетащить"
          aria-label="Перетащить"
          onMouseDown={beginDrag}
          onMouseUp={endDrag}
        >
          <DragHandleIcon />
        </button>
        <button
          type="button"
          className="ui-btn ui-btn--xxs ui-btn--icon ui-btn--error-light"
          title="Удалить"
          aria-label="Удалить"
          disabled={disabledDelete}
          onClick={onDelete}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}



export function ReportRepoTablesEditor({ state, dispatch }: ReportRepoTablesEditorProps) {
  const [titleOpen, setTitleOpen] = useState(true)
  const [colsOpen, setColsOpen] = useState(true)
  const [contentOpen, setContentOpen] = useState(true)
  const [colorsOpen, setColorsOpen] = useState(true)

  const tableIndex = 0
  const table = state.repos[tableIndex]
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const dragArmed = useRef(false)
  if (!table) return null

  return (
    <div className="report-table-editor" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ─── Заголовок раздела ──────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GroupHead title="Заголовок раздела" open={titleOpen} onToggle={() => setTitleOpen((v) => !v)} />
        {titleOpen && (
          <TextField
            label="Заголовок"
            value={table.title}
            onChange={(value) => dispatch({ type: 'setRepoTableTitle', index: tableIndex, value })}
          />
        )}
      </div>

      {/* ─── Шапка таблицы (колонки) ────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead title="Шапка таблицы" open={colsOpen} onToggle={() => setColsOpen((v) => !v)} />
        {colsOpen && (
          <div className="ui-editable-input-list">
            <div className="ui-editable-input-list__items" style={{ gap: 16 }}>
              {table.columns.map((column, columnIndex) => (
                <ColumnRow
                  key={column.id}
                  index={columnIndex}
                  label={`Заголовок столбца ${columnIndex + 1}`}
                  value={column.title}
                  disabledDelete={table.columns.length <= 1}
                  isDragging={dragIndex === columnIndex}
                  isOver={overIndex === columnIndex && dragIndex !== null && dragIndex !== columnIndex}
                  onChange={(value) => dispatch({ type: 'setRepoColumnTitle', tableIndex, columnIndex, value })}
                  onDelete={() => dispatch({ type: 'removeRepoColumn', tableIndex, columnIndex })}
                  canStartDrag={() => dragArmed.current}
                  beginDrag={() => { dragArmed.current = true }}
                  endDrag={() => { dragArmed.current = false }}
                  onDragStart={() => { if (dragArmed.current) setDragIndex(columnIndex) }}
                  onDragEnter={() => { if (dragIndex !== null) setOverIndex(columnIndex) }}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== columnIndex) {
                      dispatch({ type: 'reorderRepoColumns', tableIndex, from: dragIndex, to: columnIndex })
                    }
                    setDragIndex(null); setOverIndex(null); dragArmed.current = false
                  }}
                  onDragEnd={() => { setDragIndex(null); setOverIndex(null); dragArmed.current = false }}
                />
              ))}
            </div>
            <div className="ui-editable-input-list__add">
              <button
                className="ui-btn ui-btn--m ui-btn--link"
                type="button"
                onClick={() => dispatch({ type: 'addRepoColumn', tableIndex })}
              >
                + Добавить столбец
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Контент таблицы (строки) ───────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead title="Контент таблицы" open={contentOpen} onToggle={() => setContentOpen((v) => !v)} />
        {contentOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {table.rows.map((row, rowIndex) => (
              <div key={row.id} className="ui-editable-input-list">
                <div className="ui-editable-input-list__items" style={{ gap: 16 }}>
                  {table.columns.map((column, cellIndex) => {
                    const cell = row.cells[cellIndex]
                    return (
                      <div className="ui-field" key={`${row.id}-${column.id}`} style={{ marginTop: 0 }}>
                        <label className="ui-label">{column.title || `Столбец ${cellIndex + 1}`}</label>
                        <input
                          className="ui-input"
                          value={cell?.value || ''}
                          onChange={(e) =>
                            dispatch({ type: 'setRepoCell', tableIndex, rowIndex, cellIndex, value: e.target.value })
                          }
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <label className="ui-checkbox" style={{ margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={!!cell?.isBadge}
                              onChange={(e) =>
                                dispatch({ type: 'setRepoCellBadge', tableIndex, rowIndex, cellIndex, checked: e.target.checked })
                              }
                            />
                            <span>Бейдж</span>
                          </label>
                          {cell?.isBadge && (
                            <div className="repo-editor-colors" role="radiogroup" aria-label="Цвет бейджа">
                              {BADGE_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  role="radio"
                                  aria-checked={cell.badgeColor === color}
                                  aria-label={color}
                                  data-color={color}
                                  className={'repo-editor-color' + (cell.badgeColor === color ? ' is-active' : '')}
                                  onClick={() =>
                                    dispatch({ type: 'setRepoBadgeColor', tableIndex, rowIndex, cellIndex, value: color })
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="ui-editable-input-list__add">
                  <button
                    className="ui-btn ui-btn--xs ui-btn--error-light"
                    type="button"
                    disabled={table.rows.length <= 1}
                    onClick={() => dispatch({ type: 'removeRepoRow', tableIndex, rowIndex })}
                  >
                    Удалить строку
                  </button>
                </div>
              </div>
            ))}
            {table.buttons.map((button, buttonIndex) => (
              <ButtonCard
                key={button.id}
                index={buttonIndex}
                button={button}
                onField={(field, value) => dispatch({ type: 'setRepoButtonField', tableIndex, buttonIndex, field, value })}
                onDelete={() => dispatch({ type: 'removeRepoButton', tableIndex, buttonIndex })}
              />
            ))}
            <div className="button-row" style={{ gap: 8 }}>
              <button
                className="ui-btn ui-btn--s ui-btn--secondary"
                type="button"
                onClick={() => dispatch({ type: 'addRepoRow', tableIndex })}
              >
                + Добавить строку
              </button>
              <button
                className="ui-btn ui-btn--s ui-btn--secondary"
                type="button"
                onClick={() => dispatch({ type: 'addRepoButton', tableIndex })}
              >
                + Добавить кнопку
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Цвета ──────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GroupHead title="Цвета" open={colorsOpen} onToggle={() => setColorsOpen((v) => !v)} />
        {colorsOpen && (
          <>
            <div className="field-group field-group--3">
              <ColorField
                label="Цвет фона блока"
                value={state.ui.repoBlockBg}
                fallback="#FFFFFF"
                onChange={(value) => dispatch({ type: 'setUiField', field: 'repoBlockBg', value })}
              />
              <ColorField
                label="Цвет бордера блока"
                value={state.ui.repoBlockBorder}
                fallback="#E7E7E7"
                onChange={(value) => dispatch({ type: 'setUiField', field: 'repoBlockBorder', value })}
              />
              <ColorField
                label="Цвет бордеров таблицы"
                value={state.ui.repoBorder}
                fallback="#DDE8F3"
                onChange={(value) => dispatch({ type: 'setUiField', field: 'repoBorder', value })}
              />
            </div>
            <div className="field-group field-group--3">
              <ColorField
                label="Цвет шапки таблицы"
                value={state.ui.repoHeadBg}
                fallback="#F6F8FB"
                onChange={(value) => dispatch({ type: 'setUiField', field: 'repoHeadBg', value })}
              />
              <ColorField
                label="Цвет заголовков в шапке"
                value={state.ui.repoHeadText}
                fallback="#797F88"
                onChange={(value) => dispatch({ type: 'setUiField', field: 'repoHeadText', value })}
              />
              <ColorField
                label="Цвет текста"
                value={state.ui.repoText}
                fallback="#111111"
                onChange={(value) => dispatch({ type: 'setUiField', field: 'repoText', value })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
