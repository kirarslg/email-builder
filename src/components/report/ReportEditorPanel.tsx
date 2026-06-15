import type { Dispatch } from 'react'
import { ReportAccordionSection } from './ReportAccordionSection'
// import { ReportActionsEditor } from './ReportActionsEditor' // раздел «Действия» временно скрыт
import { ReportAlertEditor } from './ReportAlertEditor'
import { ReportCommonStylesEditor } from './ReportCommonStylesEditor'
import { ReportFooterEditor } from './ReportFooterEditor'
import { ReportHeaderEditor } from './ReportHeaderEditor'
import { ReportParamTablesEditor } from './ReportParamTablesEditor'
import { ReportPrListEditor } from './ReportPrListEditor'
import { ReportRepoTablesEditor } from './ReportRepoTablesEditor'
import { ReportSummaryEditor } from './ReportSummaryEditor'
import { createDefaultReportState } from '../../domain/report/defaults'
import type { ReportAction } from '../../domain/report/reducer'
import type { ReportState } from '../../domain/report/types'

interface ReportEditorPanelProps {
  state: ReportState
  dispatch: Dispatch<ReportAction>
  reportSectionsOpen: Record<string, boolean>
  onToggleSection: (key: string) => void
  onTemplateUpload: (files: FileList) => Promise<void>
  onLogoUpload: (files: FileList) => Promise<void>
  onHeroBgUpload: (files: FileList) => Promise<void>
}

export function ReportEditorPanel({
  state,
  dispatch,
  reportSectionsOpen,
  onToggleSection,
  onTemplateUpload,
  onLogoUpload,
  onHeroBgUpload,
}: ReportEditorPanelProps) {
  const renderSectionToggle = (checked: boolean, onChange: (next: boolean) => void, label: string) => (
    <label
      className="ui-checkbox ui-checkbox--bare"
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
    </label>
  )

  return (
    <div className="ui-accordion-list">
        <ReportAccordionSection
          isOpen={reportSectionsOpen.common !== false}
          title="Основные стили"
          onToggle={() => onToggleSection('common')}
        >
          <ReportCommonStylesEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>

        <ReportAccordionSection
          isOpen={reportSectionsOpen.header !== false}
          title="Шапка"
          right={renderSectionToggle(
            state.sec.header,
            (checked) => dispatch({ type: 'setSectionToggle', field: 'header', value: checked }),
            'Показывать шапку',
          )}
          onToggle={() => onToggleSection('header')}
        >
          <ReportHeaderEditor
            dispatch={dispatch}
            onHeroBgUpload={onHeroBgUpload}
            onLogoUpload={onLogoUpload}
            state={state}
          />
        </ReportAccordionSection>

        <ReportAccordionSection
          isOpen={reportSectionsOpen.summary !== false}
          title="Сводка"
          right={renderSectionToggle(
            state.sec.summary,
            (checked) => dispatch({ type: 'setSectionToggle', field: 'summary', value: checked }),
            'Показывать сводку',
          )}
          onToggle={() => onToggleSection('summary')}
        >
          <ReportSummaryEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>

        <ReportAccordionSection
          isOpen={reportSectionsOpen.alert !== false}
          title="Ошибки"
          right={renderSectionToggle(
            state.sec.alert,
            (checked) => dispatch({ type: 'setSectionToggle', field: 'alert', value: checked }),
            'Показывать блок ошибок',
          )}
          onToggle={() => onToggleSection('alert')}
        >
          <ReportAlertEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>

        <ReportAccordionSection
          isOpen={reportSectionsOpen.params !== false}
          title="Вертикальная таблица"
          right={renderSectionToggle(
            state.sec.params,
            (checked) => dispatch({ type: 'setSectionToggle', field: 'params', value: checked }),
            'Показывать таблицу параметров',
          )}
          onToggle={() => onToggleSection('params')}
        >
          <ReportParamTablesEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>

        <ReportAccordionSection
          isOpen={reportSectionsOpen.repos !== false}
          title="Горизонтальная таблица"
          right={renderSectionToggle(
            state.sec.repos,
            (checked) => dispatch({ type: 'setSectionToggle', field: 'repos', value: checked }),
            'Показывать таблицу репозиториев',
          )}
          onToggle={() => onToggleSection('repos')}
        >
          <ReportRepoTablesEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>

        {/* Раздел «Действия» временно скрыт
        <ReportAccordionSection
          isOpen={reportSectionsOpen.actions !== false}
          title="Действия"
          right={renderSectionToggle(
            state.actions.show,
            (checked) => dispatch({ type: 'setActionsField', field: 'show', value: checked }),
            'Показывать action-кнопки',
          )}
          onToggle={() => onToggleSection('actions')}
        >
          <ReportActionsEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>
        */}

        <ReportAccordionSection
          isOpen={reportSectionsOpen.prList !== false}
          title="Список"
          right={renderSectionToggle(
            state.sec.prList,
            (checked) => dispatch({ type: 'setSectionToggle', field: 'prList', value: checked }),
            'Показывать список',
          )}
          onToggle={() => onToggleSection('prList')}
        >
          <ReportPrListEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>

        <ReportAccordionSection
          isOpen={reportSectionsOpen.footer !== false}
          title="Текстовый блок"
          right={renderSectionToggle(
            state.sec.footerText,
            (checked) => dispatch({ type: 'setSectionToggle', field: 'footerText', value: checked }),
            'Показывать текстовый блок',
          )}
          onToggle={() => onToggleSection('footer')}
        >
          <ReportFooterEditor dispatch={dispatch} state={state} />
        </ReportAccordionSection>

        {/* Кнопка «Сбросить к дефолтам» временно скрыта
        <div className="button-row">
          <button
            className="ui-btn ui-btn--m ui-btn--secondary"
            type="button"
            onClick={() => dispatch({ type: 'reset', payload: createDefaultReportState() })}
          >
            Сбросить к дефолтам
          </button>
        </div>
        */}
    </div>
  )
}
