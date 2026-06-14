import type { ReportState } from './types'
import {
  createAlertBadge,
  createDefaultParamTable,
  createDefaultRepoTable,
  createHeaderCell,
  createParamRow,
  createPrListItem,
  createRepoCell,
  createRepoRow,
  createSectionButton,
  createSummaryCard,
} from './defaults'

export type ReportAction =
  | { type: 'patch'; patch: Partial<ReportState> }
  | { type: 'setTitle'; value: string }
  | { type: 'setHeaderStatus'; value: string }
  | { type: 'setMetaField'; field: keyof ReportState['meta']; value: string }
  | { type: 'setHeaderCellField'; index: number; field: 'label' | 'value'; value: string }
  | { type: 'addHeaderCell' }
  | { type: 'removeHeaderCell'; index: number }
  | { type: 'reorderHeaderCells'; from: number; to: number }
  | { type: 'setUiField'; field: keyof ReportState['ui']; value: string | number }
  | { type: 'setFooterField'; field: keyof ReportState['footer']; value: string }
  | { type: 'setActionsField'; field: keyof ReportState['actions']; value: string | boolean }
  | { type: 'setSectionToggle'; field: keyof ReportState['sec']; value: boolean }
  | { type: 'setSummaryTitle'; value: string }
  | { type: 'setSummaryCardField'; index: number; field: 'value' | 'label'; value: string }
  | { type: 'addSummaryCard' }
  | { type: 'removeSummaryCard'; index: number }
  | { type: 'setAlertBadgeText'; index: number; value: string }
  | { type: 'setAlertBadgeColor'; index: number; value: ReportState['alert']['badges'][number]['color'] }
  | { type: 'addAlertBadge' }
  | { type: 'removeAlertBadge'; index: number }
  | { type: 'setParamTableTitle'; index: number; value: string }
  | { type: 'setParamColumnTitle'; tableIndex: number; columnIndex: number; value: string }
  | { type: 'addParamColumn'; tableIndex: number }
  | { type: 'removeParamColumn'; tableIndex: number; columnIndex: number }
  | { type: 'setParamCell'; tableIndex: number; rowIndex: number; cellIndex: number; value: string }
  | { type: 'addParamRow'; tableIndex: number }
  | { type: 'removeParamRow'; tableIndex: number; rowIndex: number }
  | { type: 'addParamTable' }
  | { type: 'removeParamTable'; tableIndex: number }
  | { type: 'setParamButtonField'; tableIndex: number; buttonIndex: number; field: 'text' | 'url' | 'textColor' | 'bgColor'; value: string }
  | { type: 'addParamButton'; tableIndex: number }
  | { type: 'removeParamButton'; tableIndex: number; buttonIndex: number }
  | { type: 'setRepoTableTitle'; index: number; value: string }
  | { type: 'setRepoInfoBadgeEnabled'; tableIndex: number; value: boolean }
  | { type: 'setRepoInfoBadgeText'; tableIndex: number; value: string }
  | { type: 'setRepoColumnTitle'; tableIndex: number; columnIndex: number; value: string }
  | { type: 'addRepoColumn'; tableIndex: number }
  | { type: 'removeRepoColumn'; tableIndex: number; columnIndex: number }
  | { type: 'setRepoCell'; tableIndex: number; rowIndex: number; cellIndex: number; value: string }
  | { type: 'setRepoCellBadge'; tableIndex: number; rowIndex: number; checked: boolean }
  | { type: 'setRepoBadgeColor'; tableIndex: number; rowIndex: number; value: ReportState['repos'][number]['rows'][number]['cells'][number]['badgeColor'] }
  | { type: 'addRepoRow'; tableIndex: number }
  | { type: 'removeRepoRow'; tableIndex: number; rowIndex: number }
  | { type: 'addRepoTable' }
  | { type: 'removeRepoTable'; tableIndex: number }
  | { type: 'setRepoButtonField'; tableIndex: number; buttonIndex: number; field: 'text' | 'url' | 'textColor' | 'bgColor'; value: string }
  | { type: 'addRepoButton'; tableIndex: number }
  | { type: 'removeRepoButton'; tableIndex: number; buttonIndex: number }
  | { type: 'setPrListField'; index: number; field: 'repo' | 'url'; value: string }
  | { type: 'addPrListItem' }
  | { type: 'removePrListItem'; index: number }
  | { type: 'reset'; payload: ReportState }

export function reportReducer(state: ReportState, action: ReportAction): ReportState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch }
    case 'setTitle':
      return { ...state, title: action.value }
    case 'setHeaderStatus':
      return { ...state, headerStatus: action.value, meta: { ...state.meta, status: action.value } }
    case 'setMetaField':
      return { ...state, meta: { ...state.meta, [action.field]: action.value } }
    case 'setHeaderCellField':
      return {
        ...state,
        headerCells: state.headerCells.map((cell, index) =>
          index === action.index ? { ...cell, [action.field]: action.value } : cell,
        ),
      }
    case 'addHeaderCell':
      return {
        ...state,
        headerCells: [...state.headerCells, createHeaderCell('', '')],
      }
    case 'removeHeaderCell':
      return {
        ...state,
        headerCells: state.headerCells.filter((_, index) => index !== action.index),
      }
    case 'reorderHeaderCells': {
      const cells = [...state.headerCells]
      const [moved] = cells.splice(action.from, 1)
      cells.splice(action.to, 0, moved)
      return { ...state, headerCells: cells }
    }
    case 'setUiField':
      return { ...state, ui: { ...state.ui, [action.field]: action.value } }
    case 'setFooterField':
      return { ...state, footer: { ...state.footer, [action.field]: action.value } }
    case 'setActionsField':
      return { ...state, actions: { ...state.actions, [action.field]: action.value } }
    case 'setSectionToggle':
      return { ...state, sec: { ...state.sec, [action.field]: action.value } }
    case 'setSummaryTitle':
      return { ...state, summaryTitle: action.value }
    case 'setSummaryCardField':
      return {
        ...state,
        summaryCards: state.summaryCards.map((card, index) =>
          index === action.index ? { ...card, [action.field]: action.value } : card,
        ),
      }
    case 'addSummaryCard':
      return {
        ...state,
        summaryCards: [...state.summaryCards, createSummaryCard('0', 'Новая карточка')],
      }
    case 'removeSummaryCard':
      return {
        ...state,
        summaryCards: state.summaryCards.filter((_, index) => index !== action.index),
      }
    case 'setAlertBadgeText':
      return {
        ...state,
        alert: {
          ...state.alert,
          badges: state.alert.badges.map((badge, index) =>
            index === action.index ? { ...badge, text: action.value } : badge,
          ),
        },
      }
    case 'setAlertBadgeColor':
      return {
        ...state,
        alert: {
          ...state.alert,
          badges: state.alert.badges.map((badge, index) =>
            index === action.index ? { ...badge, color: action.value } : badge,
          ),
        },
      }
    case 'addAlertBadge':
      return {
        ...state,
        alert: {
          ...state.alert,
          badges: [...state.alert.badges, createAlertBadge('', 'green')],
        },
      }
    case 'removeAlertBadge':
      return {
        ...state,
        alert: {
          ...state.alert,
          badges: state.alert.badges.filter((_, index) => index !== action.index),
        },
      }
    case 'setParamTableTitle':
      return {
        ...state,
        params: state.params.map((table, index) => (index === action.index ? { ...table, title: action.value } : table)),
      }
    case 'setParamColumnTitle':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                columns: table.columns.map((column, columnIndex) =>
                  columnIndex === action.columnIndex ? { ...column, title: action.value } : column,
                ),
              },
        ),
      }
    case 'addParamColumn':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                columns: [...table.columns, { id: `param-col-${table.columns.length + 1}`, title: `Столбец ${table.columns.length + 1}` }],
                rows: table.rows.map((row) => ({
                  ...row,
                  cells: [...row.cells, ''],
                })),
              },
        ),
      }
    case 'removeParamColumn':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex || table.columns.length <= 1
            ? table
            : {
                ...table,
                columns: table.columns.filter((_, columnIndex) => columnIndex !== action.columnIndex),
                rows: table.rows.map((row) => ({
                  ...row,
                  cells: row.cells.filter((_, cellIndex) => cellIndex !== action.columnIndex),
                })),
              },
        ),
      }
    case 'setParamCell':
      return {
        ...state,
        params: state.params.map((table, tableIndex) =>
          tableIndex !== action.tableIndex
            ? table
            : {
                ...table,
                rows: table.rows.map((row, rowIndex) =>
                  rowIndex !== action.rowIndex
                    ? row
                    : {
                        ...row,
                        cells: row.cells.map((cell, cellIndex) => (cellIndex === action.cellIndex ? action.value : cell)),
                      },
                ),
              },
        ),
      }
    case 'addParamRow':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                rows: [...table.rows, createParamRow(Array.from({ length: table.columns.length }, () => ''))],
              },
        ),
      }
    case 'removeParamRow':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                rows: table.rows.length > 1 ? table.rows.filter((_, rowIndex) => rowIndex !== action.rowIndex) : table.rows,
              },
        ),
      }
    case 'addParamTable':
      return {
        ...state,
        params: [...state.params, createDefaultParamTable()],
      }
    case 'removeParamTable':
      return {
        ...state,
        params: state.params.filter((_, index) => index !== action.tableIndex),
      }
    case 'setParamButtonField':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                buttons: table.buttons.map((button, buttonIndex) =>
                  buttonIndex === action.buttonIndex ? { ...button, [action.field]: action.value } : button,
                ),
              },
        ),
      }
    case 'addParamButton':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex
            ? table
            : { ...table, buttons: [...table.buttons, createSectionButton(`Кнопка ${table.buttons.length + 1}`)] },
        ),
      }
    case 'removeParamButton':
      return {
        ...state,
        params: state.params.map((table, index) =>
          index !== action.tableIndex
            ? table
            : { ...table, buttons: table.buttons.filter((_, buttonIndex) => buttonIndex !== action.buttonIndex) },
        ),
      }
    case 'setRepoTableTitle':
      return {
        ...state,
        repos: state.repos.map((table, index) => (index === action.index ? { ...table, title: action.value } : table)),
      }
    case 'setRepoInfoBadgeEnabled':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex ? table : { ...table, infoBadgeEnabled: action.value },
        ),
      }
    case 'setRepoInfoBadgeText':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex ? table : { ...table, infoBadgeText: action.value },
        ),
      }
    case 'setRepoColumnTitle':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                columns: table.columns.map((column, columnIndex) =>
                  columnIndex === action.columnIndex ? { ...column, title: action.value } : column,
                ),
              },
        ),
      }
    case 'addRepoColumn':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                columns: [...table.columns, { id: `repo-col-${table.columns.length + 1}`, title: `Столбец ${table.columns.length + 1}` }],
                rows: table.rows.map((row) => ({
                  ...row,
                  cells: [...row.cells, createRepoCell('', false, 'green')],
                })),
              },
        ),
      }
    case 'removeRepoColumn':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex || table.columns.length <= 1
            ? table
            : {
                ...table,
                columns: table.columns.filter((_, columnIndex) => columnIndex !== action.columnIndex),
                rows: table.rows.map((row) => ({
                  ...row,
                  cells: row.cells.filter((_, cellIndex) => cellIndex !== action.columnIndex),
                })),
              },
        ),
      }
    case 'setRepoCell':
      return {
        ...state,
        repos: state.repos.map((table, tableIndex) =>
          tableIndex !== action.tableIndex
            ? table
            : {
                ...table,
                rows: table.rows.map((row, rowIndex) =>
                  rowIndex !== action.rowIndex
                    ? row
                    : {
                        ...row,
                        cells: row.cells.map((cell, cellIndex) =>
                          cellIndex === action.cellIndex ? { ...cell, value: action.value } : cell,
                        ),
                      },
                ),
              },
        ),
      }
    case 'setRepoCellBadge':
      return {
        ...state,
        repos: state.repos.map((table, tableIndex) =>
          tableIndex !== action.tableIndex
            ? table
            : {
                ...table,
                rows: table.rows.map((row, rowIndex) =>
                  rowIndex !== action.rowIndex
                    ? row
                    : {
                        ...row,
                        cells: row.cells.map((cell, cellIndex) =>
                          cellIndex === 1 ? { ...cell, isBadge: action.checked } : cell,
                        ),
                      },
                ),
              },
        ),
      }
    case 'setRepoBadgeColor':
      return {
        ...state,
        repos: state.repos.map((table, tableIndex) =>
          tableIndex !== action.tableIndex
            ? table
            : {
                ...table,
                rows: table.rows.map((row, rowIndex) =>
                  rowIndex !== action.rowIndex
                    ? row
                    : {
                        ...row,
                        cells: row.cells.map((cell, cellIndex) =>
                          cellIndex === 1 ? { ...cell, badgeColor: action.value } : cell,
                        ),
                      },
                ),
              },
        ),
      }
    case 'addRepoRow':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                rows: [
                  ...table.rows,
                  createRepoRow(Array.from({ length: table.columns.length }, (_, columnIndex) => createRepoCell('', columnIndex === 1, 'green'))),
                ],
            },
        ),
      }
    case 'removeRepoRow':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                rows: table.rows.length > 1 ? table.rows.filter((_, rowIndex) => rowIndex !== action.rowIndex) : table.rows,
              },
        ),
      }
    case 'addRepoTable':
      return {
        ...state,
        repos: [...state.repos, createDefaultRepoTable()],
      }
    case 'removeRepoTable':
      return {
        ...state,
        repos: state.repos.filter((_, index) => index !== action.tableIndex),
      }
    case 'setRepoButtonField':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex
            ? table
            : {
                ...table,
                buttons: table.buttons.map((button, buttonIndex) =>
                  buttonIndex === action.buttonIndex ? { ...button, [action.field]: action.value } : button,
                ),
              },
        ),
      }
    case 'addRepoButton':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex
            ? table
            : { ...table, buttons: [...table.buttons, createSectionButton(`Кнопка ${table.buttons.length + 1}`)] },
        ),
      }
    case 'removeRepoButton':
      return {
        ...state,
        repos: state.repos.map((table, index) =>
          index !== action.tableIndex
            ? table
            : { ...table, buttons: table.buttons.filter((_, buttonIndex) => buttonIndex !== action.buttonIndex) },
        ),
      }
    case 'setPrListField':
      return {
        ...state,
        prList: state.prList.map((item, index) => (index === action.index ? { ...item, [action.field]: action.value } : item)),
      }
    case 'addPrListItem':
      return {
        ...state,
        prList: [...state.prList, createPrListItem('', '')],
      }
    case 'removePrListItem':
      return {
        ...state,
        prList: state.prList.filter((_, index) => index !== action.index),
      }
    case 'reset':
      return action.payload
    default:
      return state
  }
}
