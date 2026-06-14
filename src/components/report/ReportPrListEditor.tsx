import type { Dispatch } from 'react'
import { ErrorLightIconButton } from '../form/ErrorLightIconButton'
import { TextField } from '../form/TextField'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportPrListEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

export function ReportPrListEditor({ state, dispatch }: ReportPrListEditorProps) {
  return (
    <>
      <div className="migration-grid-table">
        {state.prList.map((item, index) => (
          <div className="field-group field-group--pr" key={item.id}>
            <TextField
              label={`Repo ${index + 1}`}
              value={item.repo}
              onChange={(value) => dispatch({ type: 'setPrListField', index, field: 'repo', value })}
            />
            <TextField
              label={`URL ${index + 1}`}
              value={item.url}
              onChange={(value) => dispatch({ type: 'setPrListField', index, field: 'url', value })}
            />
            <div className="ui-actions ui-actions--compact">
              <ErrorLightIconButton
                label="Удалить строку"
                disabled={state.prList.length <= 1}
                onClick={() => dispatch({ type: 'removePrListItem', index })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="button-row button-row">
        <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addPrListItem' })}>
          Добавить строку списка
        </button>
      </div>
    </>
  )
}
