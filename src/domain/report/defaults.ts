import { createUid } from '../shared/id'
import type {
  AlertBadge,
  HeaderCell,
  ParamColumn,
  ParamRow,
  ParamTable,
  RepoBadgeColor,
  RepoCell,
  RepoRow,
  RepoTable,
  ReportState,
  SectionButton,
  SummaryCard,
  PrListItem,
} from './types'

export const REPO_BADGE_COLORS: RepoBadgeColor[] = ['green', 'red', 'blue', 'yellow']

export function createSummaryCard(value = '', label = ''): SummaryCard {
  return {
    id: createUid('summary-card'),
    value: String(value),
    label: String(label),
  }
}

export function createAlertBadge(text = '', color: RepoBadgeColor = 'green'): AlertBadge {
  return {
    id: createUid('alert-badge'),
    text: String(text),
    color: REPO_BADGE_COLORS.includes(color) ? color : 'green',
  }
}

export function createHeaderCell(label = '', value = ''): HeaderCell {
  return {
    id: createUid('header-cell'),
    label: String(label).trim(),
    value: String(value).trim(),
  }
}

export function createParamColumn(title = ''): ParamColumn {
  return {
    id: createUid('param-col'),
    title: String(title),
  }
}

export function createParamRow(cells: string[]): ParamRow {
  return {
    id: createUid('param-row'),
    cells,
  }
}

export function createSectionButton(
  text = '',
  url = '',
  textColor = '#4B5563',
  bgColor = '#F3F6FA',
): SectionButton {
  return {
    id: createUid('section-btn'),
    text: String(text),
    url: String(url),
    textColor: String(textColor),
    bgColor: String(bgColor),
  }
}

export function createDefaultParamTable(): ParamTable {
  const columns = [createParamColumn('Параметр'), createParamColumn('Значение')]
  return {
    id: createUid('param-table'),
    title: 'Параметры запуска',
    columns,
    rows: [
      createParamRow(['Среда', 'Тестовый контур']),
      createParamRow(['Версия сборки', 'demo-1.0.0']),
      createParamRow(['Исполнитель', 'Codex']),
    ],
    buttons: [],
  }
}

export function createRepoCell(value = '', isBadge = false, badgeColor: RepoBadgeColor = 'green'): RepoCell {
  return {
    value: String(value),
    isBadge,
    badgeColor,
  }
}

export function createRepoRow(cells: RepoCell[]): RepoRow {
  return {
    id: createUid('repo-row'),
    cells,
  }
}

export function createDefaultRepoTable(): RepoTable {
  const columns = [
    { id: createUid('repo-col'), title: 'Репозиторий' },
    { id: createUid('repo-col'), title: 'Статус' },
    { id: createUid('repo-col'), title: 'Pull Request' },
  ]

  return {
    id: createUid('repo-table'),
    title: 'Детали по репозиториям',
    columns,
    rows: [
      createRepoRow([
        createRepoCell('Repo-a'),
        createRepoCell('Успешно', true, 'green'),
        createRepoCell('https://example.com/pr/1'),
      ]),
      createRepoRow([
        createRepoCell('Repo-b'),
        createRepoCell('Требует внимания', true, 'yellow'),
        createRepoCell('https://example.com/pr/2'),
      ]),
    ],
    buttons: [],
    infoBadgeEnabled: true,
    infoBadgeText: 'Обработано репозиториев: {{count}}',
  }
}

export function createPrListItem(repo = '', url = ''): PrListItem {
  return {
    id: createUid('pr-item'),
    repo: String(repo),
    url: String(url),
  }
}

export function getDefaultSummaryCards(): SummaryCard[] {
  return [
    createSummaryCard('12', 'Демо-задач в отчёте'),
    createSummaryCard('3', 'Пример активных блоков'),
  ]
}

export function getDefaultHeaderCells(): HeaderCell[] {
  return [
    createHeaderCell('Тип', 'release'),
    createHeaderCell('Задача', 'TASK-123'),
    createHeaderCell('Время', '2026-02-18 17:17:49 — 2026-02-18 17:25:28 (7 мин 39 сек)'),
  ]
}

export function getDefaultAlertBadges(): AlertBadge[] {
  return [
    createAlertBadge('Процент успешных обработок: 90%', 'green'),
    createAlertBadge('Процент успешных мержей: 72%', 'yellow'),
  ]
}

export function createDefaultReportState(): ReportState {
  return {
    title: 'Отчёт',
    summaryTitle: 'Сводная статистика',
    meta: {
      type: '',
      task: '',
      start: '',
      end: '',
      duration: '',
      status: 'Default',
    },
    headerStatus: 'Default',
    headerStatusVisible: true,
    headerCellsVisible: false,
    headerCells: getDefaultHeaderCells(),
    template: {
      kind: '',
      data: '',
      show: false,
      opacity: 22,
    },
    actions: {
      btn1Text: '',
      btn1Href: '',
      btn2Text: '',
      btn2Href: '',
      show: false,
    },
    reposInfo: {
      processed: 0,
      total: 0,
    },
    footer: {
      text: 'Текстовый блок',
      subtitle: '',
      sub: 'Описание текстового блока',
      align: 'center',
      bg: '#ecf2f3',
    },
    summaryCards: getDefaultSummaryCards(),
    alert: {
      title: '',
      text: '',
      okPercent: 0,
      mergePercent: 0,
      badges: getDefaultAlertBadges(),
    },
    alertBadgesVisible: false,
    alertInsideSummary: false,
    params: [createDefaultParamTable()],
    repos: [createDefaultRepoTable()],
    prList: [createPrListItem('Repo-a', 'https://example.com/pr/1')],
    sec: {
      header: true,
      summary: false,
      alert: false,
      params: false,
      repos: true,
      prList: false,
      footerText: false,
    },
    ui: {
      logoSvg: '',
      logoImage: '',
      logoImageName: '',
      heroBgImage: '',
      heroBgImageName: '',
      bodyBg: '#ffffff',
      bodyContentBg: '#ffffff',
      bodyPadTop: 28,
      bodyPadBottom: 28,
      bodyPadLeft: 16,
      bodyPadRight: 16,
      bodyBorder: 'transparent',
      heroBg: '#ecf2f3',
      heroTitleColor: '#000000',
      heroCellLabelColor: '#7a7f87',
      heroCellValueColor: '#111111',
      heroBorder: 'transparent',
      statW: 160,
      statH: 70,
      statAccent: '#111111',
      tableHeadBg: '#F6F8FB',
      tableHeadText: '#7a7f87',
      tableBorder: '#E0E8F2',
      textPrimary: '#111111',
      textSecondary: '#7a7f87',
      statLabelColor: '#7a7f87',
      cardBg: '#ffffff',
      surfaceBg: '#ffffff',
      buttonBg: '#F3F6FA',
      buttonText: '#4B5563',
      badgeBg: '#FFF1EE',
      badgeText: '#C45648',
      statusBg: 'rgba(61,196,102,.10)',
      statusText: '#3DC466',
      chipOkBg: 'rgba(61,196,102,.10)',
      chipOkText: '#3DC466',
      chipWarnBg: 'rgba(255,136,0,.10)',
      chipWarnText: '#FF8800',
      alertBg: '#FFF4F1',
      alertBorder: '#C45648',
      alertTitle: '#C45648',
      alertText: '#4B5563',
    },
  }
}
