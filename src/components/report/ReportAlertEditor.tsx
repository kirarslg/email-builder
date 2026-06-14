import type { Dispatch } from 'react'
import { CheckboxField } from '../form/CheckboxField'
import { ColorField } from '../form/ColorField'
import { ErrorLightIconButton } from '../form/ErrorLightIconButton'
import { SelectField } from '../form/SelectField'
import { TextField } from '../form/TextField'
import { TextareaField } from '../form/TextareaField'
import type { ReportAction } from '../../domain/report/reducer'
import type { RepoBadgeColor, ReportState } from '../../domain/report/types'

interface ReportAlertEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

const badgeColorOptions: Array<{ value: RepoBadgeColor; label: string }> = [
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
]

export function ReportAlertEditor({ state, dispatch }: ReportAlertEditorProps) {
  return (
    <>
      <div className="toggle-row">
        <CheckboxField
          label="Показывать бейджи"
          checked={state.alertBadgesVisible}
          onChange={(checked) => dispatch({ type: 'patch', patch: { alertBadgesVisible: checked } })}
        />
        <CheckboxField
          label="Внутри сводки"
          checked={state.alertInsideSummary}
          onChange={(checked) => dispatch({ type: 'patch', patch: { alertInsideSummary: checked } })}
        />
      </div>

      <div className="field-group field-group--3">
        <ColorField
          label="Фон alert"
          value={state.ui.alertBg}
          fallback="#FFF4F1"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'alertBg', value })}
        />
        <ColorField
          label="Бордер alert"
          value={state.ui.alertBorder}
          fallback="#C45648"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'alertBorder', value })}
        />
        <ColorField
          label="Заголовок alert"
          value={state.ui.alertTitle}
          fallback="#C45648"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'alertTitle', value })}
        />
      </div>

      <div className="field-group field-group--3">
        <ColorField
          label="Текст alert"
          value={state.ui.alertText}
          fallback="#4B5563"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'alertText', value })}
        />
        <ColorField
          label="Badge bg"
          value={state.ui.badgeBg}
          fallback="#FFF1EE"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'badgeBg', value })}
        />
        <ColorField
          label="Badge text"
          value={state.ui.badgeText}
          fallback="#C45648"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'badgeText', value })}
        />
      </div>

      <div className="field-group field-group--3">
        <ColorField
          label="Success chip bg"
          value={state.ui.chipOkBg}
          fallback="rgba(61,196,102,.10)"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'chipOkBg', value })}
        />
        <ColorField
          label="Success chip text"
          value={state.ui.chipOkText}
          fallback="#3DC466"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'chipOkText', value })}
        />
        <ColorField
          label="Warning chip bg"
          value={state.ui.chipWarnBg}
          fallback="rgba(255,136,0,.10)"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'chipWarnBg', value })}
        />
      </div>

      <div className="field-group field-group--3">
        <ColorField
          label="Warning chip text"
          value={state.ui.chipWarnText}
          fallback="#FF8800"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'chipWarnText', value })}
        />
      </div>

      <TextareaField
        label="Заголовок ошибок"
        className="ui-input ui-input"
        value={state.alert.title}
        onChange={(value) => dispatch({ type: 'patch', patch: { alert: { ...state.alert, title: value } } })}
      />

      <TextareaField
        label="Текст ошибок"
        className="ui-input ui-input"
        value={state.alert.text}
        onChange={(value) => dispatch({ type: 'patch', patch: { alert: { ...state.alert, text: value } } })}
      />

      {state.alert.badges.map((badge, index) => (
        <div className="field-group field-group--pr" key={badge.id}>
          <TextField
            label={`Бейдж ${index + 1}`}
            value={badge.text}
            onChange={(value) => dispatch({ type: 'setAlertBadgeText', index, value })}
          />
          <SelectField
            label="Цвет бейджа"
            value={badge.color}
            options={badgeColorOptions}
            onChange={(value) => dispatch({ type: 'setAlertBadgeColor', index, value: value as RepoBadgeColor })}
          />
          <div className="ui-actions ui-actions--compact">
            <ErrorLightIconButton
              label="Удалить бейдж"
              disabled={state.alert.badges.length <= 1}
              onClick={() => dispatch({ type: 'removeAlertBadge', index })}
            />
          </div>
        </div>
      ))}

      <div className="button-row button-row">
        <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addAlertBadge' })}>
          Добавить бейдж
        </button>
      </div>
    </>
  )
}
