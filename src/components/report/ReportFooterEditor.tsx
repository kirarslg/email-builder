import type { Dispatch } from 'react'
import { ColorField } from '../form/ColorField'
import { SelectField } from '../form/SelectField'
import { TextField } from '../form/TextField'
import { TextareaField } from '../form/TextareaField'
import { createDefaultReportState } from '../../domain/report/defaults'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportFooterEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

export function ReportFooterEditor({ state, dispatch }: ReportFooterEditorProps) {
  return (
    <>
      <div className="field-group">
        <TextField
          label="Заголовок блока"
          value={state.footer.text}
          onChange={(value) => dispatch({ type: 'setFooterField', field: 'text', value })}
        />
        <TextField
          label="Подзаголовок"
          value={state.footer.subtitle}
          onChange={(value) => dispatch({ type: 'setFooterField', field: 'subtitle', value })}
        />
      </div>

      <TextareaField
        label="Описание"
        className="ui-input ui-input"
        value={state.footer.sub}
        onChange={(value) => dispatch({ type: 'setFooterField', field: 'sub', value })}
      />

      <div className="field-group field-group--3">
        <SelectField
          label="Выравнивание"
          value={state.footer.align}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
          onChange={(value) => dispatch({ type: 'setFooterField', field: 'align', value })}
        />
        <ColorField
          label="Фон блока"
          value={state.footer.bg}
          fallback="#ecf2f3"
          onChange={(value) => dispatch({ type: 'setFooterField', field: 'bg', value })}
        />
        <div className="button-row">
          <button
            className="ui-btn ui-btn--m ui-btn--secondary"
            type="button"
            onClick={() => dispatch({ type: 'reset', payload: createDefaultReportState() })}
          >
            Сбросить к дефолтам
          </button>
        </div>
      </div>
    </>
  )
}
