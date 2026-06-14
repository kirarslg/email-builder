export type RepoBadgeColor = 'green' | 'red' | 'blue' | 'yellow'

export interface ReportMeta {
  type: string
  task: string
  start: string
  end: string
  duration: string
  status: string
}

export interface ReportTemplateState {
  kind: string
  data: string
  show: boolean
  opacity: number
}

export interface ReportActionsState {
  btn1Text: string
  btn1Href: string
  btn2Text: string
  btn2Href: string
  show: boolean
}

export interface ReportFooterState {
  text: string
  subtitle: string
  sub: string
  align: 'left' | 'center' | 'right'
  bg: string
}

export interface SummaryCard {
  id: string
  value: string
  label: string
}

export interface AlertBadge {
  id: string
  text: string
  color: RepoBadgeColor
}

export interface ReportAlertState {
  title: string
  text: string
  okPercent: number
  mergePercent: number
  badges: AlertBadge[]
}

export interface ReportSectionToggles {
  header: boolean
  summary: boolean
  alert: boolean
  params: boolean
  repos: boolean
  prList: boolean
  footerText: boolean
}

export interface ReportUiState {
  logoSvg: string
  logoImage: string
  logoImageName: string
  heroBgImage: string
  heroBgImageName: string
  bodyBg: string
  bodyContentBg: string
  bodyPadTop: number
  bodyPadBottom: number
  bodyPadLeft: number
  bodyPadRight: number
  bodyBorder: string
  heroBg: string
  heroTitleColor: string
  heroCellLabelColor: string
  heroCellValueColor: string
  heroBorder: string
  statW: number
  statH: number
  statAccent: string
  tableHeadBg: string
  tableHeadText: string
  tableBorder: string
  textPrimary: string
  textSecondary: string
  statLabelColor: string
  cardBg: string
  surfaceBg: string
  buttonBg: string
  buttonText: string
  badgeBg: string
  badgeText: string
  statusBg: string
  statusText: string
  chipOkBg: string
  chipOkText: string
  chipWarnBg: string
  chipWarnText: string
  alertBg: string
  alertBorder: string
  alertTitle: string
  alertText: string
}

export interface HeaderCell {
  id: string
  label: string
  value: string
}

export interface ParamColumn {
  id: string
  title: string
}

export interface ParamRow {
  id: string
  cells: string[]
}

export interface SectionButton {
  id: string
  text: string
  url: string
  textColor: string
  bgColor: string
}

export interface ParamTable {
  id: string
  title: string
  columns: ParamColumn[]
  rows: ParamRow[]
  buttons: SectionButton[]
}

export interface RepoCell {
  value: string
  isBadge: boolean
  badgeColor: RepoBadgeColor
}

export interface RepoColumn {
  id: string
  title: string
}

export interface RepoRow {
  id: string
  cells: RepoCell[]
}

export interface RepoTable {
  id: string
  title: string
  columns: RepoColumn[]
  rows: RepoRow[]
  buttons: SectionButton[]
  infoBadgeEnabled: boolean
  infoBadgeText: string
}

export interface PrListItem {
  id: string
  repo: string
  url: string
}

export interface ReportState {
  title: string
  summaryTitle: string
  meta: ReportMeta
  headerStatus: string
  headerStatusVisible: boolean
  headerCellsVisible: boolean
  headerCells: HeaderCell[]
  template: ReportTemplateState
  actions: ReportActionsState
  reposInfo: {
    processed: number
    total: number
  }
  footer: ReportFooterState
  summaryCards: SummaryCard[]
  alert: ReportAlertState
  alertBadgesVisible: boolean
  alertInsideSummary: boolean
  params: ParamTable[]
  repos: RepoTable[]
  prList: PrListItem[]
  sec: ReportSectionToggles
  ui: ReportUiState
}
