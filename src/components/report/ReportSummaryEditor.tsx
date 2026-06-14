import type { Dispatch } from 'react'
import { ColorField } from '../form/ColorField'
import { ErrorLightIconButton } from '../form/ErrorLightIconButton'
import { NumberField } from '../form/NumberField'
import { TextField } from '../form/TextField'
import { TextareaField } from '../form/TextareaField'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportSummaryEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

export function ReportSummaryEditor({ state, dispatch }: ReportSummaryEditorProps) {
  return (
    <>
      <TextareaField
        label="Заголовок сводки"
        className="ui-input ui-input"
        value={state.summaryTitle}
        onChange={(value) => dispatch({ type: 'setSummaryTitle', value })}
      />

      <div className="field-group field-group--3">
        <NumberField
          label="Ширина карточки"
          value={state.ui.statW}
          onChange={(value) => dispatch({ type: 'setUiField', field: 'statW', value: value ?? 0 })}
        />
        <NumberField
          label="Высота карточки"
          value={state.ui.statH}
          onChange={(value) => dispatch({ type: 'setUiField', field: 'statH', value: value ?? 0 })}
        />
        <ColorField
          label="Акцент карточки"
          value={state.ui.statAccent}
          fallback="#111111"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'statAccent', value })}
        />
      </div>

      {state.summaryCards.map((card, index) => (
        <div className="field-group field-group--pr" key={card.id}>
          <TextField
            label={`Карточка ${index + 1}: значение`}
            value={card.value}
            onChange={(value) => dispatch({ type: 'setSummaryCardField', index, field: 'value', value })}
          />
          <TextField
            label={`Карточка ${index + 1}: подпись`}
            value={card.label}
            onChange={(value) => dispatch({ type: 'setSummaryCardField', index, field: 'label', value })}
          />
          <div className="ui-actions ui-actions--compact">
            <ErrorLightIconButton
              label="Удалить карточку"
              disabled={state.summaryCards.length <= 1}
              onClick={() => dispatch({ type: 'removeSummaryCard', index })}
            />
          </div>
        </div>
      ))}

      <div className="button-row button-row">
        <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addSummaryCard' })}>
          Добавить карточку
        </button>
      </div>
    </>
  )
}
