import { useDeferredValue, useMemo, useReducer, useState } from 'react'
import { ReportEditorPanel } from '../components/report/ReportEditorPanel'
import { ReportPreviewPanel } from '../components/report/ReportPreviewPanel'
import { HtmlOutputAccordion } from '../components/shared/HtmlOutputAccordion'
import { createDefaultReportState } from '../domain/report/defaults'
import { buildReportHtmlPreview } from '../domain/report/render'
import { reportReducer } from '../domain/report/reducer'
import { fileToDataUrl } from '../domain/shared/files'
import { formatKilobytes } from '../domain/shared/html'

const reportDefaults = createDefaultReportState()

export function ReportPage() {
  const [state, dispatch] = useReducer(reportReducer, reportDefaults)
  const [reportSectionsOpen, setReportSectionsOpen] = useState<Record<string, boolean>>({
    common: false,
    header: false,
    summary: false,
    alert: false,
    params: false,
    repos: false,
    actions: false,
    prList: false,
    footer: false,
  })
  const deferredState = useDeferredValue(state)
  const generatedHtml = useMemo(() => buildReportHtmlPreview(deferredState), [deferredState])
  const htmlSize = useMemo(() => formatKilobytes(new Blob([generatedHtml]).size), [generatedHtml])

  async function handleLogoUpload(files: FileList) {
    const file = files[0]
    if (!file) return
    const src = await fileToDataUrl(file)
    dispatch({ type: 'setUiField', field: 'logoImage', value: src })
    dispatch({ type: 'setUiField', field: 'logoImageName', value: file.name })
  }

  async function handleHeroBgUpload(files: FileList) {
    const file = files[0]
    if (!file) return
    const src = await fileToDataUrl(file)
    dispatch({ type: 'setUiField', field: 'heroBgImage', value: src })
    dispatch({ type: 'setUiField', field: 'heroBgImageName', value: file.name })
  }

  async function handleTemplateUpload(files: FileList) {
    const file = files[0]
    if (!file) return

    const name = file.name || ''
    const isSvg = /\.svg$/i.test(name) || file.type === 'image/svg+xml'
    const isPng = /\.png$/i.test(name) || file.type === 'image/png'

    if (isSvg) {
      const text = await file.text()
      dispatch({
        type: 'patch',
        patch: {
          template: {
            ...state.template,
            kind: 'svg',
            data: text,
            show: false,
          },
        },
      })
      return
    }

    if (isPng) {
      const src = await fileToDataUrl(file)
      dispatch({
        type: 'patch',
        patch: {
          template: {
            ...state.template,
            kind: 'png',
            data: src,
            show: true,
          },
        },
      })
    }
  }

  const toggleReportSection = (key: string) => {
    setReportSectionsOpen((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  return (
    <>
      {/* Левая колонка: preview card + HTML accordion ниже */}
      <div className="report-pane report-pane-preview" id="reportPreviewPane">
        <ReportPreviewPanel generatedHtml={generatedHtml} htmlSize={htmlSize} />
        <HtmlOutputAccordion html={generatedHtml} id="reportOutputSection" title="HTML отчёта" />
      </div>

      {/* Правая колонка: editor card */}
      <div className="card report-pane report-pane-inputs" id="reportInputsCard">
        <div className="ui-panel-header">
          <div className="ui-panel-header__title">Настройка через формы</div>
        </div>
        <ReportEditorPanel
          dispatch={dispatch}
          onHeroBgUpload={handleHeroBgUpload}
          onLogoUpload={handleLogoUpload}
          onTemplateUpload={handleTemplateUpload}
          onToggleSection={toggleReportSection}
          reportSectionsOpen={reportSectionsOpen}
          state={state}
        />
      </div>
    </>
  )
}
