import type { Dispatch } from 'react'
import { ColorField } from '../form/ColorField'
import { ErrorLightIconButton } from '../form/ErrorLightIconButton'
import { FieldActionRow } from '../form/FieldActionRow'
import { TextField } from '../form/TextField'
import { TextareaField } from '../form/TextareaField'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportParamTablesEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

export function ReportParamTablesEditor({ state, dispatch }: ReportParamTablesEditorProps) {
  return (
    <>
      <div className="field-group field-group--3">
        <ColorField
          label="Фон head"
          value={state.ui.tableHeadBg}
          fallback="#F6F8FB"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'tableHeadBg', value })}
        />
        <ColorField
          label="Текст head"
          value={state.ui.tableHeadText}
          fallback="#7a7f87"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'tableHeadText', value })}
        />
        <ColorField
          label="Бордер таблицы"
          value={state.ui.tableBorder}
          fallback="#E0E8F2"
          onChange={(value) => dispatch({ type: 'setUiField', field: 'tableBorder', value })}
        />
      </div>

      {state.params.map((table, tableIndex) => (
        <div className="migration-grid-table__repo" key={table.id}>
          <TextareaField
            label={`Заголовок таблицы параметров ${tableIndex + 1}`}
            className="ui-input ui-input"
            value={table.title}
            onChange={(value) => dispatch({ type: 'setParamTableTitle', index: tableIndex, value })}
          />

          <div className="migration-grid-table">
            {table.columns.map((column, columnIndex) => (
              <FieldActionRow
                key={column.id}
                action={
                  <ErrorLightIconButton
                    label="Удалить столбец"
                    disabled={table.columns.length <= 1}
                    onClick={() => dispatch({ type: 'removeParamColumn', tableIndex, columnIndex })}
                  />
                }
              >
                <TextField
                  label={`Столбец ${columnIndex + 1}`}
                  value={column.title}
                  onChange={(value) => dispatch({ type: 'setParamColumnTitle', tableIndex, columnIndex, value })}
                />
              </FieldActionRow>
            ))}
          </div>

          <div className="button-row">
            <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addParamColumn', tableIndex })}>
              Добавить столбец
            </button>
          </div>

          <div className="migration-grid-table">
            {table.rows.map((row, rowIndex) => (
              <div className="migration-grid-table__repo" key={row.id}>
                {table.columns.map((column, cellIndex) => (
                  <TextField
                    key={`${row.id}-${column.id}`}
                    label={`${column.title || `Поле ${cellIndex + 1}`} ${rowIndex + 1}`}
                    value={row.cells[cellIndex] || ''}
                    onChange={(value) => dispatch({ type: 'setParamCell', tableIndex, rowIndex, cellIndex, value })}
                  />
                ))}
                <div className="button-row">
                  <button
                    className="ui-btn ui-btn--s ui-btn--secondary"
                    type="button"
                    disabled={table.rows.length <= 1}
                    onClick={() => dispatch({ type: 'removeParamRow', tableIndex, rowIndex })}
                  >
                    Удалить строку
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="button-row button-row">
            <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addParamRow', tableIndex })}>
              Добавить строку параметров
            </button>
            <button
              className="ui-btn ui-btn--m ui-btn--secondary"
              type="button"
              disabled={state.params.length <= 1}
              onClick={() => dispatch({ type: 'removeParamTable', tableIndex })}
            >
              Удалить таблицу
            </button>
          </div>

          {table.buttons.map((button, buttonIndex) => (
            <div className="migration-grid-table__repo" key={button.id}>
              <TextField
                label={`Кнопка ${buttonIndex + 1}: текст`}
                value={button.text}
                onChange={(value) => dispatch({ type: 'setParamButtonField', tableIndex, buttonIndex, field: 'text', value })}
              />
              <TextField
                label={`Кнопка ${buttonIndex + 1}: ссылка`}
                value={button.url}
                onChange={(value) => dispatch({ type: 'setParamButtonField', tableIndex, buttonIndex, field: 'url', value })}
              />
              <div className="field-group">
                <ColorField
                  label="Цвет текста"
                  value={button.textColor}
                  fallback="#4B5563"
                  onChange={(value) =>
                    dispatch({ type: 'setParamButtonField', tableIndex, buttonIndex, field: 'textColor', value })
                  }
                />
                <ColorField
                  label="Цвет фона"
                  value={button.bgColor}
                  fallback="#F3F6FA"
                  onChange={(value) =>
                    dispatch({ type: 'setParamButtonField', tableIndex, buttonIndex, field: 'bgColor', value })
                  }
                />
              </div>
            </div>
          ))}

          <div className="button-row button-row">
            <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addParamButton', tableIndex })}>
              Добавить кнопку
            </button>
            <button
              className="ui-btn ui-btn--m ui-btn--secondary"
              type="button"
              disabled={table.buttons.length === 0}
              onClick={() =>
                dispatch({
                  type: 'removeParamButton',
                  tableIndex,
                  buttonIndex: Math.max(0, table.buttons.length - 1),
                })
              }
            >
              Удалить последнюю кнопку
            </button>
          </div>
        </div>
      ))}

      <div className="button-row">
        <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addParamTable' })}>
          Добавить таблицу параметров
        </button>
      </div>
    </>
  )
}
