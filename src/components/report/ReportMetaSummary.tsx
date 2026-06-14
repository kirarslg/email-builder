import type { ReportState } from '../../domain/report/types'

interface ReportMetaSummaryProps {
  state: ReportState
  htmlSize: string
}

export function ReportMetaSummary({ state, htmlSize }: ReportMetaSummaryProps) {
  return (
    <div className="migration-meta">
      <div className="migration-meta__item">
        <p className="migration-meta__label">Summary cards</p>
        <p className="migration-meta__value">{state.summaryCards.length}</p>
      </div>
      <div className="migration-meta__item">
        <p className="migration-meta__label">Alert badges</p>
        <p className="migration-meta__value">{state.alert.badges.length}</p>
      </div>
      <div className="migration-meta__item">
        <p className="migration-meta__label">HTML size</p>
        <p className="migration-meta__value">{htmlSize}</p>
      </div>
    </div>
  )
}
