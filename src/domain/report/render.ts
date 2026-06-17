import { escapeHtml } from '../shared/html'
import type { AlertBadge, ReportState, RepoBadgeColor } from './types'

// Apple Mail and Outlook.com remap solid near-white/near-black backgrounds in
// dark mode, but leave `background-image` (incl. gradients) untouched. Painting
// the colour as a single-stop "solid gradient" pins it, so report surfaces keep
// their light fills in dark clients. `background-color` stays as the Outlook
// fallback (Outlook ignores background-image on divs but honours the colour).
function lockBg(color: string): string {
  return `background-color:${color}; background-image:linear-gradient(${color}, ${color});`
}

function badgeTheme(color: RepoBadgeColor, state: ReportState) {
  switch (color) {
    case 'green':
      return { bg: state.ui.chipOkBg, text: state.ui.chipOkText }
    case 'yellow':
      return { bg: state.ui.chipWarnBg, text: state.ui.chipWarnText }
    case 'red':
      return { bg: state.ui.badgeBg, text: state.ui.badgeText }
    case 'blue':
    default:
      return { bg: '#EEF3FF', text: '#4770C9' }
  }
}

function renderBadge(badge: AlertBadge, state: ReportState): string {
  const theme = badgeTheme(badge.color, state)
  return `<span style="display:inline-block; padding:0 10px; border-radius:999px; background:${theme.bg}; color:${theme.text}; font-size:12px; line-height:24px; white-space:nowrap; vertical-align:middle;">${escapeHtml(badge.text)}</span>`
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
  // Email clients strip flexbox, so lay buttons out in a single table row.
  // Buttons share the first button's alignment; an 8px gutter sits between them.
  const align = buttons[0].align || 'left'
  const cells = buttons
    .map((button, idx) => {
      const height = button.size === 's' ? 32 : 36
      const fontSize = button.size === 's' ? 12 : 13
      const radius = typeof button.radius === 'number' ? button.radius : 10
      // Padding on the button <td> survives Outlook forwards; height/line-height
      // on the anchor do not, so vertical spacing would otherwise collapse.
      const vpad = Math.max(0, Math.round((height - fontSize) / 2))
      const widthAttr = button.width && button.width > 0 ? ` width="${button.width}" style="width:${button.width}px; ` : ' style="'
      const last = idx === buttons.length - 1
      return `<td valign="top" style="padding:0 ${last ? 0 : 8}px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${button.bgColor}" align="center"${widthAttr}background:${button.bgColor}; border-radius:${radius}px; padding:${vpad}px 14px; mso-padding-alt:${vpad}px 14px; text-align:center;"><a href="${escapeHtml(button.url)}" style="display:inline-block; line-height:${fontSize}px; color:${button.textColor}; font-size:${fontSize}px; text-decoration:none;">${escapeHtml(button.text)}</a></td></tr></table></td>`
    })
    .join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin-top:16px;"><tr>${cells}</tr></table>`
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

export function buildReportHtmlPreview(state: ReportState): string {
  const templateOverlay =
    state.template.show && state.template.data
      ? state.template.kind === 'svg'
        ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(state.template.data)}`
        : state.template.data
      : ''
  const heroBackground = state.ui.heroBgImage
    ? `${state.ui.heroBg} url('${escapeHtml(state.ui.heroBgImage)}') center/cover no-repeat`
    : state.ui.heroBg

  const paramsBlock = state.sec.params
    ? state.params
        .map(
          (table, tableIndex) => `
          <section data-eb-section="params" style="margin-top:16px; padding:16px; border:1px solid ${state.ui.tableBlockBorder}; border-radius:10px; ${lockBg(state.ui.tableBlockBg)}">
            <div style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.tableBodyText};">${escapeHtml(table.title)}</div>
            ${(() => {
              // Vertical table = list of [label, value] pairs.
              // Pairs are split into TWO side-by-side columns. A single table
              // with 4 data columns (+ a spacer) keeps facing rows the same height.
              const pairs = table.rows
              if (!pairs.length) return ''
              const useTwoCols = pairs.length >= 2
              const half = Math.ceil(pairs.length / 2)
              const rowCount = useTwoCols ? half : pairs.length

              const labelStyle = (last: boolean) => [
                'padding:11px 4px 11px 0',
                'vertical-align:middle',
                'text-align:left',
                'white-space:nowrap',
                last ? '' : 'border-bottom:1px solid ' + state.ui.vtBorder,
                'color:' + state.ui.vtHeadText,
                'font-size:10px',
                'font-weight:700',
                'text-transform:uppercase',
                'letter-spacing:0.04em',
                'line-height:16px',
              ].filter(Boolean).join('; ')

              const valueStyle = (last: boolean) => [
                'padding:11px 0',
                'vertical-align:middle',
                'text-align:right',
                last ? '' : 'border-bottom:1px solid ' + state.ui.vtBorder,
                'color:' + state.ui.tableBodyText,
                'font-size:13px',
                'line-height:18px',
              ].filter(Boolean).join('; ')

              const renderRow = (rowIdx: number) => {
                const left = pairs[rowIdx]
                const right = useTwoCols ? pairs[half + rowIdx] : undefined
                const last = rowIdx === rowCount - 1
                const leftCells = `<td style="${labelStyle(last)}">${escapeHtml(left?.cells[0] || '')}</td><td style="${valueStyle(last)}">${escapeHtml(left?.cells[1] || '')}</td>`
                const spacer = useTwoCols ? '<td style="width:40px; border:none;">&nbsp;</td>' : ''
                const rightCells = useTwoCols
                  ? (right
                      ? `<td style="${labelStyle(last)}">${escapeHtml(right.cells[0] || '')}</td><td style="${valueStyle(last)}">${escapeHtml(right.cells[1] || '')}</td>`
                      : '<td></td><td></td>')
                  : ''
                return `<tr>${leftCells}${spacer}${rightCells}</tr>`
              }

              const colGroup = useTwoCols
                ? '<col style="width:25%"/><col style="width:25%"/><col style="width:40px"/><col style="width:25%"/><col style="width:25%"/>'
                : '<col style="width:50%"/><col style="width:50%"/>'

              let rows = ''
              for (let i = 0; i < rowCount; i++) rows += renderRow(i)

              return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; border-collapse:collapse; table-layout:fixed;">
                <colgroup>${colGroup}</colgroup>
                ${rows}
              </table>`
            })()}
            ${renderSectionButtons(table.buttons?.length ? table.buttons : tableIndex === 0 ? getGlobalActionButtons(state) : [])}
          </section>`,
        )
        .join('')
    : ''

  const reposBlock = state.sec.repos
    ? state.repos
        .map(
          (table) => `
          <section data-eb-section="repos" style="margin-top:16px; padding:16px; border:1px solid ${state.ui.repoBlockBorder}; border-radius:10px; ${lockBg(state.ui.repoBlockBg)}">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
              <td valign="top" style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.repoText};">${escapeHtml(table.title)}</td>
              ${
                table.infoBadgeEnabled && table.infoBadgeText
                  ? `<td valign="top" align="right" style="color:${state.ui.textSecondary}; font-size:13px; line-height:18px; text-align:right; padding-left:12px; white-space:nowrap;">${escapeHtml(
                      table.infoBadgeText.replace(/\{\{\s*count\s*\}\}/gi, String(table.rows.length)),
                    )}</td>`
                  : ''
              }
            </tr></table>
            <div style="margin-top:12px; border:1px solid ${state.ui.repoBorder}; border-radius:12px; overflow:hidden;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <thead>
                <tr>
                  ${table.columns
                    .map((column, colIdx) => {
                      const lastCol = colIdx === table.columns.length - 1
                      const borders = [
                        'border-bottom:1px solid ' + state.ui.repoBorder + ';',
                        lastCol ? '' : 'border-right:1px solid ' + state.ui.repoBorder + ';',
                      ].join('')
                      return `<th align="left" style="padding:10px 12px; ${lockBg(state.ui.repoHeadBg)} color:${state.ui.repoHeadText}; font-size:12px; line-height:16px; font-weight:600; ${borders}">${escapeHtml(column.title)}</th>`
                    })
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${table.rows
                  .map((row, rowIdx) => {
                    const lastRow = rowIdx === table.rows.length - 1
                    return `<tr>${row.cells
                      .map((cell, colIdx) => {
                        const lastCol = colIdx === table.columns.length - 1
                        const borders = [
                          lastRow ? '' : 'border-bottom:1px solid ' + state.ui.repoBorder + ';',
                          lastCol ? '' : 'border-right:1px solid ' + state.ui.repoBorder + ';',
                        ].join('')
                        const content =
                          cell.isBadge && cell.value
                            ? renderBadge({ id: 'repo-badge', text: cell.value, color: cell.badgeColor }, state)
                            : escapeHtml(cell.value)
                        return `<td style="padding:10px 12px; color:${state.ui.repoText}; font-size:13px; line-height:18px; ${borders}">${content}</td>`
                      })
                      .join('')}</tr>`
                  })
                  .join('')}
              </tbody>
            </table>
            </div>
            ${renderSectionButtons(table.buttons || [])}
          </section>`,
        )
        .join('')
    : ''

  const prListBlock =
    state.sec.prList && state.prList.length
      ? `
      <section data-eb-section="prList" style="margin-top:16px; padding:18px; border:1px solid ${state.ui.tableBorder}; border-radius:16px; ${lockBg(state.ui.surfaceBg)}">
        <div style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.textPrimary};">Список</div>
        ${state.prList
          .map(
            (item, idx) => `
          <div style="font-size:13px; line-height:18px; color:${state.ui.textPrimary}; margin-top:${idx === 0 ? 12 : 8}px;">
            • ${escapeHtml(item.repo ? `${item.repo}: ` : '')}${escapeHtml(item.url)}
          </div>`,
          )
          .join('')}
      </section>`
      : ''

  // Email clients strip CSS grid, so the two-column card layout is built with a
  // fixed-layout table. Cards are paired per row; a 6px inset on facing edges
  // plus 12px bottom padding recreates the 12px grid gap.
  const renderSummaryCard = (card: { value: string; label: string }) => `
      <div style="padding:16px; border:1px solid ${state.ui.tableBorder}; border-radius:12px; ${lockBg(state.ui.cardBg)}">
        <div style="font-size:28px; line-height:1.1; font-weight:600; color:${state.ui.statAccent};">${escapeHtml(card.value)}</div>
        <div style="margin-top:8px; font-size:12px; line-height:1.4; color:${state.ui.statLabelColor};">${escapeHtml(card.label)}</div>
      </div>`

  const summaryCards = (() => {
    const cards = state.summaryCards
    if (!cards.length) return ''
    let rows = ''
    for (let i = 0; i < cards.length; i += 2) {
      const right = cards[i + 1]
      rows += `<tr>
        <td width="50%" valign="top" style="padding:0 6px 12px 0;">${renderSummaryCard(cards[i])}</td>
        <td width="50%" valign="top" style="padding:0 0 12px 6px;">${right ? renderSummaryCard(right) : ''}</td>
      </tr>`
    }
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="table-layout:fixed; margin-top:14px;">${rows}</table>`
  })()

  const headerCells = state.headerCellsVisible
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>${state.headerCells
        .map((cell, idx) => {
          const last = idx === state.headerCells.length - 1
          return `<td valign="top" style="padding:0 ${last ? 0 : 16}px 0 0;">
          <div style="font-size:11px; line-height:14px; color:${state.ui.heroCellLabelColor}; text-transform:uppercase;">${escapeHtml(cell.label)}</div>
          <div style="margin-top:2px; font-size:13px; line-height:16px; color:${state.ui.heroCellValueColor};">${escapeHtml(cell.value)}</div>
        </td>`
        })
        .join('')}</tr></table>`
    : ''

  const logoBlock = state.ui.logoImage
    ? `<div style="margin-bottom:12px;"><img src="${escapeHtml(state.ui.logoImage)}" alt="Логотип" style="display:block; max-height:20px; width:auto; border:0; outline:none; text-decoration:none;"></div>`
    : ''

  const badgesRow = state.alertBadgesVisible
    ? `<div style="margin-top:4px;">
        ${state.alert.badges
          .map((badge) => `<span style="display:inline-block; margin:8px 8px 0 0;">${renderBadge(badge, state)}</span>`)
          .join('')}
      </div>`
    : ''

  const alertBlock = state.sec.alert
    ? `
      <section data-eb-section="alert" style="margin-top:16px; padding:16px; border:1px solid ${state.ui.alertBorder}; border-radius:14px; ${lockBg(state.ui.alertBg)}">
        <div style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.alertTitle};">${escapeHtml(
          state.alert.title || 'Блок алертов',
        )}</div>
        <div style="margin-top:8px; font-size:13px; line-height:18px; color:${state.ui.alertText};">${escapeHtml(
          state.alert.text || 'Описание алерта появится здесь.',
        )}</div>
        ${badgesRow}
      </section>`
    : ''

  const summaryAlertBlock = state.sec.alert && state.alertInsideSummary ? alertBlock : ''
  const standaloneAlertBlock = state.sec.alert && !state.alertInsideSummary ? alertBlock : ''

  const summaryBlock = state.sec.summary
    ? `
      <section data-eb-section="summary" style="margin-top:16px; padding:18px; border:1px solid ${state.ui.tableBorder}; border-radius:16px; ${lockBg(state.ui.surfaceBg)}">
        <div style="font-size:18px; line-height:22px; font-weight:600; color:${state.ui.textPrimary};">${escapeHtml(state.summaryTitle)}</div>
        ${summaryCards}
        ${summaryAlertBlock}
      </section>`
    : ''

  const reportHeadCss = `
    html, body { margin:0 !important; padding:0 !important; width:100% !important; }
    table, td { border-collapse: collapse !important; mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
    img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    body, table, td, p, div, span, a { font-family:'SB Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important; }
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
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
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
<body style="margin:0; background:${state.ui.bodyBg}; font-family:'SB Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:${state.ui.textPrimary};">
  <center style="width:100%; background:${state.ui.bodyBg};">
  <!--[if mso]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="632"><tr><td><![endif]-->
  <div style="position:relative; max-width:632px; margin:0 auto; text-align:left; ${lockBg(state.ui.bodyContentBg || '#ffffff')} padding:${Math.max(0, Number(state.ui.bodyPadTop) || 0)}px ${Math.max(0, Number(state.ui.bodyPadRight) || 16)}px ${Math.max(0, Number(state.ui.bodyPadBottom) || 0)}px ${Math.max(0, Number(state.ui.bodyPadLeft) || 16)}px;">
    ${
      templateOverlay
        ? `<img src="${escapeHtml(templateOverlay)}" alt="" style="position:absolute; inset:${Math.max(0, Number(state.ui.bodyPadTop) || 0)}px ${Math.max(0, Number(state.ui.bodyPadRight) || 16)}px ${Math.max(0, Number(state.ui.bodyPadBottom) || 0)}px ${Math.max(0, Number(state.ui.bodyPadLeft) || 16)}px; width:calc(100% - ${(Math.max(0, Number(state.ui.bodyPadLeft) || 16) + Math.max(0, Number(state.ui.bodyPadRight) || 16))}px); height:calc(100% - ${Math.max(0, Number(state.ui.bodyPadTop) || 0) + Math.max(0, Number(state.ui.bodyPadBottom) || 0)}px); object-fit:contain; object-position:top center; opacity:${Math.max(0, Math.min(100, Number(state.template.opacity) || 0)) / 100}; pointer-events:none; z-index:0;">`
        : ''
    }
    <div style="position:relative; z-index:1;">
    ${state.sec.header ? `<section data-eb-section="header" style="padding:24px; border:1px solid ${state.ui.heroBorder}; border-radius:18px; background:${heroBackground}; overflow:hidden;">
      ${logoBlock}
      <div style="overflow:hidden;">
        ${
          state.headerStatusVisible
            ? `<span style="float:right; display:inline-block; padding:0 10px; border-radius:999px; background:${state.ui.statusBg}; color:${state.ui.statusText}; font-size:12px; line-height:24px; margin-left:8px;">${escapeHtml(state.headerStatus)}</span>`
            : ''
        }
        <div style="font-size:28px; line-height:1.1; font-weight:600; color:${state.ui.heroTitleColor};">${escapeHtml(state.title)}</div>
      </div>
      ${headerCells}
    </section>` : ''}

    ${summaryBlock}
    ${standaloneAlertBlock}
    ${paramsBlock}
    ${reposBlock}
    ${prListBlock}

    ${
      state.sec.footerText
        ? `<footer data-eb-section="footer" style="margin-top:16px; padding:16px; border-radius:14px; ${lockBg(state.footer.bg)} text-align:${state.footer.align};">
            <div style="font-size:14px; line-height:18px; font-weight:600;">${escapeHtml(state.footer.text)}</div>
            ${state.footer.subtitle ? `<div style="margin-top:4px; font-size:13px; line-height:18px;">${escapeHtml(state.footer.subtitle)}</div>` : ''}
            ${state.footer.sub ? `<div style="margin-top:6px; font-size:12px; line-height:16px; color:${state.ui.textSecondary};">${escapeHtml(state.footer.sub)}</div>` : ''}
          </footer>`
        : ''
    }
    </div>
  </div>
  <!--[if mso]></td></tr></table><![endif]-->
  </center>
</body>
</html>`
}
