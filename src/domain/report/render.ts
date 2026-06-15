import { escapeHtml, safeUrl } from '../shared/html'
import type { AlertBadge, ReportState, RepoBadgeColor } from './types'

const REPORT_WIDTH = 632
const CONTENT_WIDTH = 600
const FONT_STACK = "'SB Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function px(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback
}

function normalizeColor(value: unknown, fallback = '#ffffff'): string {
  const raw = String(value || '').trim()
  if (!raw) return fallback
  if (/^transparent$/i.test(raw)) return fallback

  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    const value = hex[1]
    if (value.length === 3) {
      return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`
    }
    return `#${value.slice(0, 6)}`
  }

  const rgb = raw.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    const channels = rgb[1].split(',').map((part) => Number(part.trim()))
    if (channels.length >= 3 && channels.slice(0, 3).every(Number.isFinite)) {
      const [r, g, b] = channels.slice(0, 3).map((channel) => clamp(Math.round(channel), 0, 255))
      return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
    }
  }

  return fallback
}

function borderColor(value: unknown): string {
  return normalizeColor(value, '#e5eaf0')
}

function badgeTheme(color: RepoBadgeColor, state: ReportState) {
  switch (color) {
    case 'green':
      return { bg: normalizeColor(state.ui.chipOkBg, '#e9f8ef'), text: normalizeColor(state.ui.chipOkText, '#3dc466') }
    case 'yellow':
      return { bg: normalizeColor(state.ui.chipWarnBg, '#fff3df'), text: normalizeColor(state.ui.chipWarnText, '#ff9f2d') }
    case 'red':
      return { bg: normalizeColor(state.ui.badgeBg, '#fff0f0'), text: normalizeColor(state.ui.badgeText, '#c94d4d') }
    case 'blue':
    default:
      return { bg: '#EEF3FF', text: '#4770C9' }
  }
}

function renderBadge(badge: AlertBadge, state: ReportState): string {
  const theme = badgeTheme(badge.color, state)
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table; border-collapse:separate;"><tr><td bgcolor="${theme.bg}" style="background:${theme.bg}; padding:5px 10px; font-family:${FONT_STACK}; font-size:12px; line-height:14px; color:${theme.text}; white-space:nowrap; border-radius:12px;">${escapeHtml(badge.text)}</td></tr></table>`
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
      const bg = normalizeColor(button.bgColor, '#111111')
      const color = normalizeColor(button.textColor, '#ffffff')
      const widthAttr = width ? ` width="${width}"` : ''
      const widthStyle = width ? ` width:${width}px;` : ''
      return `<td${widthAttr} bgcolor="${bg}" style="background:${bg}; border-radius:${radius}px; padding:0 14px; height:${height}px; font-family:${FONT_STACK}; font-size:${fontSize}px; line-height:${height}px; text-align:center;"><a href="${escapeHtml(safeButtonUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;${widthStyle} color:${color} !important; text-decoration:none !important; font-weight:600; font-family:${FONT_STACK}; line-height:${height}px;">${escapeHtml(button.text)}</a></td>`
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
  const bg = normalizeColor(options.bg, '#ffffff')
  const border = borderColor(options.border)

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:${marginTop}px; border-collapse:separate;"><tr><td bgcolor="${bg}" style="background:${bg}; border:1px solid ${border}; border-radius:14px; padding:${padding}px; font-family:${FONT_STACK};">${inner}</td></tr></table>`
}

function renderTitle(text: string, color: string, size = 16): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${FONT_STACK}; font-size:${size}px; line-height:${size + 4}px; font-weight:600; color:${normalizeColor(color, '#111111')};">${escapeHtml(text)}</td></tr></table>`
}

export function buildReportHtmlPreview(state: ReportState): string {
  const bodyPadTop = px(state.ui.bodyPadTop, 0)
  const bodyPadRight = px(state.ui.bodyPadRight, 16)
  const bodyPadBottom = px(state.ui.bodyPadBottom, 0)
  const bodyPadLeft = px(state.ui.bodyPadLeft, 16)
  const bodyBg = normalizeColor(state.ui.bodyBg, '#ffffff')
  const bodyContentBg = normalizeColor(state.ui.bodyContentBg, '#ffffff')
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
          const headCells = table.columns
            .map((column, colIdx) => {
              const lastCol = colIdx === table.columns.length - 1
              return `<td bgcolor="${normalizeColor(state.ui.repoHeadBg, '#f3f6f8')}" style="padding:10px 12px; background:${normalizeColor(state.ui.repoHeadBg, '#f3f6f8')}; color:${normalizeColor(state.ui.repoHeadText, '#6b7683')}; font-family:${FONT_STACK}; font-size:12px; line-height:16px; font-weight:600; border-bottom:1px solid ${repoBorder};${lastCol ? '' : ` border-right:1px solid ${repoBorder};`}">${escapeHtml(column.title)}</td>`
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
      const cell = `<td width="294" bgcolor="${normalizeColor(state.ui.cardBg, '#ffffff')}" style="width:294px; padding:16px; border:1px solid ${borderColor(state.ui.tableBorder)}; background:${normalizeColor(state.ui.cardBg, '#ffffff')}; border-radius:12px; font-family:${FONT_STACK};">
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
        .map((badge) => `<td style="padding-right:8px;">${renderBadge(badge, state)}</td>`)
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

  const heroBg = normalizeColor(state.ui.heroBg, '#ecf2f3')
  const heroBackgroundStyle = state.ui.heroBgImage
    ? `background:${heroBg} url('${escapeHtml(state.ui.heroBgImage)}') center/cover no-repeat;`
    : `background:${heroBg};`
  const statusBlock = state.headerStatusVisible
    ? `<td align="right" valign="top" style="font-family:${FONT_STACK};"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${normalizeColor(state.ui.statusBg, '#e9f8ef')}" style="background:${normalizeColor(state.ui.statusBg, '#e9f8ef')}; padding:5px 10px; border-radius:12px; font-family:${FONT_STACK}; font-size:12px; line-height:14px; color:${normalizeColor(state.ui.statusText, '#3dc466')}; white-space:nowrap;">${escapeHtml(state.headerStatus)}</td></tr></table></td>`
    : ''

  const headerBlock = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td bgcolor="${heroBg}" background="${state.ui.heroBgImage ? escapeHtml(state.ui.heroBgImage) : ''}" style="${heroBackgroundStyle} border:1px solid ${borderColor(state.ui.heroBorder)}; border-radius:18px; padding:24px; font-family:${FONT_STACK};">
    ${logoBlock}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${FONT_STACK}; font-size:28px; line-height:31px; font-weight:600; color:${normalizeColor(state.ui.heroTitleColor, '#111111')};">${escapeHtml(state.title)}</td>${statusBlock}</tr></table>
    ${headerCells}
  </td></tr></table>`

  const footerBlock = state.sec.footerText
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; border-collapse:separate;"><tr><td align="${escapeHtml(state.footer.align)}" bgcolor="${normalizeColor(state.footer.bg, '#f3f6f8')}" style="background:${normalizeColor(state.footer.bg, '#f3f6f8')}; border-radius:14px; padding:16px; font-family:${FONT_STACK};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${escapeHtml(state.footer.align)}" style="font-family:${FONT_STACK}; font-size:14px; line-height:18px; font-weight:600; color:${textPrimary};">${escapeHtml(state.footer.text)}</td></tr>${state.footer.subtitle ? `<tr><td align="${escapeHtml(state.footer.align)}" style="padding-top:4px; font-family:${FONT_STACK}; font-size:13px; line-height:18px; color:${textPrimary};">${escapeHtml(state.footer.subtitle)}</td></tr>` : ''}${state.footer.sub ? `<tr><td align="${escapeHtml(state.footer.align)}" style="padding-top:6px; font-family:${FONT_STACK}; font-size:12px; line-height:16px; color:${textSecondary};">${escapeHtml(state.footer.sub)}</td></tr>` : ''}</table></td></tr></table>`
    : ''

  const reportHeadCss = `
    html, body { margin:0 !important; padding:0 !important; width:100% !important; }
    table, td { border-collapse: collapse; mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
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
<body style="margin:0; padding:0; background:${bodyBg}; font-family:${FONT_STACK}; color:${textPrimary};">
  <center style="width:100%; background:${bodyBg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bodyBg}" style="width:100%; background:${bodyBg}; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" width="${REPORT_WIDTH}" cellpadding="0" cellspacing="0" border="0" bgcolor="${bodyContentBg}" style="width:${REPORT_WIDTH}px; background:${bodyContentBg}; border-collapse:collapse;">
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
