import type { EmailFormData } from './types'
import { createUid } from '../shared/id'
import type { BuilderBlock, BuilderBlockType } from './types'
import { createBuilderRow } from './defaults'

export type EmailFormAction =
  | { type: 'patch'; patch: Partial<EmailFormData> }
  | { type: 'setText'; field: keyof EmailFormData; value: string }
  | { type: 'setBoolean'; field: keyof EmailFormData; value: boolean }
  | { type: 'setNumber'; field: keyof EmailFormData; value: number | null }
  | { type: 'setEmailViewMode'; value: EmailFormData['emailViewMode'] }
  | { type: 'addBuilderRow'; layout: number }
  | { type: 'removeBuilderRow'; rowId: string }
  | { type: 'setBuilderActiveColumn'; columnId: string }
  | { type: 'setBuilderSelectedBlock'; blockId: string | null }
  | { type: 'addBuilderBlock'; blockType: BuilderBlockType }
  | { type: 'dropBlockIntoColumn'; blockType: BuilderBlockType; columnId: string }
  | { type: 'setBuilderBlockText'; blockId: string; value: string }
  | { type: 'setBuilderBlockUrl'; blockId: string; value: string }
  | { type: 'setBuilderSpacerSize'; blockId: string; value: number }
  | { type: 'setBuilderImageUrl'; blockId: string; value: string }
  | { type: 'clearBuilderBlock'; blockId: string }
  | { type: 'moveBuilderBlock'; blockId: string; direction: 'up' | 'down' }
  | { type: 'moveBuilderBlockToColumn'; blockId: string; targetColumnId: string }
  | { type: 'moveBuilderBlockToPosition'; blockId: string; targetColumnId: string; targetIndex: number }
  | { type: 'removeBuilderBlock'; blockId: string }
  | { type: 'setBuilderHeaderImageUrl'; value: string }
  | { type: 'reset'; payload: EmailFormData }

function createBuilderBlock(type: BuilderBlockType): BuilderBlock | null {
  switch (type) {
    case 'header':
      return { id: createUid('hdr'), type: 'header' }
    case 'greeting':
      return { id: createUid('gr'), type: 'greeting', text: 'Здравствуйте!' }
    case 'heading':
      return { id: createUid('h'), type: 'heading', text: 'Текст заголовка' }
    case 'text':
      return { id: createUid('p'), type: 'text', text: 'Основной текст письма' }
    case 'button':
      return { id: createUid('btn'), type: 'button', text: 'Кнопка', url: '' }
    case 'divider':
      return { id: createUid('div'), type: 'divider' }
    case 'spacer':
      return { id: createUid('sp'), type: 'spacer', size: 16 }
    case 'image':
      return { id: createUid('img'), type: 'image', src: '', name: '' }
    default:
      return null
  }
}

function updateBuilderBlocks(
  state: EmailFormData,
  updater: (block: BuilderBlock) => BuilderBlock | null,
): EmailFormData['builderRows'] {
  return state.builderRows.map((row) => ({
    ...row,
    columns: row.columns.map((column) => ({
      ...column,
      blocks: column.blocks
        .map((block) => updater(block))
        .filter((block): block is BuilderBlock => Boolean(block)),
    })),
  }))
}

function hasBuilderHeader(state: EmailFormData): boolean {
  return state.builderRows.some((row) => row.columns.some((column) => column.blocks.some((block) => block.type === 'header')))
}

function getFirstColumnId(rows: EmailFormData['builderRows']): string | null {
  for (const row of rows) {
    for (const column of row.columns) {
      if (column.id) return column.id
    }
  }
  return null
}

function builderBlockExists(rows: EmailFormData['builderRows'], blockId: string | null): boolean {
  if (!blockId) return false
  return rows.some((row) => row.columns.some((column) => column.blocks.some((block) => block.id === blockId)))
}

function getBuilderInsertIndex(column: EmailFormData['builderRows'][number]['columns'][number], blockType: BuilderBlockType): number | null {
  if (blockType === 'heading') {
    const introIndex = column.blocks.findIndex((block) => block.type === 'text')
    if (introIndex >= 0) return introIndex
  }

  return null
}

export function emailFormReducer(state: EmailFormData, action: EmailFormAction): EmailFormData {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch }
    case 'setText':
      return { ...state, [action.field]: action.value }
    case 'setBoolean':
      return { ...state, [action.field]: action.value }
    case 'setNumber':
      return { ...state, [action.field]: action.value }
    case 'setEmailViewMode':
      return { ...state, emailViewMode: action.value }
    case 'addBuilderRow': {
      const row = createBuilderRow(action.layout)
      return {
        ...state,
        builderRows: [...state.builderRows, row],
        builderActiveColumnId: row.columns[0]?.id || state.builderActiveColumnId,
      }
    }
    case 'removeBuilderRow': {
      const nextRows = state.builderRows.filter((row) => row.id !== action.rowId)
      if (!nextRows.length) return state
      const activeStillExists = nextRows.some((row) => row.columns.some((column) => column.id === state.builderActiveColumnId))
      return {
        ...state,
        builderRows: nextRows,
        builderActiveColumnId: activeStillExists ? state.builderActiveColumnId : getFirstColumnId(nextRows),
        builderSelectedBlockId: builderBlockExists(nextRows, state.builderSelectedBlockId) ? state.builderSelectedBlockId : null,
      }
    }
    case 'setBuilderActiveColumn':
      return { ...state, builderActiveColumnId: action.columnId }
    case 'setBuilderSelectedBlock':
      return { ...state, builderSelectedBlockId: action.blockId }
    case 'addBuilderBlock': {
      if (action.blockType === 'header' && hasBuilderHeader(state)) return state
      const allColumns = state.builderRows.flatMap((r) => r.columns)
      const targetColumn = allColumns.find((c) => c.blocks.length === 0) ?? null
      if (!targetColumn) return state
      const block = createBuilderBlock(action.blockType)
      if (!block) return state
      return {
        ...state,
        builderActiveColumnId: targetColumn.id,
        builderRows: state.builderRows.map((row) => ({
          ...row,
          columns: row.columns.map((column) =>
            column.id !== targetColumn.id ? column : { ...column, blocks: [block] },
          ),
        })),
        builderSelectedBlockId: block.id,
      }
    }
    case 'dropBlockIntoColumn': {
      const targetCol = state.builderRows.flatMap((r) => r.columns).find((c) => c.id === action.columnId)
      if (!targetCol || targetCol.blocks.length > 0) return state
      if (action.blockType === 'header' && hasBuilderHeader(state)) return state
      const block = createBuilderBlock(action.blockType)
      if (!block) return state
      return {
        ...state,
        builderActiveColumnId: action.columnId,
        builderRows: state.builderRows.map((row) => ({
          ...row,
          columns: row.columns.map((column) =>
            column.id !== action.columnId ? column : { ...column, blocks: [block] },
          ),
        })),
        builderSelectedBlockId: block.id,
      }
    }
    case 'setBuilderBlockText':
      return {
        ...state,
        builderRows: updateBuilderBlocks(state, (block) =>
          'text' in block && block.id === action.blockId ? { ...block, text: action.value } : block,
        ),
      }
    case 'setBuilderBlockUrl':
      return {
        ...state,
        builderRows: updateBuilderBlocks(state, (block) =>
          block.type === 'button' && block.id === action.blockId ? { ...block, url: action.value } : block,
        ),
      }
    case 'setBuilderSpacerSize':
      return {
        ...state,
        builderRows: updateBuilderBlocks(state, (block) =>
          block.type === 'spacer' && block.id === action.blockId ? { ...block, size: action.value } : block,
        ),
      }
    case 'setBuilderImageUrl':
      return {
        ...state,
        builderRows: updateBuilderBlocks(state, (block) =>
          block.type === 'image' && block.id === action.blockId ? { ...block, src: action.value, name: action.value ? 'Remote image' : '' } : block,
        ),
      }
    case 'clearBuilderBlock':
      return {
        ...state,
        builderRows: updateBuilderBlocks(state, (block) => {
          if (block.id !== action.blockId || block.type === 'header') return block
          if (block.type === 'button') return { ...block, text: '', url: '' }
          if (block.type === 'image') return { ...block, src: '', name: '' }
          if (block.type === 'spacer') return { ...block, size: 16 }
          if ('text' in block) return { ...block, text: '' }
          return block
        }),
      }
    case 'moveBuilderBlock':
      return {
        ...state,
        builderRows: state.builderRows.map((row) => ({
          ...row,
          columns: row.columns.map((column) => {
            const blockIndex = column.blocks.findIndex((block) => block.id === action.blockId)
            if (blockIndex < 0) return column
            const targetIndex = action.direction === 'up' ? blockIndex - 1 : blockIndex + 1
            if (targetIndex < 0 || targetIndex >= column.blocks.length) return column
            const nextBlocks = column.blocks.slice()
            const [moved] = nextBlocks.splice(blockIndex, 1)
            nextBlocks.splice(targetIndex, 0, moved)
            return { ...column, blocks: nextBlocks }
          }),
        })),
      }
    case 'moveBuilderBlockToColumn': {
      let movingBlock: BuilderBlock | null = null
      const clearedRows = state.builderRows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => {
          const blockIndex = column.blocks.findIndex((block) => block.id === action.blockId)
          if (blockIndex < 0) return column
          const nextBlocks = column.blocks.slice()
          ;[movingBlock] = nextBlocks.splice(blockIndex, 1)
          return { ...column, blocks: nextBlocks }
        }),
      }))

      if (!movingBlock) return state
      const selectedBlockId = (movingBlock as BuilderBlock).id

      return {
        ...state,
        builderRows: clearedRows.map((row) => ({
          ...row,
          columns: row.columns.map((column) =>
            column.id !== action.targetColumnId ? column : { ...column, blocks: [...column.blocks, movingBlock as BuilderBlock] },
          ),
        })),
        builderActiveColumnId: action.targetColumnId,
        builderSelectedBlockId: selectedBlockId,
      }
    }
    case 'moveBuilderBlockToPosition': {
      let movingBlock: BuilderBlock | null = null
      const sourceColumnId = (() => {
        for (const row of state.builderRows) {
          for (const column of row.columns) {
            if (column.blocks.some((block) => block.id === action.blockId)) return column.id
          }
        }
        return null
      })()

      const clearedRows = state.builderRows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => {
          const blockIndex = column.blocks.findIndex((block) => block.id === action.blockId)
          if (blockIndex < 0) return column
          const nextBlocks = column.blocks.slice()
          ;[movingBlock] = nextBlocks.splice(blockIndex, 1)
          return { ...column, blocks: nextBlocks }
        }),
      }))

      if (!movingBlock) return state
      const selectedBlockId = (movingBlock as BuilderBlock).id

      return {
        ...state,
        builderRows: clearedRows.map((row) => ({
          ...row,
          columns: row.columns.map((column) => {
            if (column.id !== action.targetColumnId) return column
            const nextBlocks = column.blocks.slice()
            const boundedIndex = Math.max(
              0,
              Math.min(
                action.targetIndex + (sourceColumnId === action.targetColumnId ? 0 : 0),
                nextBlocks.length,
              ),
            )
            nextBlocks.splice(boundedIndex, 0, movingBlock as BuilderBlock)
            return { ...column, blocks: nextBlocks }
          }),
        })),
        builderActiveColumnId: action.targetColumnId,
        builderSelectedBlockId: selectedBlockId,
      }
    }
    case 'removeBuilderBlock':
      {
        const nextRows = updateBuilderBlocks(state, (block) => (block.id === action.blockId ? null : block))
        return {
          ...state,
          builderRows: nextRows,
          builderSelectedBlockId: state.builderSelectedBlockId === action.blockId ? null : state.builderSelectedBlockId,
        }
      }
    case 'setBuilderHeaderImageUrl':
      return {
        ...state,
        builderHeaderImages: action.value.trim() ? [{ src: action.value.trim(), name: 'Remote header image' }] : [],
      }
    case 'reset':
      return action.payload
    default:
      return state
  }
}
