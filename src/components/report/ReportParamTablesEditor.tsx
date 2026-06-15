import { useState } from 'react'
import type { Dispatch } from 'react'
import { ColorField } from '../form/ColorField'
import { TextField } from '../form/TextField'
import { ButtonCard } from './ReportButtonCard'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportParamTablesEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

interface GroupHeadProps {
  title: string
  open: boolean
  onToggle: () => void
}

function GroupHead({ title, open, onToggle }: GroupHeadProps) {
  return (
    <div
      className="ui-group-head"
      style={{ cursor: 'pointer' }}
      onClick={onToggle}
    >
      <span className="ui-group-head__title">{title}</span>
      <span className="ui-group-head__right">
        <svg
          aria-hidden="true"
          className="ui-group-head__chevron"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform .2s',
          }}
        >
          <path
            d="M6 3.3335L10.6667 8.00016L6 12.6668"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
      <path
        d="M7.92 1.18a.7.7 0 0 1 .99.99L5.99 5l2.92 2.93a.7.7 0 1 1-.99.99L5 5.99 2.07 8.92a.7.7 0 0 1-.99-.99L4 5 1.08 2.07a.7.7 0 1 1 .99-.99L5 4l2.92-2.93z"
        fill="currentColor"
      />
    </svg>
  )
}

interface EditableRowProps {
  label: string
  value: string
  disabledDelete?: boolean
  hideActions?: boolean
  onChange: (value: string) => void
  onDelete: () => void
}

function EditableRow({ label, value, disabledDelete, hideActions, onChange, onDelete }: EditableRowProps) {
  if (hideActions) {
    // Full-width input, no drag/delete — matches Figma content rows.
    return (
      <div className="ui-field">
        <label className="ui-label">{label}</label>
        <input
          className="ui-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <div className="ui-editable-input-list__row report-alert-badge-item__row">
        <div className="ui-field report-alert-badge-item__field">
          <input
            className="ui-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="ui-editable-list-item__drag-handle"
          title="Перетащить"
          aria-label="Перетащить"
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

export function ReportParamTablesEditor({ state, dispatch }: ReportParamTablesEditorProps) {
  const [titleOpen, setTitleOpen] = useState(true)
  const [contentOpen, setContentOpen] = useState(true)
  const [colorsOpen, setColorsOpen] = useState(true)

  // For simplicity (and per Figma macet) — edit the FIRST param table.
  // Multiple-tables case keeps working via state, just not exposed here.
  const tableIndex = 0
  const table = state.params[tableIndex]
  if (!table) return null

  return (
    <div className="report-table-editor" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ─── Заголовок раздела ──────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead
          title="Заголовок раздела"
          open={titleOpen}
          onToggle={() => setTitleOpen((v) => !v)}
        />
        {titleOpen && (
          <TextField
            label="Заголовок"
            value={table.title}
            onChange={(value) =>
              dispatch({ type: 'setParamTableTitle', index: tableIndex, value })
            }
          />
        )}
      </div>


      {/* ─── Контент таблицы (строки) ───────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead
          title="Контент таблицы"
          open={contentOpen}
          onToggle={() => setContentOpen((v) => !v)}
        />
        {contentOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {table.rows.map((row, rowIndex) => (
              <div key={row.id} className="ui-editable-input-list">
                <div className="ui-editable-input-list__items">
                  <EditableRow
                    label="Заголовок"
                    value={row.cells[0] || ''}
                    hideActions
                    onChange={(value) =>
                      dispatch({ type: 'setParamCell', tableIndex, rowIndex, cellIndex: 0, value })
                    }
                    onDelete={() => {}}
                  />
                  <EditableRow
                    label="Значение"
                    value={row.cells[1] || ''}
                    hideActions
                    onChange={(value) =>
                      dispatch({ type: 'setParamCell', tableIndex, rowIndex, cellIndex: 1, value })
                    }
                    onDelete={() => {}}
                  />
                </div>
                <div className="ui-editable-input-list__add">
                  <button
                    className="ui-btn ui-btn--xs ui-btn--error-light"
                    type="button"
                    disabled={table.rows.length <= 1}
                    onClick={() =>
                      dispatch({ type: 'removeParamRow', tableIndex, rowIndex })
                    }
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
                onField={(field, value) => dispatch({ type: 'setParamButtonField', tableIndex, buttonIndex, field, value })}
                onDelete={() => dispatch({ type: 'removeParamButton', tableIndex, buttonIndex })}
              />
            ))}
            <div className="button-row" style={{ gap: 8 }}>
              <button
                className="ui-btn ui-btn--s ui-btn--secondary"
                type="button"
                onClick={() => dispatch({ type: 'addParamRow', tableIndex })}
              >
                + Добавить строку
              </button>
              <button
                className="ui-btn ui-btn--s ui-btn--secondary"
                type="button"
                onClick={() => dispatch({ type: 'addParamButton', tableIndex })}
              >
                + Добавить кнопку
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Цвета ──────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead
          title="Цвета"
          open={colorsOpen}
          onToggle={() => setColorsOpen((v) => !v)}
        />
        {colorsOpen && (
          <>
            <div className="field-group field-group--3">
              <ColorField
                label="Цвет фона блока"
                value={state.ui.tableBlockBg}
                fallback="#FFFFFF"
                onChange={(value) =>
                  dispatch({ type: 'setUiField', field: 'tableBlockBg', value })
                }
              />
              <ColorField
                label="Цвет бордера блока"
                value={state.ui.tableBlockBorder}
                fallback="#DDE8F3"
                onChange={(value) =>
                  dispatch({
                    type: 'setUiField',
                    field: 'tableBlockBorder',
                    value,
                  })
                }
              />
              <ColorField
                label="Цвет бордеров таблицы"
                value={state.ui.vtBorder}
                fallback="#DDE8F3"
                onChange={(value) =>
                  dispatch({ type: 'setUiField', field: 'vtBorder', value })
                }
              />
            </div>
            <div className="field-group field-group--3">
              <ColorField
                label="Цвет заголовков в шапке"
                value={state.ui.vtHeadText}
                fallback="#797F88"
                onChange={(value) =>
                  dispatch({
                    type: 'setUiField',
                    field: 'vtHeadText',
                    value,
                  })
                }
              />
              <ColorField
                label="Цвет текста"
                value={state.ui.tableBodyText}
                fallback="#111111"
                onChange={(value) =>
                  dispatch({
                    type: 'setUiField',
                    field: 'tableBodyText',
                    value,
                  })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
