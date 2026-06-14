import type { Dispatch } from 'react'
import { CheckboxField } from '../form/CheckboxField'
import { ColorField } from '../form/ColorField'
import { ErrorLightIconButton } from '../form/ErrorLightIconButton'
import { FieldActionRow } from '../form/FieldActionRow'
import { SelectField } from '../form/SelectField'
import { TextField } from '../form/TextField'
import { TextareaField } from '../form/TextareaField'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportRepoTablesEditorProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
}

export function ReportRepoTablesEditor({ state, dispatch }: ReportRepoTablesEditorProps) {
  return (
    <>
      {state.repos.map((table, tableIndex) => (
        <div className="migration-grid-table__repo" key={table.id}>
          <div className="toggle-row">
            <CheckboxField
              label="Показывать info badge"
              checked={table.infoBadgeEnabled || false}
              onChange={(checked) => dispatch({ type: 'setRepoInfoBadgeEnabled', tableIndex, value: checked })}
            />
          </div>

          <TextField
            label="Текст info badge"
            value={table.infoBadgeText || ''}
            onChange={(value) => dispatch({ type: 'setRepoInfoBadgeText', tableIndex, value })}
          />

          <TextareaField
            label={`Заголовок таблицы репозиториев ${tableIndex + 1}`}
            className="ui-input ui-input"
            value={table.title}
            onChange={(value) => dispatch({ type: 'setRepoTableTitle', index: tableIndex, value })}
          />

          <div className="migration-grid-table">
            {table.columns.map((column, columnIndex) => (
              <FieldActionRow
                key={column.id}
                action={
                  <ErrorLightIconButton
                    label="Удалить столбец"
                    disabled={table.columns.length <= 1}
                    onClick={() => dispatch({ type: 'removeRepoColumn', tableIndex, columnIndex })}
                  />
                }
              >
                <TextField
                  label={`Столбец ${columnIndex + 1}`}
                  value={column.title}
                  onChange={(value) => dispatch({ type: 'setRepoColumnTitle', tableIndex, columnIndex, value })}
                />
              </FieldActionRow>
            ))}
          </div>

          <div className="button-row">
            <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addRepoColumn', tableIndex })}>
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
                    value={row.cells[cellIndex]?.value || ''}
                    onChange={(value) => dispatch({ type: 'setRepoCell', tableIndex, rowIndex, cellIndex, value })}
                  />
                ))}
                <div className="toggle-row">
                  <CheckboxField
                    label="Status as badge"
                    checked={!!row.cells[1]?.isBadge}
                    onChange={(checked) => dispatch({ type: 'setRepoCellBadge', tableIndex, rowIndex, checked })}
                  />
                  <SelectField
                    label="Badge color"
                    value={row.cells[1]?.badgeColor || 'green'}
                    options={[
                      { value: 'green', label: 'Green' },
                      { value: 'yellow', label: 'Yellow' },
                      { value: 'red', label: 'Red' },
                      { value: 'blue', label: 'Blue' },
                    ]}
                    onChange={(value) => dispatch({ type: 'setRepoBadgeColor', tableIndex, rowIndex, value: value as any })}
                  />
                </div>
                <div className="button-row">
                  <button
                    className="ui-btn ui-btn--s ui-btn--secondary"
                    type="button"
                    disabled={table.rows.length <= 1}
                    onClick={() => dispatch({ type: 'removeRepoRow', tableIndex, rowIndex })}
                  >
                    Удалить строку
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="button-row button-row">
            <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addRepoRow', tableIndex })}>
              Добавить строку репозитория
            </button>
            <button
              className="ui-btn ui-btn--m ui-btn--secondary"
              type="button"
              disabled={state.repos.length <= 1}
              onClick={() => dispatch({ type: 'removeRepoTable', tableIndex })}
            >
              Удалить таблицу
            </button>
          </div>

          {table.buttons.map((button, buttonIndex) => (
            <div className="migration-grid-table__repo" key={button.id}>
              <TextField
                label={`Кнопка ${buttonIndex + 1}: текст`}
                value={button.text}
                onChange={(value) => dispatch({ type: 'setRepoButtonField', tableIndex, buttonIndex, field: 'text', value })}
              />
              <TextField
                label={`Кнопка ${buttonIndex + 1}: ссылка`}
                value={button.url}
                onChange={(value) => dispatch({ type: 'setRepoButtonField', tableIndex, buttonIndex, field: 'url', value })}
              />
              <div className="field-group">
                <ColorField
                  label="Цвет текста"
                  value={button.textColor}
                  fallback="#4B5563"
                  onChange={(value) =>
                    dispatch({ type: 'setRepoButtonField', tableIndex, buttonIndex, field: 'textColor', value })
                  }
                />
                <ColorField
                  label="Цвет фона"
                  value={button.bgColor}
                  fallback="#F3F6FA"
                  onChange={(value) =>
                    dispatch({ type: 'setRepoButtonField', tableIndex, buttonIndex, field: 'bgColor', value })
                  }
                />
              </div>
            </div>
          ))}

          <div className="button-row button-row">
            <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addRepoButton', tableIndex })}>
              Добавить кнопку
            </button>
            <button
              className="ui-btn ui-btn--m ui-btn--secondary"
              type="button"
              disabled={table.buttons.length === 0}
              onClick={() =>
                dispatch({
                  type: 'removeRepoButton',
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
        <button className="ui-btn ui-btn--m ui-btn--secondary" type="button" onClick={() => dispatch({ type: 'addRepoTable' })}>
          Добавить таблицу репозиториев
        </button>
      </div>

    </>
  )
}
