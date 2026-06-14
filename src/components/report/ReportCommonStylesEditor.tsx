import type { Dispatch } from 'react'
import { ColorField } from '../form/ColorField'
import { NumberField } from '../form/NumberField'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportCommonStylesEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

export function ReportCommonStylesEditor({
  state,
  dispatch,
}: ReportCommonStylesEditorProps) {
  return (
    <>
      <div className="field-group">
        <ColorField
          label="Цвет основного фона"
          value={state.ui.bodyBg}
          fallback="#ffffff"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'bodyBg', value })}
        />
        <ColorField
          label="Цвет тела письма"
          value={state.ui.bodyContentBg}
          fallback="#ffffff"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'bodyContentBg', value })}
        />
      </div>

      <div className="field-group">
        <NumberField
          label="Отступ сверху"
          value={state.ui.bodyPadTop}
          onChange={(value) => dispatch({ type: 'setUiField', field: 'bodyPadTop', value: value ?? 0 })}
        />
        <NumberField
          label="Отступ снизу"
          value={state.ui.bodyPadBottom}
          onChange={(value) => dispatch({ type: 'setUiField', field: 'bodyPadBottom', value: value ?? 0 })}
        />
      </div>

    </>
  )
}
