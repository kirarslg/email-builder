import { useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { ColorField } from '../form/ColorField'
import { TextField } from '../form/TextField'
import type { ReportAction } from '../../domain/report/reducer'
import type { RepoBadgeColor, ReportState } from '../../domain/report/types'

const BADGE_COLORS: RepoBadgeColor[] = ['green', 'red', 'blue', 'yellow']

interface ReportAlertEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

interface GroupHeadProps {
  title: string
  open: boolean
  onToggle: () => void
  checked?: boolean
  onCheck?: (checked: boolean) => void
}

function GroupHead({ title, open, onToggle, checked, onCheck }: GroupHeadProps) {
  return (
    <div
      className="ui-group-head"
      style={{ cursor: 'pointer' }}
      onClick={onToggle}
    >
      <span className="ui-group-head__title">{title}</span>
      <span className="ui-group-head__right">
        {onCheck && (
          <label
            className="ui-checkbox"
            style={{ margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={checked ?? false}
              onChange={(e) => onCheck(e.target.checked)}
            />
          </label>
        )}
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

export function ReportAlertEditor({ state, dispatch }: ReportAlertEditorProps) {
  const [contentOpen, setContentOpen] = useState(true)
  const [badgesOpen, setBadgesOpen] = useState(true)
  const [colorsOpen, setColorsOpen] = useState(true)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const dragArmed = useRef(false)

  return (
    <>
      {/* ─── Контент ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead
          title="Контент"
          open={contentOpen}
          onToggle={() => setContentOpen((v) => !v)}
        />
        {contentOpen && (
          <div className="field-group">
            <TextField
              label="Заголовок"
              value={state.alert.title}
              onChange={(value) =>
                dispatch({
                  type: 'patch',
                  patch: { alert: { ...state.alert, title: value } },
                })
              }
            />
            <TextField
              label="Описание"
              value={state.alert.text}
              onChange={(value) =>
                dispatch({
                  type: 'patch',
                  patch: { alert: { ...state.alert, text: value } },
                })
              }
            />
          </div>
        )}
      </div>

      {/* ─── Бейджи ──────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead
          title="Бейджи"
          open={badgesOpen}
          onToggle={() => setBadgesOpen((v) => !v)}
          checked={state.alertBadgesVisible}
          onCheck={(value) =>
            dispatch({ type: 'patch', patch: { alertBadgesVisible: value } })
          }
        />
        {badgesOpen && (
          <div className="ui-editable-input-list report-alert-badges-list">
            <div className="ui-editable-input-list__items">
              {state.alert.badges.map((badge, index) => (
                <div
                  className="ui-editable-input-list__item report-alert-badge-item"
                  key={badge.id}
                  draggable
                  onDragStart={(e) => { if (!dragArmed.current) { e.preventDefault(); return } setDragIndex(index); e.dataTransfer.effectAllowed = 'move' }}
                  onDragEnter={() => { if (dragIndex !== null) setOverIndex(index) }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragIndex !== null && dragIndex !== index) {
                      dispatch({ type: 'reorderAlertBadges', from: dragIndex, to: index })
                    }
                    setDragIndex(null); setOverIndex(null); dragArmed.current = false
                  }}
                  onDragEnd={() => { setDragIndex(null); setOverIndex(null); dragArmed.current = false }}
                  style={{
                    opacity: dragIndex === index ? 0.4 : 1,
                    boxShadow: overIndex === index && dragIndex !== null && dragIndex !== index ? '0 -2px 0 0 #3dc47a' : undefined,
                    transition: 'opacity .15s ease, box-shadow .12s ease',
                  }}
                >
                  <div className="ui-field__head">
                    <div className="ui-label report-alert-badge-item__label">{`Бейдж ${index + 1}`}</div>
                    <div className="repo-editor-colors" role="radiogroup" aria-label={`Цвет бейджа ${index + 1}`}>
                      {BADGE_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          role="radio"
                          aria-checked={badge.color === color}
                          aria-label={color}
                          data-color={color}
                          className={'repo-editor-color' + (badge.color === color ? ' is-active' : '')}
                          onClick={() => dispatch({ type: 'setAlertBadgeColor', index, value: color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="ui-editable-input-list__row report-alert-badge-item__row">
                    <div className="ui-field report-alert-badge-item__field">
                      <input
                        className="ui-input"
                        value={badge.text}
                        onChange={(e) => dispatch({ type: 'setAlertBadgeText', index, value: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      className="ui-editable-list-item__drag-handle"
                      title="Перетащить бейдж"
                      aria-label="Перетащить бейдж"
                      onMouseDown={() => { dragArmed.current = true }}
                      onMouseUp={() => { dragArmed.current = false }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="3" cy="2" r="1" fill="currentColor"/>
                        <circle cx="7" cy="2" r="1" fill="currentColor"/>
                        <circle cx="3" cy="5" r="1" fill="currentColor"/>
                        <circle cx="7" cy="5" r="1" fill="currentColor"/>
                        <circle cx="3" cy="8" r="1" fill="currentColor"/>
                        <circle cx="7" cy="8" r="1" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="ui-btn ui-btn--xxs ui-btn--icon ui-btn--error-light"
                      title="Удалить бейдж"
                      aria-label="Удалить бейдж"
                      disabled={state.alert.badges.length <= 1}
                      onClick={() => dispatch({ type: 'removeAlertBadge', index })}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path
                          d="M7.92 1.18a.7.7 0 0 1 .99.99L5.99 5l2.92 2.93a.7.7 0 1 1-.99.99L5 5.99 2.07 8.92a.7.7 0 0 1-.99-.99L4 5 1.08 2.07a.7.7 0 1 1 .99-.99L5 4l2.92-2.93z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="ui-editable-input-list__add">
              <button
                className="ui-btn ui-btn--m ui-btn--link"
                type="button"
                onClick={() => dispatch({ type: 'addAlertBadge' })}
              >
                + Добавить бейдж
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Цвета ───────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <GroupHead
          title="Цвета"
          open={colorsOpen}
          onToggle={() => setColorsOpen((v) => !v)}
        />
        {colorsOpen && (
          <>
            <div className="field-group">
              <ColorField
                label="Цвет фона блока"
                value={state.ui.alertBg}
                fallback="#FFF4F1"
                onChange={(value) =>
                  dispatch({ type: 'setUiField', field: 'alertBg', value })
                }
              />
              <ColorField
                label="Цвет акцентной полосы"
                value={state.ui.alertBorder}
                fallback="#C45648"
                onChange={(value) =>
                  dispatch({ type: 'setUiField', field: 'alertBorder', value })
                }
              />
            </div>
            <div className="field-group">
              <ColorField
                label="Цвет заголовка"
                value={state.ui.alertTitle}
                fallback="#C45648"
                onChange={(value) =>
                  dispatch({ type: 'setUiField', field: 'alertTitle', value })
                }
              />
              <ColorField
                label="Цвет текста"
                value={state.ui.alertText}
                fallback="#4B5563"
                onChange={(value) =>
                  dispatch({ type: 'setUiField', field: 'alertText', value })
                }
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}
