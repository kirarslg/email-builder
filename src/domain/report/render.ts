import { escapeHtml } from '../shared/html'
import type { AlertBadge, ReportState, RepoBadgeColor } from './types'

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
  return `<span style="display:inline-flex; align-items:center; min-height:24px; padding:0 10px; border-radius:999px; background:${theme.bg}; color:${theme.text}; font-size:12px; line-height:24px; white-space:nowrap;">${escapeHtml(badge.text)}</span>`
}

function renderSectionButtons(
  buttons: Array<{ text: string; url: string; textColor: string; bgColor: string }>,
): string {
  if (!buttons.length) return ''
  return `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:16px;">
    ${buttons
      .map(
        (button) =>
          `<a href="${escapeHtml(button.url)}" style="display:inline-flex; align-items:center; min-height:36px; padding:0 14px; border-radius:10px; background:${button.bgColor}; color:${button.textColor}; font-size:13px; line-height:18px; text-decoration:none;">${escapeHtml(button.text)}</a>`,
      )
      .join('')}
  </div>`
}

function getGlobalActionButtons(state: ReportState): Array<{ text: string; url: string; textColor: string; bgColor: string }> {
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
  ].filter(Boolean) as Array<{ text: string; url: string; textColor: string; bgColor: string }>
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
          <section style="margin-top:16px; padding:18px; border:1px solid ${state.ui.tableBorder}; border-radius:16px; background:${state.ui.surfaceBg};">
            <div style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.textPrimary};">${escapeHtml(table.title)}</div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px; border-collapse:collapse;">
              <thead>
                <tr>
                  ${table.columns
                    .map(
                      (column) =>
                        `<th align="left" style="padding:10px 12px; background:${state.ui.tableHeadBg}; color:${state.ui.tableHeadText}; font-size:12px; line-height:16px; font-weight:600; border:1px solid ${state.ui.tableBorder};">${escapeHtml(column.title)}</th>`,
                    )
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${table.rows
                  .map(
                    (row) => `<tr>${row.cells
                      .map(
                        (cell) =>
                          `<td style="padding:10px 12px; color:${state.ui.textPrimary}; font-size:13px; line-height:18px; border:1px solid ${state.ui.tableBorder};">${escapeHtml(cell)}</td>`,
                      )
                      .join('')}</tr>`,
                  )
                  .join('')}
              </tbody>
            </table>
            ${renderSectionButtons(table.buttons?.length ? table.buttons : tableIndex === 0 ? getGlobalActionButtons(state) : [])}
          </section>`,
        )
        .join('')
    : ''

  const reposBlock = state.sec.repos
    ? state.repos
        .map(
          (table) => `
          <section style="margin-top:16px; padding:18px; border:1px solid ${state.ui.tableBorder}; border-radius:16px; background:${state.ui.surfaceBg};">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
              <div style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.textPrimary};">${escapeHtml(table.title)}</div>
              ${
                table.infoBadgeEnabled && table.infoBadgeText
                  ? `<div style="color:${state.ui.textSecondary}; font-size:13px; line-height:18px; text-align:right;">${escapeHtml(
                      table.infoBadgeText.replace(/\{\{\s*count\s*\}\}/gi, String(table.rows.length)),
                    )}</div>`
                  : ''
              }
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px; border-collapse:collapse;">
              <thead>
                <tr>
                  ${table.columns
                    .map(
                      (column) =>
                        `<th align="left" style="padding:10px 12px; background:${state.ui.tableHeadBg}; color:${state.ui.tableHeadText}; font-size:12px; line-height:16px; font-weight:600; border:1px solid ${state.ui.tableBorder};">${escapeHtml(column.title)}</th>`,
                    )
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${table.rows
                  .map(
                    (row) => `<tr>${row.cells
                      .map((cell) => {
                        const content =
                          cell.isBadge && cell.value
                            ? renderBadge({ id: 'repo-badge', text: cell.value, color: cell.badgeColor }, state)
                            : escapeHtml(cell.value)
                        return `<td style="padding:10px 12px; color:${state.ui.textPrimary}; font-size:13px; line-height:18px; border:1px solid ${state.ui.tableBorder};">${content}</td>`
                      })
                      .join('')}</tr>`,
                  )
                  .join('')}
              </tbody>
            </table>
            ${renderSectionButtons(table.buttons || [])}
          </section>`,
        )
        .join('')
    : ''

  const prListBlock =
    state.sec.prList && state.prList.length
      ? `
      <section style="margin-top:16px; padding:18px; border:1px solid ${state.ui.tableBorder}; border-radius:16px; background:${state.ui.surfaceBg};">
        <div style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.textPrimary};">Список</div>
        <div style="display:grid; gap:8px; margin-top:12px;">
          ${state.prList
            .map(
              (item) => `
            <div style="font-size:13px; line-height:18px; color:${state.ui.textPrimary};">
              • ${escapeHtml(item.repo ? `${item.repo}: ` : '')}${escapeHtml(item.url)}
            </div>`,
            )
            .join('')}
        </div>
      </section>`
      : ''

  const summaryCards = state.summaryCards
    .map(
      (card) => `
      <div style="padding:16px; border:1px solid ${state.ui.tableBorder}; border-radius:12px; background:${state.ui.cardBg};">
        <div style="font-size:28px; line-height:1.1; font-weight:600; color:${state.ui.statAccent};">${escapeHtml(card.value)}</div>
        <div style="margin-top:8px; font-size:12px; line-height:1.4; color:${state.ui.statLabelColor};">${escapeHtml(card.label)}</div>
      </div>`,
    )
    .join('')

  const headerCells = state.headerCellsVisible
    ? `<div style="display:flex; flex-wrap:wrap; gap:8px 16px; margin-top:16px;">${state.headerCells
        .map(
          (cell) => `
        <div style="display:grid; gap:2px;">
          <div style="font-size:11px; line-height:14px; color:${state.ui.heroCellLabelColor}; text-transform:uppercase;">${escapeHtml(cell.label)}</div>
          <div style="font-size:13px; line-height:16px; color:${state.ui.heroCellValueColor};">${escapeHtml(cell.value)}</div>
        </div>`,
        )
        .join('')}</div>`
    : ''

  const logoBlock = state.ui.logoImage
    ? `<div style="margin-bottom:12px;"><img src="${escapeHtml(state.ui.logoImage)}" alt="Логотип" style="display:block; max-height:20px; width:auto; border:0; outline:none; text-decoration:none;"></div>`
    : ''

  const alertBlock =
    state.sec.alert || state.alertBadgesVisible
      ? `
      <section style="margin-top:16px; padding:16px; border:1px solid ${state.ui.alertBorder}; border-radius:14px; background:${state.ui.alertBg};">
        <div style="font-size:16px; line-height:20px; font-weight:600; color:${state.ui.alertTitle};">${escapeHtml(
          state.alert.title || 'Блок алертов',
        )}</div>
        <div style="margin-top:8px; font-size:13px; line-height:18px; color:${state.ui.alertText};">${escapeHtml(
          state.alert.text || 'Описание алерта появится здесь.',
        )}</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">
          ${state.alert.badges.map((badge) => renderBadge(badge, state)).join('')}
        </div>
      </section>`
      : ''

  const summaryAlertBlock = state.sec.alert && state.alertInsideSummary ? alertBlock : ''
  const standaloneAlertBlock = state.sec.alert && !state.alertInsideSummary ? alertBlock : ''

  const summaryBlock = state.sec.summary
    ? `
      <section style="margin-top:16px; padding:18px; border:1px solid ${state.ui.tableBorder}; border-radius:16px; background:${state.ui.surfaceBg};">
        <div style="font-size:18px; line-height:22px; font-weight:600; color:${state.ui.textPrimary};">${escapeHtml(state.summaryTitle)}</div>
        <div style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:14px;">
          ${summaryCards}
        </div>
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
  <style>
    ${reportHeadCss}
  </style>
</head>
<body style="margin:0; background:${state.ui.bodyBg}; font-family:'SB Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color:${state.ui.textPrimary};">
  <div style="position:relative; max-width:632px; margin:0 auto; background:${state.ui.bodyContentBg || '#ffffff'}; padding:${Math.max(0, Number(state.ui.bodyPadTop) || 0)}px ${Math.max(0, Number(state.ui.bodyPadRight) || 16)}px ${Math.max(0, Number(state.ui.bodyPadBottom) || 0)}px ${Math.max(0, Number(state.ui.bodyPadLeft) || 16)}px;">
    ${
      templateOverlay
        ? `<img src="${escapeHtml(templateOverlay)}" alt="" style="position:absolute; inset:${Math.max(0, Number(state.ui.bodyPadTop) || 0)}px ${Math.max(0, Number(state.ui.bodyPadRight) || 16)}px ${Math.max(0, Number(state.ui.bodyPadBottom) || 0)}px ${Math.max(0, Number(state.ui.bodyPadLeft) || 16)}px; width:calc(100% - ${(Math.max(0, Number(state.ui.bodyPadLeft) || 16) + Math.max(0, Number(state.ui.bodyPadRight) || 16))}px); height:calc(100% - ${Math.max(0, Number(state.ui.bodyPadTop) || 0) + Math.max(0, Number(state.ui.bodyPadBottom) || 0)}px); object-fit:contain; object-position:top center; opacity:${Math.max(0, Math.min(100, Number(state.template.opacity) || 0)) / 100}; pointer-events:none; z-index:0;">`
        : ''
    }
    <div style="position:relative; z-index:1;">
    <section style="padding:24px; border:1px solid ${state.ui.heroBorder}; border-radius:18px; background:${heroBackground}; overflow:hidden;">
      ${logoBlock}
      <div style="overflow:hidden;">
        ${
          state.headerStatusVisible
            ? `<span style="float:right; display:inline-flex; align-items:center; min-height:24px; padding:0 10px; border-radius:999px; background:${state.ui.statusBg}; color:${state.ui.statusText}; font-size:12px; line-height:24px; margin-left:8px;">${escapeHtml(state.headerStatus)}</span>`
            : ''
        }
        <div style="font-size:28px; line-height:1.1; font-weight:600; color:${state.ui.heroTitleColor};">${escapeHtml(state.title)}</div>
      </div>
      ${headerCells}
    </section>

    ${summaryBlock}
    ${standaloneAlertBlock}
    ${paramsBlock}
    ${reposBlock}
    ${prListBlock}

    ${
      state.sec.footerText
        ? `<footer style="margin-top:16px; padding:16px; border-radius:14px; background:${state.footer.bg}; text-align:${state.footer.align};">
            <div style="font-size:14px; line-height:18px; font-weight:600;">${escapeHtml(state.footer.text)}</div>
            ${state.footer.subtitle ? `<div style="margin-top:4px; font-size:13px; line-height:18px;">${escapeHtml(state.footer.subtitle)}</div>` : ''}
            ${state.footer.sub ? `<div style="margin-top:6px; font-size:12px; line-height:16px; color:${state.ui.textSecondary};">${escapeHtml(state.footer.sub)}</div>` : ''}
          </footer>`
        : ''
    }
    </div>
  </div>
</body>
</html>`
}
