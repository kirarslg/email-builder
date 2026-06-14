import type { Dispatch } from 'react'
import { TextField } from '../form/TextField'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportActionsEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

export function ReportActionsEditor({ state, dispatch }: ReportActionsEditorProps) {
  return (
    <>
      <div className="field-group">
        <TextField
          label="Текст кнопки 1"
          value={state.actions.btn1Text}
          onChange={(value) => dispatch({ type: 'setActionsField', field: 'btn1Text', value })}
        />
        <TextField
          label="URL кнопки 1"
          value={state.actions.btn1Href}
          onChange={(value) => dispatch({ type: 'setActionsField', field: 'btn1Href', value })}
        />
      </div>

      <div className="field-group">
        <TextField
          label="Текст кнопки 2"
          value={state.actions.btn2Text}
          onChange={(value) => dispatch({ type: 'setActionsField', field: 'btn2Text', value })}
        />
        <TextField
          label="URL кнопки 2"
          value={state.actions.btn2Href}
          onChange={(value) => dispatch({ type: 'setActionsField', field: 'btn2Href', value })}
        />
      </div>

      <p className="report-helper">
        Если у первой таблицы параметров нет собственных кнопок, эти action-кнопки будут использованы как fallback, как в legacy-конструкторе.
      </p>
    </>
  )
}
