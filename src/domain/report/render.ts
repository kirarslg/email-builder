import { escapeHtml, safeUrl } from '../shared/html'
import type { AlertBadge, ReportState, RepoBadgeColor } from './types'

const REPORT_WIDTH = 632
const CONTENT_WIDTH = 600
const FONT_STACK = "'SB Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"

type Rgb = { r: number; g: number; b: number }

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function px(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback
}

function hexToRgb(hex: string): Rgb | null {
  const raw = hex.replace('#', '').trim()
  if (raw.length !== 6) return null
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  if ([r, g, b].some((channel) => !Number.isFinite(channel))) return null
  return { r, g, b }
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0')).join('')}`
}

function parseCssColor(value: unknown): { rgb: Rgb; alpha: number } | null {
  const raw = String(value || '').trim()
  if (!raw || /^transparent$/i.test(raw)) return null

  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    const value = hex[1]
    const full =
      value.length === 3
        ? `${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`
        : value.slice(0, 6)
    const rgb = hexToRgb(`#${full}`)
    if (!rgb) return null
    const alpha = value.length === 8 ? clamp(Number.parseInt(value.slice(6, 8), 16) / 255, 0, 1) : 1
    return { rgb, alpha }
  }

  const rgb = raw.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    const channels = rgb[1].split(',').map((part) => part.trim())
    if (channels.length >= 3) {
      const r = Number(channels[0])
      const g = Number(channels[1])
      const b = Number(channels[2])
      const alpha = channels.length >= 4 ? Number(channels[3]) : 1
      if ([r, g, b, alpha].every(Number.isFinite)) {
        return {
          rgb: { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) },
          alpha: clamp(alpha, 0, 1),
        }
      }
    }
  }

  return null
}

function normalizeColor(value: unknown, fallback = '#ffffff'): string {
  const parsed = parseCssColor(value)
  if (!parsed) return fallback
  return rgbToHex(parsed.rgb)
}

function normalizeBgColor(value: unknown, fallback = '#ffffff', base = '#ffffff'): string {
  const parsed = parseCssColor(value)
  if (!parsed) return fallback
  if (parsed.alpha >= 1) return rgbToHex(parsed.rgb)

  const baseRgb = hexToRgb(normalizeColor(base, '#ffffff')) || { r: 255, g: 255, b: 255 }
  return rgbToHex({
    r: parsed.rgb.r * parsed.alpha + baseRgb.r * (1 - parsed.alpha),
    g: parsed.rgb.g * parsed.alpha + baseRgb.g * (1 - parsed.alpha),
    b: parsed.rgb.b * parsed.alpha + baseRgb.b * (1 - parsed.alpha),
  })
}

function borderColor(value: unknown): string {
  return normalizeColor(value, '#e5eaf0')
}

function badgeTheme(color: RepoBadgeColor, state: ReportState) {
  switch (color) {
    case 'green':
      return { bg: normalizeBgColor(state.ui.chipOkBg, '#e9f8ef'), text: normalizeColor(state.ui.chipOkText, '#3dc466') }
    case 'yellow':
      return { bg: normalizeBgColor(state.ui.chipWarnBg, '#fff3df'), text: normalizeColor(state.ui.chipWarnText, '#ff9f2d') }
    case 'red':
      return { bg: normalizeBgColor(state.ui.badgeBg, '#fff0f0'), text: normalizeColor(state.ui.badgeText, '#c94d4d') }
    case 'blue':
    default:
      return { bg: '#EEF3FF', text: '#4770C9' }
  }
}

function renderBadge(badge: AlertBadge, state: ReportState): string {
  const theme = badgeTheme(badge.color, state)
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td bgcolor="${theme.bg}" style="background-color:${theme.bg}; padding:5px 10px; font-family:${FONT_STACK}; font-size:12px; line-height:14px; color:${theme.text}; white-space:nowrap; border-radius:12px;">${escapeHtml(badge.text)}</td></tr></table>`
}

interface RenderButton {
  text: string
  url: string
  textColor: string
  bgColor: string
  align?: 'left' | 'center' | 'right'
  size?: 's' | 'm'
  width?: number
  radius?: number
  colorMode?: 'solid' | 'gradient'
}

function renderSectionButtons(buttons: RenderButton[]): string {
  if (!buttons.length) return ''
  const align = buttons[0].align || 'left'
  const cells = buttons
    .map((button) => {
      const safeButtonUrl = safeUrl(button.url) || '#'
      const height = button.size === 's' ? 32 : 36
      const fontSize = button.size === 's' ? 12 : 13
      const radius = typeof button.radius === 'number' ? button.radius : 10
      const width = button.width && button.width > 0 ? Math.round(button.width) : undefined
      const bg = normalizeBgColor(button.bgColor, '#111111')
      const color = normalizeColor(button.textColor, '#ffffff')
      const widthAttr = width ? ` width="${width}"` : ''
      const widthStyle = width ? ` width:${width}px;` : ''
      return `<td${widthAttr} bgcolor="${bg}" style="background-color:${bg}; border-radius:${radius}px; padding:0 14px; height:${height}px; font-family:${FONT_STACK}; font-size:${fontSize}px; line-height:${height}px; text-align:center;"><a href="${escapeHtml(safeButtonUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;${widthStyle} color:${color} !important; text-decoration:none !important; font-weight:600; font-family:${FONT_STACK}; line-height:${height}px;">${escapeHtml(button.text)}</a></td>`
    })
    .join('<td width="8" style="width:8px; font-size:0; line-height:0;">&nbsp;</td>')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; border-collapse:collapse;"><tr><td align="${escapeHtml(align)}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${cells}</tr></table></td></tr></table>`
}

function getGlobalActionButtons(state: ReportState): RenderButton[] {
  if (!state.actions.show) return []
  return [
    state.actions.btn1Text
      ? {
          text: state.actions.btn1Text,
          url: state.actions.btn1Href,
          textColor: state.ui.buttonText,
          bgColor: state.ui.buttonBg,
        }
      : null,
    state.actions.btn2Text
      ? {
          text: state.actions.btn2Text,
          url: state.actions.btn2Href,
          textColor: state.ui.buttonText,
          bgColor: state.ui.buttonBg,
        }
      : null,
  ].filter(Boolean) as RenderButton[]
}

function renderBox(inner: string, options: { bg: string; border: string; padding?: number; marginTop?: number }): string {
  const padding = options.padding ?? 16
  const marginTop = options.marginTop ?? 16
  const bg = normalizeBgColor(options.bg, '#ffffff')
  const border = borderColor(options.border)

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
    <tr><td height="${marginTop}" style="height:${marginTop}px; font-size:0; line-height:${marginTop}px;">&nbsp;</td></tr>
    <tr><td bgcolor="${bg}" style="background-color:${bg}; border:1px solid ${border}; border-radius:14px; padding:${padding}px; font-family:${FONT_STACK}; mso-padding-alt:${padding}px ${padding}px ${padding}px ${padding}px;">${inner}</td></tr>
  </table>`
}

function renderTitle(text: string, color: string, size = 16): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${FONT_STACK}; font-size:${size}px; line-height:${size + 4}px; font-weight:600; color:${normalizeColor(color, '#111111')};">${escapeHtml(text)}</td></tr></table>`
}

export function buildReportHtmlPreview(state: ReportState): string {
  const bodyPadTop = px(state.ui.bodyPadTop, 0)
  const bodyPadRight = px(state.ui.bodyPadRight, 16)
  const bodyPadBottom = px(state.ui.bodyPadBottom, 0)
  const bodyPadLeft = px(state.ui.bodyPadLeft, 16)
  const bodyBg = normalizeBgColor(state.ui.bodyBg, '#ffffff')
  const bodyContentBg = normalizeBgColor(state.ui.bodyContentBg, '#ffffff', bodyBg)
  const textPrimary = normalizeColor(state.ui.textPrimary, '#111111')
  const textSecondary = normalizeColor(state.ui.textSecondary, '#66727f')

  const paramsBlock = state.sec.params
    ? state.params
        .map((table, tableIndex) => {
          const pairs = table.rows
          const useTwoCols = pairs.length >= 2
          const half = Math.ceil(pairs.length / 2)
          const rowCount = useTwoCols ? half : pairs.length
          let rows = ''

          for (let i = 0; i < rowCount; i++) {
            const left = pairs[i]
            const right = useTwoCols ? pairs[half + i] : undefined
            const last = i === rowCount - 1
            const bottom = last ? '' : `border-bottom:1px solid ${borderColor(state.ui.vtBorder)};`
            rows += `<tr>
              <td width="25%" style="padding:11px 4px 11px 0; ${bottom} font-family:${FONT_STACK}; color:${normalizeColor(state.ui.vtHeadText, '#7c8794')}; font-size:10px; line-height:16px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; white-space:nowrap;">${escapeHtml(left?.cells[0] || '')}</td>
              <td width="25%" align="right" style="padding:11px 0; ${bottom} font-family:${FONT_STACK}; color:${normalizeColor(state.ui.tableBodyText, '#111111')}; font-size:13px; line-height:18px;">${escapeHtml(left?.cells[1] || '')}</td>
              ${useTwoCols ? `<td width="40" style="width:40px; font-size:0; line-height:0;">&nbsp;</td>
              <td width="25%" style="padding:11px 4px 11px 0; ${bottom} font-family:${FONT_STACK}; color:${normalizeColor(state.ui.vtHeadText, '#7c8794')}; font-size:10px; line-height:16px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; white-space:nowrap;">${escapeHtml(right?.cells[0] || '')}</td>
              <td width="25%" align="right" style="padding:11px 0; ${bottom} font-family:${FONT_STACK}; color:${normalizeColor(state.ui.tableBodyText, '#111111')}; font-size:13px; line-height:18px;">${escapeHtml(right?.cells[1] || '')}</td>` : ''}
            </tr>`
          }

          const tableRows = rows
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; border-collapse:collapse;">${rows}</table>`
            : ''

          return renderBox(
            `${renderTitle(table.title, state.ui.tableBodyText)}${tableRows}${renderSectionButtons(table.buttons?.length ? table.buttons : tableIndex === 0 ? getGlobalActionButtons(state) : [])}`,
            { bg: state.ui.tableBlockBg, border: state.ui.tableBlockBorder, padding: 16 },
          )
        })
        .join('')
    : ''

  const reposBlock = state.sec.repos
    ? state.repos
        .map((table) => {
          const infoText = table.infoBadgeEnabled && table.infoBadgeText
            ? table.infoBadgeText.replace(/\{\{\s*count\s*\}\}/gi, String(table.rows.length))
            : ''

          const header = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${FONT_STACK}; font-size:16px; line-height:20px; font-weight:600; color:${normalizeColor(state.ui.repoText, '#111111')};">${escapeHtml(table.title)}</td>${infoText ? `<td align="right" style="font-family:${FONT_STACK}; font-size:13px; line-height:18px; color:${textSecondary};">${escapeHtml(infoText)}</td>` : ''}</tr></table>`

          const repoBorder = borderColor(state.ui.repoBorder)
          const columnCount = Math.max(1, table.columns.length)
          const headBg = normalizeBgColor(state.ui.repoHeadBg, '#f3f6f8')
          const headCells = table.columns
            .map((column, colIdx) => {
              const lastCol = colIdx === table.columns.length - 1
              return `<td bgcolor="${headBg}" style="padding:10px 12px; background-color:${headBg}; color:${normalizeColor(state.ui.repoHeadText, '#6b7683')}; font-family:${FONT_STACK}; font-size:12px; line-height:16px; font-weight:600; border-bottom:1px solid ${repoBorder};${lastCol ? '' : ` border-right:1px solid ${repoBorder};`}">${escapeHtml(column.title)}</td>`
            })
            .join('')
          const bodyRows = table.rows
            .map((row, rowIdx) => {
              const lastRow = rowIdx === table.rows.length - 1
              return `<tr>${row.cells
                .map((cell, colIdx) => {
                  const lastCol = colIdx === table.columns.length - 1
                  const content = cell.isBadge && cell.value
                    ? renderBadge({ id: 'repo-badge', text: cell.value, color: cell.badgeColor }, state)
                    : escapeHtml(cell.value)
                  return `<td style="padding:10px 12px; color:${normalizeColor(state.ui.repoText, '#111111')}; font-family:${FONT_STACK}; font-size:13px; line-height:18px;${lastRow ? '' : ` border-bottom:1px solid ${repoBorder};`}${lastCol ? '' : ` border-right:1px solid ${repoBorder};`}">${content}</td>`
                })
                .join('')}</tr>`
            })
            .join('')
          const repoTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; border-collapse:collapse; border:1px solid ${repoBorder}; table-layout:fixed;"><tr>${headCells}</tr>${bodyRows || `<tr><td colspan="${columnCount}" style="padding:10px 12px; color:${textSecondary}; font-family:${FONT_STACK}; font-size:13px; line-height:18px;">&nbsp;</td></tr>`}</table>`

          return renderBox(`${header}${repoTable}${renderSectionButtons(table.buttons || [])}`, {
            bg: state.ui.repoBlockBg,
            border: state.ui.repoBlockBorder,
            padding: 16,
          })
        })
        .join('')
    : ''

  const prListBlock =
    state.sec.prList && state.prList.length
      ? renderBox(
          `${renderTitle('Список', state.ui.textPrimary)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; border-collapse:collapse;">${state.prList
            .map(
              (item) => `<tr><td style="padding:0 0 8px 0; font-family:${FONT_STACK}; font-size:13px; line-height:18px; color:${textPrimary};">• ${escapeHtml(item.repo ? `${item.repo}: ` : '')}${escapeHtml(item.url)}</td></tr>`,
            )
            .join('')}</table>`,
          { bg: state.ui.surfaceBg, border: state.ui.tableBorder, padding: 18 },
        )
      : ''

  const summaryCards = state.summaryCards
    .map((card, idx) => {
      const isLeft = idx % 2 === 0
      const isRight = idx % 2 === 1
      const spacer = isLeft ? '<td width="12" style="width:12px; font-size:0; line-height:0;">&nbsp;</td>' : ''
      const cardBg = normalizeBgColor(state.ui.cardBg, '#ffffff')
      const cell = `<td width="294" bgcolor="${cardBg}" style="width:294px; padding:16px; border:1px solid ${borderColor(state.ui.tableBorder)}; background-color:${cardBg}; border-radius:12px; font-family:${FONT_STACK};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${FONT_STACK}; font-size:28px; line-height:31px; font-weight:600; color:${normalizeColor(state.ui.statAccent, '#111111')};">${escapeHtml(card.value)}</td></tr><tr><td style="padding-top:8px; font-family:${FONT_STACK}; font-size:12px; line-height:17px; color:${normalizeColor(state.ui.statLabelColor, '#66727f')};">${escapeHtml(card.label)}</td></tr></table>
      </td>`
      return isRight ? `${cell}</tr>` : `<tr>${cell}${spacer}`
    })
    .join('') + (state.summaryCards.length % 2 === 1 ? '<td width="294" style="width:294px;">&nbsp;</td></tr>' : '')

  const headerCells = state.headerCellsVisible
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; border-collapse:collapse;"><tr>${state.headerCells
        .map(
          (cell) => `<td style="padding:0 16px 0 0; font-family:${FONT_STACK};"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${FONT_STACK}; font-size:11px; line-height:14px; color:${normalizeColor(state.ui.heroCellLabelColor, '#7c8794')}; text-transform:uppercase;">${escapeHtml(cell.label)}</td></tr><tr><td style="padding-top:2px; font-family:${FONT_STACK}; font-size:13px; line-height:16px; color:${normalizeColor(state.ui.heroCellValueColor, '#111111')};">${escapeHtml(cell.value)}</td></tr></table></td>`,
        )
        .join('')}</tr></table>`
    : ''

  const logoBlock = state.ui.logoImage
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-bottom:12px;"><img src="${escapeHtml(state.ui.logoImage)}" alt="Логотип" height="20" style="display:block; height:20px; width:auto; border:0; outline:none; text-decoration:none;"></td></tr></table>`
    : ''

  const badgesRow = state.alertBadgesVisible && state.alert.badges.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; border-collapse:collapse;"><tr>${state.alert.badges
        .map((badge) => `<td style="padding:0 8px 8px 0;">${renderBadge(badge, state)}</td>`)
        .join('')}</tr></table>`
    : ''

  const alertBlock = state.sec.alert
    ? renderBox(
        `${renderTitle(state.alert.title || 'Блок алертов', state.ui.alertTitle)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:8px; font-family:${FONT_STACK}; font-size:13px; line-height:18px; color:${normalizeColor(state.ui.alertText, '#111111')};">${escapeHtml(state.alert.text || 'Описание алерта появится здесь.')}</td></tr></table>${badgesRow}`,
        { bg: state.ui.alertBg, border: state.ui.alertBorder, padding: 16 },
      )
    : ''

  const summaryAlertBlock = state.sec.alert && state.alertInsideSummary ? alertBlock : ''
  const standaloneAlertBlock = state.sec.alert && !state.alertInsideSummary ? alertBlock : ''

  const summaryBlock = state.sec.summary
    ? renderBox(
        `${renderTitle(state.summaryTitle, state.ui.textPrimary, 18)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px; border-collapse:separate;">${summaryCards}</table>${summaryAlertBlock}`,
        { bg: state.ui.surfaceBg, border: state.ui.tableBorder, padding: 18 },
      )
    : ''

  const heroBg = normalizeBgColor(state.ui.heroBg, '#ecf2f3')
  const heroBackgroundStyle = state.ui.heroBgImage
    ? `background-color:${heroBg}; background-image:url('${escapeHtml(state.ui.heroBgImage)}'); background-position:center; background-size:cover; background-repeat:no-repeat;`
    : `background-color:${heroBg};`
  const statusBg = normalizeBgColor(state.ui.statusBg, '#e9f8ef', heroBg)
  const statusBlock = state.headerStatusVisible
    ? `<td width="120" align="right" valign="top" style="width:120px; font-family:${FONT_STACK};"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr><td bgcolor="${statusBg}" style="background-color:${statusBg}; padding:5px 10px; border-radius:12px; font-family:${FONT_STACK}; font-size:12px; line-height:14px; color:${normalizeColor(state.ui.statusText, '#3dc466')}; white-space:nowrap;">${escapeHtml(state.headerStatus)}</td></tr></table></td>`
    : ''

  const headerContent = `${logoBlock}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="top" style="font-family:${FONT_STACK}; font-size:28px; line-height:31px; font-weight:600; color:${normalizeColor(state.ui.heroTitleColor, '#111111')};">${escapeHtml(state.title)}</td>${statusBlock}</tr></table>
    ${headerCells}`

  const headerBlock = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td bgcolor="${heroBg}"${state.ui.heroBgImage ? ` background="${escapeHtml(state.ui.heroBgImage)}"` : ''} style="${heroBackgroundStyle} border:1px solid ${borderColor(state.ui.heroBorder)}; border-radius:18px; padding:24px; font-family:${FONT_STACK};">
      ${headerContent}
    </td></tr></table>`

  const footerBg = normalizeBgColor(state.footer.bg, '#f3f6f8')
  const footerBlock = state.sec.footerText
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td height="16" style="height:16px; font-size:0; line-height:16px;">&nbsp;</td></tr><tr><td align="${escapeHtml(state.footer.align)}" bgcolor="${footerBg}" style="background-color:${footerBg}; border-radius:14px; padding:16px; font-family:${FONT_STACK};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${escapeHtml(state.footer.align)}" style="font-family:${FONT_STACK}; font-size:14px; line-height:18px; font-weight:600; color:${textPrimary};">${escapeHtml(state.footer.text)}</td></tr>${state.footer.subtitle ? `<tr><td align="${escapeHtml(state.footer.align)}" style="padding-top:4px; font-family:${FONT_STACK}; font-size:13px; line-height:18px; color:${textPrimary};">${escapeHtml(state.footer.subtitle)}</td></tr>` : ''}${state.footer.sub ? `<tr><td align="${escapeHtml(state.footer.align)}" style="padding-top:6px; font-family:${FONT_STACK}; font-size:12px; line-height:16px; color:${textSecondary};">${escapeHtml(state.footer.sub)}</td></tr>` : ''}</table></td></tr></table>`
    : ''

  const reportHeadCss = `
    html, body { margin:0 !important; padding:0 !important; width:100% !important; }
    table, td { border-collapse:collapse; mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
    img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    body, table, td, p, span, a { font-family:${FONT_STACK} !important; }
  `

  return `<!doctype html>
<html lang="ru" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <title>${escapeHtml(state.title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    ${reportHeadCss}
  </style>
</head>
<body style="margin:0; padding:0; background-color:${bodyBg}; font-family:${FONT_STACK}; color:${textPrimary};">
  <center style="width:100%; background-color:${bodyBg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bodyBg}" style="width:100%; background-color:${bodyBg}; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" width="${REPORT_WIDTH}" cellpadding="0" cellspacing="0" border="0" bgcolor="${bodyContentBg}" style="width:${REPORT_WIDTH}px; background-color:${bodyContentBg}; border-collapse:collapse;">
            <tr>
              <td width="${CONTENT_WIDTH}" style="width:${CONTENT_WIDTH}px; padding:${bodyPadTop}px ${bodyPadRight}px ${bodyPadBottom}px ${bodyPadLeft}px; font-family:${FONT_STACK}; text-align:left;">
                ${headerBlock}
                ${summaryBlock}
                ${standaloneAlertBlock}
                ${paramsBlock}
                ${reposBlock}
                ${prListBlock}
                ${footerBlock}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`
}
