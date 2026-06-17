import type { BuilderBlock, BuilderColumn, EmailFormData } from './types'
import { escapeHtml, safeUrl } from '../shared/html'

const EMAIL_WIDTH = 600
const SB_SANS_FONT_STACK =
  "'SB Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
const SB_SANS_FONT_FACE_CSS = `
@font-face {
  font-family: 'SB Sans Text';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('SB Sans Text'), local('SBSansText-Regular'), url('fonts/SBSansText-Regular.woff2') format('woff2'), url('/fonts/SBSansText-Regular.woff2') format('woff2'), url('https://cdn.sberdevices.ru/fonts/SBSansText-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'SB Sans Text';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('SB Sans Text Medium'), local('SBSansText-Medium'), url('fonts/SBSansText-Medium.woff2') format('woff2'), url('/fonts/SBSansText-Medium.woff2') format('woff2'), url('https://cdn.sberdevices.ru/fonts/SBSansText-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'SB Sans Text';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('SB Sans Text Bold'), local('SBSansText-Bold'), url('fonts/SBSansText-Bold.woff2') format('woff2'), url('/fonts/SBSansText-Bold.woff2') format('woff2'), url('https://cdn.sberdevices.ru/fonts/SBSansText-Bold.woff2') format('woff2');
}`

function richTextToHtml(input: string, linkStyle: string): string {
  const text = input ?? ''
  const lines = text.split(/\r?\n/)

  const urlRegex = /(https?:\/\/[^\s<>"']+)/g
  const tagRegex = /\[([^\]|]+)\|(\s*https?:\/\/[^\]\s]+)\]/g
  const compactRegex = /<\s*(https?:\/\/[^=\s>]+)\s*=\s*([^>]+?)\s*>/g
  const anchorRegex = /<a\b[^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>([\s\S]*?)<\/a>/gi

  return lines
    .map((line) => {
      const anchorTokens: string[] = []
      const compactTokens: string[] = []
      const bracketTokens: string[] = []

      const withAnchorTokens = line.replace(anchorRegex, (_match, hrefDouble, hrefSingle, anchorText) => {
        const hrefRaw = (hrefDouble || hrefSingle || '').trim()
        const hrefSafe = safeUrl(hrefRaw)
        if (!hrefSafe) return escapeHtml(anchorText || '')

        const labelSafe = escapeHtml((anchorText || '').trim() || hrefSafe)
        const token = `__RT_ANCHOR_${anchorTokens.length}__`
        anchorTokens.push(
          `<a href="${escapeHtml(hrefSafe)}" target="_blank" rel="noopener noreferrer" style="${linkStyle}">${labelSafe}</a>`,
        )
        return token
      })

      const withCompactTokens = withAnchorTokens.replace(compactRegex, (_match, url, label) => {
        const safeLabel = escapeHtml((label || '').trim())
        const parsedUrl = safeUrl((url || '').trim())
        if (!parsedUrl) return safeLabel

        const token = `__RT_COMPACT_${compactTokens.length}__`
        compactTokens.push(
          `<a href="${escapeHtml(parsedUrl)}" target="_blank" rel="noopener noreferrer" style="${linkStyle}">${safeLabel || escapeHtml(parsedUrl)}</a>`,
        )
        return token
      })

      const withBracketTokens = withCompactTokens.replace(tagRegex, (_match, label, url) => {
        const safeLabel = escapeHtml(label.trim())
        const parsedUrl = safeUrl(url.trim())
        if (!parsedUrl) return safeLabel

        const token = `__RT_BRACKET_${bracketTokens.length}__`
        bracketTokens.push(
          `<a href="${escapeHtml(parsedUrl)}" target="_blank" rel="noopener noreferrer" style="${linkStyle}">${safeLabel}</a>`,
        )
        return token
      })

      let escaped = escapeHtml(withBracketTokens)

      escaped = escaped.replace(urlRegex, (url) => {
        const parsedUrl = safeUrl(url)
        if (!parsedUrl) return escapeHtml(url)
        const escapedUrl = escapeHtml(parsedUrl)
        return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" style="${linkStyle}">${escapedUrl}</a>`
      })

      bracketTokens.forEach((anchorHtml, idx) => {
        escaped = escaped.replaceAll(`__RT_BRACKET_${idx}__`, anchorHtml)
      })

      compactTokens.forEach((anchorHtml, idx) => {
        escaped = escaped.replaceAll(`__RT_COMPACT_${idx}__`, anchorHtml)
      })

      anchorTokens.forEach((anchorHtml, idx) => {
        escaped = escaped.replaceAll(`__RT_ANCHOR_${idx}__`, anchorHtml)
      })

      return escaped
    })
    .join('<br>')
}

function renderSimpleText(input: string): string {
  return escapeHtml(input ?? '').replace(/\r?\n/g, '<br>')
}

/** Render value from RTE (may be HTML or plain text) for use in email templates */
function renderRteValue(input: string): string {
  if (!input) return ''
  // HTML from contentEditable — keep inline formatting (span/b/i/u/color),
  // but strip anything that could execute or break out: dangerous tags and
  // every inline event handler / javascript: URL.
  if (/<[a-z][\s\S]*>/i.test(input)) {
    return input
      .replace(/<\s*(script|iframe|object|embed|style|link|meta|svg|img|form|input|base)\b[\s\S]*?(<\/\s*\1\s*>|\/?>)/gi, '')
      .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, '')
  }
  // Plain text fallback
  return escapeHtml(input).replace(/\r?\n/g, '<br>')
}

function gradDirectionToCss(direction: string): string {
  switch (direction) {
    case 'tb':
      return 'to bottom'
    case 'trbl':
      return 'to bottom right'
    case 'tlbr':
      return 'to bottom left'
    case 'lr':
    default:
      return 'to right'
  }
}

function buildButtonBlock(data: EmailFormData): string {
  if (data.withButton === false) return ''
  const safeButtonUrl = safeUrl(data.buttonUrl)
  if (!(data.buttonText && safeButtonUrl)) return ''

  const radius = Number(data.buttonRadius || 0)
  const fg = escapeHtml(data.buttonFg || '#ffffff')
  const c1 = escapeHtml(data.buttonBg1 || '#111111')
  const c2 = escapeHtml(data.buttonBg2 || c1)
  const padBg = data.bgBody || data.bgOuter || '#000000'
  const btnAlign = data.buttonAlign || 'center'
  const buttonSize = data.buttonSize === 's' ? 's' : 'm'
  const fontSize = buttonSize === 's' ? 12 : 14
  const contentMaxWidth = EMAIL_WIDTH - 48
  const widthPx = Math.max(80, Math.min(Number(data.buttonWidth ?? contentMaxWidth), contentMaxWidth))
  const isGradient = data.buttonBgMode === 'gradient'
  const cssDir = gradDirectionToCss(data.buttonGradDir || 'lr')
  const cssBg = isGradient ? `linear-gradient(${cssDir}, ${c1}, ${c2})` : c1
  // Edge padding lives on the <td> (Outlook's Word engine keeps cell padding on
  // forward). Regular padding and the Outlook mso-padding-alt are set per size;
  // M defaults to 12×16 (mso 15×20) per the design spec.
  const vpad = buttonSize === 's' ? 8 : 12
  const hpad = buttonSize === 's' ? 8 : 12
  const msoVpad = buttonSize === 's' ? 10 : 15
  const msoHpad = buttonSize === 's' ? 12 : 16

  // No VML <v:roundrect>: Outlook rasterises it into an image on forward, so the
  // button arrives as a picture. A plain table+anchor stays a real text link.
  // `bgcolor` gives Outlook (no gradient/border-radius support) a solid fill.
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td class="px-24" align="${escapeHtml(btnAlign)}" bgcolor="${escapeHtml(padBg)}" style="background:${escapeHtml(padBg)}; padding: 18px 0 14px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${escapeHtml(btnAlign)}">
            <tr>
              <td bgcolor="${c1}" align="center" width="${widthPx}" style="width:${widthPx}px; background:${cssBg}; border-radius:${radius}px; padding:${vpad}px ${hpad}px; mso-padding-alt:${msoVpad}px ${msoHpad}px; text-align:center;">
                <a
                  href="${escapeHtml(safeButtonUrl)}"
                  target="_blank" rel="noopener noreferrer"
                  style="display:inline-block; font-family:'SB Sans Text'; font-size:${fontSize}px; line-height:${fontSize}px; font-weight:600; color:${fg} !important; -webkit-text-fill-color:${fg} !important; text-decoration:none !important; text-align:center;"
                >
                  ${escapeHtml(data.buttonText)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

function buildBuilderButtonBlock(data: EmailFormData, blockText: string, blockUrl: string, maxWidth: number): string {
  if (!blockText) return ''
  const safeButtonUrl = safeUrl(blockUrl || '#') || '#'
  const width = Math.max(120, Math.min(Number(data.buttonWidth ?? 240), maxWidth))
  const radius = Number(data.buttonRadius || 0)
  const fg = escapeHtml(data.buttonFg || '#ffffff')
  const c1 = escapeHtml(data.buttonBg1 || '#111111')
  const c2 = escapeHtml(data.buttonBg2 || c1)
  const buttonSize = data.buttonSize === 's' ? 's' : 'm'
  const fontSize = buttonSize === 's' ? 12 : 14
  const isGradient = data.buttonBgMode === 'gradient'
  const cssDir = gradDirectionToCss(data.buttonGradDir || 'lr')
  const cssBg = isGradient ? `linear-gradient(${cssDir}, ${c1}, ${c2})` : c1
  // Padding on the <td> (kept by Outlook on forward); M defaults to 12×16
  // (Outlook mso-padding-alt 15×20), matching the button preset.
  const vpad = buttonSize === 's' ? 8 : 12
  const hpad = buttonSize === 's' ? 8 : 12
  const msoVpad = buttonSize === 's' ? 10 : 15
  const msoHpad = buttonSize === 's' ? 12 : 16

  return `<tr>
    <td style="padding:0 0 12px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="left">
        <tr>
          <td bgcolor="${c1}" align="center" width="${width}" style="width:${width}px; background:${cssBg}; border-radius:${radius}px; padding:${vpad}px ${hpad}px; mso-padding-alt:${msoVpad}px ${msoHpad}px; text-align:center;">
            <a href="${escapeHtml(safeButtonUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; line-height:${fontSize}px; text-align:center; color:${fg} !important; -webkit-text-fill-color:${fg} !important; text-decoration:none !important; font-size:${fontSize}px; font-weight:600; font-family:'SB Sans Text';">
              ${escapeHtml(blockText)}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

function buildBuilderBlocksHtml(data: EmailFormData, blocks: BuilderBlock[], colPx: number): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'header':
          return ''
        case 'greeting':
          return `<tr><td style="padding:0 0 14px 0; color:${escapeHtml(data.builderGreetingColor || data.textColor || '#111111')}; font-size:${Math.max(10, Math.min(40, Number(data.builderGreetingSize) || 14))}px; line-height:1.6;">${richTextToHtml(block.text || '', `color:${escapeHtml(data.linkColor || '#0b57d0')}; text-decoration:${data.linkUnderline};`)}</td></tr>`
        case 'heading':
          return `<tr><td style="padding:18px 0 12px 0; color:${escapeHtml(data.builderHeadingColor || data.textColor || '#111111')}; font-size:${Math.max(12, Math.min(56, Number(data.builderHeadingSize) || 22))}px; font-weight:600; line-height:1.3;">${renderSimpleText(block.text || '')}</td></tr>`
        case 'text':
          return `<tr><td style="padding:0 0 12px 0; color:${escapeHtml(data.textColor)}; font-size:14px; line-height:1.6;">${richTextToHtml(block.text || '', `color:${escapeHtml(data.linkColor || '#0b57d0')}; text-decoration:${data.linkUnderline};`)}</td></tr>`
        case 'button':
          return buildBuilderButtonBlock(data, block.text || '', block.url || '', colPx)
        case 'divider':
          return `<tr><td style="padding:12px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="border-top:1px solid ${escapeHtml(data.dividerColor)}; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>`
        case 'spacer':
          return `<tr><td style="height:${Math.max(0, Math.min(200, Number(block.size) || 0))}px; line-height:${Math.max(0, Math.min(200, Number(block.size) || 0))}px; font-size:1px;">&nbsp;</td></tr>`
        case 'image':
          return block.src
            ? `<tr><td style="padding:0 0 12px 0;"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.name || '')}" style="display:block; width:100%; max-width:${colPx}px; height:auto; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;"></td></tr>`
            : ''
        default:
          return ''
      }
    })
    .join('')
}

function buildBuilderBodyHtml(data: EmailFormData): string {
  if (!data.builderRows.length) return ''
  const BODY_PAD = 24
  const INNER_GUTTER = 8
  const CONTENT_W = EMAIL_WIDTH - BODY_PAD * 2

  return data.builderRows
    .map((row) => {
      const cols = row.columns || []
      if (!cols.length) return ''
      const colCount = cols.length
      if (colCount === 1) {
        return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${buildBuilderBlocksHtml(data, cols[0].blocks, CONTENT_W)}</table>`
      }

      const colPx = Math.floor((CONTENT_W - INNER_GUTTER * (colCount - 1)) / colCount)
      const columnsHtml = cols
        .map((col: BuilderColumn, idx) => {
          const inner = buildBuilderBlocksHtml(data, col.blocks, colPx) || '<tr><td>&nbsp;</td></tr>'
          return `<td width="${Math.round(100 / colCount)}%" valign="top" style="padding:0 ${idx === colCount - 1 ? 0 : INNER_GUTTER}px 0 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${inner}</table></td>`
        })
        .join('')

      return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:6px;"><tr>${columnsHtml}</tr></table>`
    })
    .join('')
}

export function buildEmailHtmlForInputs(data: EmailFormData): string {
  const subject = escapeHtml(data.subject || '')
  const preheader = escapeHtml((data.intro || '').slice(0, 120))
  const safeTextColor = escapeHtml(data.textColor || '#111111')
  const safeLinkColor = escapeHtml(data.linkColor || '#0b57d0')
  const linkStyle = `color:${safeLinkColor}; text-decoration:${data.linkUnderline};`
  const introHtml = renderRteValue(data.intro || '')

  const bullets = (data.bullets || [])
    .filter(Boolean)
    .map(
      (item) => `<tr>
        <td style="padding: 0 0 10px 0; vertical-align: top; width: 18px; color:${escapeHtml(data.textColor)};">&bull;</td>
        <td style="padding: 0 0 10px 0; vertical-align: top; color:${escapeHtml(data.textColor)};">${escapeHtml(item)}</td>
      </tr>`,
    )
    .join('')

  const cta = data.cta && !data.hideCta
    ? `<tr>
      <td style="padding: 16px 0 0 0; color:${escapeHtml(data.textColor)};">
        <div style="font-weight:600;">${data.ctaHtml || escapeHtml(data.cta)}</div>
      </td>
    </tr>`
    : ''

  const headerImgsArray = Array.isArray(data.headerImages) ? data.headerImages : []
  const builderHeaderImgsArray = Array.isArray(data.builderHeaderImages) ? data.builderHeaderImages : []
  const isBuilderMode = data.emailViewMode === 'builder'
  const headerSourceImages = isBuilderMode ? builderHeaderImgsArray : headerImgsArray
  const headerTitleText = (data.headerTitle || '').trim()
  const headerDescText = (data.headerDesc || '').trim()

  // Header is a bordered, rounded block (like the report hero): background +
  // border + radius, with the image and the title/description stacked inside.
  // Separate colours and alignment for title and text; the whole block only
  // renders when there is some content.
  const headerBgColor = escapeHtml(data.headerBgColor || '#ecf2f3')
  const headerBorderColor = escapeHtml(data.headerBorderColor || '#dde5ea')
  const headerTitleColor = escapeHtml(data.headerTitleColor || data.textColor || '#333333')
  const headerTextColor = escapeHtml(data.headerTextColor || data.textColor || '#333333')
  const headerTitleAlign: 'left' | 'center' | 'right' = ['left', 'center', 'right'].includes(data.headerTitleAlign)
    ? data.headerTitleAlign
    : 'left'
  const headerDescAlign: 'left' | 'center' | 'right' = ['left', 'center', 'right'].includes(data.headerDescAlign)
    ? data.headerDescAlign
    : 'left'

  const headerHasTitle = Boolean(data.headerTitleEnabled && headerTitleText)
  const headerHasDesc = Boolean(data.headerDescEnabled && headerDescText)
  const headerHasImages = headerSourceImages.length > 0
  const hasHeaderContent = headerHasImages || headerHasTitle || headerHasDesc

  // Title and description sit on the image (used as a cover background) when
  // there is one, or on the plain background colour when there isn't. Because
  // the text is in normal flow, the block grows with it instead of overflowing.
  const titleDiv = headerHasTitle
    ? `<div style="font-size:22px; font-weight:700; line-height:1.25; margin:0; text-align:${headerTitleAlign}; font-family:'SB Sans Text'; color:${headerTitleColor} !important; -webkit-text-fill-color:${headerTitleColor} !important;">${renderSimpleText(headerTitleText)}</div>`
    : ''
  const descDiv = headerHasDesc
    ? `<div style="font-size:14px; line-height:1.5; margin:${headerHasTitle ? '10px 0 0 0' : '0'}; text-align:${headerDescAlign}; font-family:'SB Sans Text'; color:${headerTextColor} !important; -webkit-text-fill-color:${headerTextColor} !important;">${richTextToHtml(headerDescText, linkStyle)}</div>`
    : ''
  const headerTextInner = titleDiv + descDiv
  const hasHeaderText = headerHasTitle || headerHasDesc

  // Content width inside the block's 24px side padding. The explicit width
  // attribute (not just CSS) is what makes Outlook/webmail reserve space and
  // actually render the image — dropping it was part of why the image vanished.
  const headerInnerWidth = EMAIL_WIDTH - 48
  const headerImgStyle = `display:block; width:100%; max-width:${headerInnerWidth}px; height:auto; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;`
  const wrapImg = (tag: string) =>
    data.headerLinkUrl
      ? `<a href="${escapeHtml(data.headerLinkUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; border:0; display:block;">${tag}</a>`
      : tag
  const imgRow = (src: string) =>
    `<img src="${src}" width="${headerInnerWidth}" alt="${escapeHtml(data.headerAlt || '')}" class="img-fluid" style="${headerImgStyle}">`

  const headerFirstSrcRaw = headerSourceImages.find((img) => img?.src)?.src
  const headerFirstSrc = headerFirstSrcRaw ? escapeHtml(headerFirstSrcRaw) : ''
  const headerExtraImgs = headerHasImages
    ? headerSourceImages
        .slice(1)
        .map((img) => (img?.src ? `<tr><td style="padding:0; font-size:0; line-height:0;">${wrapImg(imgRow(escapeHtml(img.src)))}</td></tr>` : ''))
        .join('')
    : ''

  // Real <img> (so it renders everywhere on forward) with the text overlaid on
  // top via position:absolute. Graceful fallback in clients that strip position
  // (Outlook / some webmail): the text drops just below the image. Long text can
  // overflow the image — keep header text short or bake it into the banner.
  let headerInnerRows = ''
  if (headerFirstSrc && hasHeaderText) {
    headerInnerRows = `<tr><td style="padding:0; font-size:0; line-height:0;">
      <div style="position:relative; font-size:0; line-height:0;">
        ${wrapImg(imgRow(headerFirstSrc))}
        <div style="position:absolute; top:0; left:0; right:0; bottom:0; padding:20px; box-sizing:border-box;">${headerTextInner}</div>
      </div>
    </td></tr>${headerExtraImgs}`
  } else if (headerFirstSrc) {
    headerInnerRows = `<tr><td style="padding:0; font-size:0; line-height:0;">${wrapImg(imgRow(headerFirstSrc))}</td></tr>${headerExtraImgs}`
  } else {
    headerInnerRows = `<tr><td style="padding:20px;">${headerTextInner}</td></tr>`
  }

  const headerBlock = hasHeaderContent
    ? `
    <tr>
      <td class="px-24" data-eb-section="headerImg" style="padding:24px 24px 0 24px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="${headerBgColor}" style="background:${headerBgColor}; border:1px solid ${headerBorderColor}; border-radius:12px; overflow:hidden;">
          ${headerInnerRows}
        </table>
      </td>
    </tr>`
    : ''

  const signatureLines = [
    renderSimpleText(data.senderName || ''),
    [renderSimpleText(data.senderTitle || ''), renderSimpleText(data.senderCompany || '')]
      .filter(Boolean)
      .join(', '),
    data.senderPhone ? renderSimpleText(data.senderPhone) : '',
    ...((Array.isArray(data.senderPhones) ? data.senderPhones : []).filter(Boolean).map(escapeHtml)),
  ].filter(Boolean)

  const signatureHtml = signatureLines.map((line) => `<tr><td style="padding:0; margin:0;">${line}</td></tr>`).join('')

  const signatureImageData = data.signatureImage?.src ? data.signatureImage : null
  const signatureImageAlign = ['left', 'center', 'right'].includes(data.signatureImageAlign)
    ? data.signatureImageAlign
    : 'left'
  const signatureImageHtml = signatureImageData
    ? (() => {
        const width = Math.max(1, Math.round(Number(signatureImageData.width) || 0))
        const height = Math.max(1, Math.round(Number(signatureImageData.height) || 0))
        const src = escapeHtml(signatureImageData.src)
        const alt = escapeHtml(signatureImageData.name || 'Изображение подписи')
        return `<tr><td align="${escapeHtml(signatureImageAlign)}" style="padding:0 0 12px 0; margin:0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${escapeHtml(signatureImageAlign)}" style="border-collapse:collapse; margin:0;">
            <tr><td style="padding:0; margin:0;">
              <img src="${src}" width="${width}" height="${height}" alt="${alt}" style="display:block; width:${width}px; height:${height}px; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
            </td></tr>
          </table>
        </td></tr>`
      })()
    : ''

  const dividerBeforeSignature = data.withDivider
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="border-top:1px solid ${escapeHtml(data.dividerColor)}; font-size:0; line-height:0;">&nbsp;</td></tr>
      </table>
    `
    : ''

  const signatureSection =
    !data.withDivider && !data.withSignature
      ? ''
      : `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td height="22" style="height:22px; line-height:22px; font-size:22px;">&nbsp;</td></tr>
      </table>
      ${dividerBeforeSignature}
      ${data.withSignature ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td height="16" style="height:16px; line-height:16px; font-size:16px;">&nbsp;</td></tr>
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size:13px; line-height:1.5; color:${escapeHtml(data.mutedColor)};">
        ${signatureImageHtml}
        ${signatureHtml}
      </table>` : ''}
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td height="22" style="height:22px; line-height:22px; font-size:22px;">&nbsp;</td></tr></table>
    `

  const subjectBlock = isBuilderMode || data.hideSubject
    ? ''
    : `
      <tr>
        <td class="px-24" data-eb-section="header" style="padding:22px 24px 0 24px; font-family:'SB Sans Text'; color:${escapeHtml(data.textColor)};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="font-size:${Math.max(12, Math.min(56, Number(data.builderHeadingSize) || 22))}px; font-weight:600; line-height:1.3; padding:0; margin:0; color:${escapeHtml(data.builderHeadingColor || data.textColor || '#111111')};">
                    ${renderRteValue(data.subject || '') || subject}
                  </td>
                </tr>
              </table>
        </td>
      </tr>`

  const greetingBlock = isBuilderMode || data.hideGreeting
    ? ''
    : `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:0 0 14px 0; color:${escapeHtml(data.builderGreetingColor || data.textColor || '#111111')}; font-size:${Math.max(10, Math.min(40, Number(data.builderGreetingSize) || 14))}px; line-height:1.6;">${renderRteValue(data.greeting || '') || richTextToHtml(data.greeting || '', linkStyle)}</td></tr></table>`

  const builderBodyHtml = isBuilderMode ? buildBuilderBodyHtml(data) : ''

  return `<!doctype html>
<html lang="ru" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <title>${subject}</title>
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
    ${SB_SANS_FONT_FACE_CSS}
    html, body { margin:0 !important; padding:0 !important; width:100% !important; }
    table, td { border-collapse: collapse !important; mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
    img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    p { margin:0 0 12px 0; }
    .ExternalClass, .ExternalClass * { line-height:100%; }
    body, table, td, p, div, span, a { font-family:${SB_SANS_FONT_STACK} !important; }
    body, table, td, p, div, span { color:${safeTextColor} !important; -webkit-text-fill-color:${safeTextColor} !important; }
    a { color:${safeLinkColor} !important; -webkit-text-fill-color:${safeLinkColor} !important; }
    a span { color:${safeLinkColor} !important; -webkit-text-fill-color:${safeLinkColor} !important; }
    a[x-apple-data-detectors],
    a[x-apple-data-detectors]:hover,
    a[x-apple-data-detectors]:active,
    a[x-apple-data-detectors]:visited {
      color:${safeLinkColor} !important;
      -webkit-text-fill-color:${safeLinkColor} !important;
      text-decoration:underline !important;
      font-size:inherit !important;
      font-family:${SB_SANS_FONT_STACK} !important;
      font-weight:inherit !important;
      line-height:inherit !important;
    }
    #MessageViewBody a { color:${safeLinkColor} !important; -webkit-text-fill-color:${safeLinkColor} !important; }
    u + #body a { color:${safeLinkColor} !important; -webkit-text-fill-color:${safeLinkColor} !important; }
    @media screen and (max-width: 620px) {
      .container { width:100% !important; }
      .px-24 { padding-left:16px !important; padding-right:16px !important; }
      .py-28 { padding-top:18px !important; padding-bottom:18px !important; }
      .img-fluid { width:100% !important; height:auto !important; }
    }
  <\/style>
</head>
<body id="body" style="margin:0; padding:0; background-color:${escapeHtml(data.bgOuter)};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="display:none; font-size:1px; color:${escapeHtml(data.bgOuter)}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    <tr><td>${preheader}</td></tr>
  </table>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${escapeHtml(data.bgOuter)}; width:100%; margin:0; padding:0;">
    <tr>
      <td align="center" class="py-28" style="padding:${data.marginTop}px 0 ${data.marginBottom}px 0;">
        <!--[if mso]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="${EMAIL_WIDTH}"><tr><td><![endif]-->
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="100%"
               style="max-width:${EMAIL_WIDTH}px; background-color:${escapeHtml(data.bgBody)}; border-radius:12px; overflow:hidden;">
          ${headerBlock}
          ${subjectBlock}
          <tr>
            <td class="px-24" style="padding:18px 24px 0 24px; font-family:'SB Sans Text'; color:${escapeHtml(data.textColor)}; font-size:14px; line-height:1.6;">
              ${isBuilderMode ? builderBodyHtml : `
              <div data-eb-section="header">${greetingBlock}</div>
              <div data-eb-section="body">
              ${!data.hideIntro ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding:0 0 14px 0; color:${escapeHtml(data.textColor)};">${introHtml}</td>
                </tr>
              </table>` : ''}

              ${bullets ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                     style="font-size:14px; line-height:1.6; margin:6px 0 0 0; color:${escapeHtml(data.textColor)};">
                ${bullets}
              </table>` : ''}

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                     style="font-size:14px; line-height:1.6; color:${escapeHtml(data.textColor)};">
                ${cta}
              </table>
              </div>

              <div data-eb-section="button">${buildButtonBlock(data)}</div>
              <div data-eb-section="signature">${signatureSection}</div>
              `}
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}
