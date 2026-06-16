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
  // HTML from contentEditable — pass through inline styles (font-size, font-weight, etc.)
  // Strip only dangerous tags (script, iframe, object) but keep spans/b/i/u/br
  if (/<[a-z][\s\S]*>/i.test(input)) {
    return input
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[\s\S]*?<\/object>/gi, '')
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

function renderHtmlButton(options: {
  href: string
  text: string
  width: number
  height: number
  radius: number
  fontSize: number
  fg: string
  bg: string
  align: 'left' | 'center' | 'right'
}): string {
  const { href, text, width, height, radius, fontSize, fg, bg, align } = options

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${escapeHtml(align)}">
    <tr>
      <td bgcolor="${bg.includes('gradient(') ? '' : bg}" style="background:${bg}; border-radius:${radius}px; text-decoration:none; border-bottom:0;">
        <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; width:${width}px; height:${height}px; line-height:${height}px; padding:0; font-family:'SB Sans Text'; font-size:${fontSize}px; font-weight:600; color:${fg} !important; -webkit-text-fill-color:${fg} !important; text-decoration:none !important; text-align:center; border-radius:${radius}px; box-sizing:border-box; background:${bg}; border-bottom:0;">
          <span style="text-decoration:none !important; color:${fg} !important; -webkit-text-fill-color:${fg} !important; border-bottom:0;">${escapeHtml(text)}</span>
        </a>
      </td>
    </tr>
  </table>`
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
  const height = buttonSize === 's' ? 36 : 44
  const fontSize = buttonSize === 's' ? 13 : 14
  const contentMaxWidth = EMAIL_WIDTH - 48
  const widthPx = Math.max(80, Math.min(Number(data.buttonWidth ?? contentMaxWidth), contentMaxWidth))
  const isGradient = data.buttonBgMode === 'gradient'
  const cssDir = gradDirectionToCss(data.buttonGradDir || 'lr')
  const cssBg = isGradient ? `linear-gradient(${cssDir}, ${c1}, ${c2})` : c1

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td class="px-24" align="${escapeHtml(btnAlign)}" bgcolor="${escapeHtml(padBg)}" style="background:${escapeHtml(padBg)}; padding: 18px 0 14px 0;">
          ${renderHtmlButton({
            href: safeButtonUrl,
            text: data.buttonText,
            width: widthPx,
            height,
            radius,
            fontSize,
            fg,
            bg: cssBg,
            align: btnAlign,
          })}
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
  const height = buttonSize === 's' ? 36 : 44
  const fontSize = buttonSize === 's' ? 13 : 14
  const isGradient = data.buttonBgMode === 'gradient'
  const cssDir = gradDirectionToCss(data.buttonGradDir || 'lr')
  const cssBg = isGradient ? `linear-gradient(${cssDir}, ${c1}, ${c2})` : c1

  return `<tr>
    <td style="padding:0 0 12px 0;">
      ${renderHtmlButton({
        href: safeButtonUrl,
        text: blockText,
        width,
        height,
        radius,
        fontSize,
        fg,
        bg: cssBg,
        align: 'left',
      })}
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

  const overlayInner = (() => {
    const parts: string[] = []
    if (data.headerTitleEnabled && headerTitleText) {
      parts.push(
        `<div style="font-size:22px; font-weight:700; line-height:1.25; margin:0; color:${escapeHtml(data.textColor)} !important; -webkit-text-fill-color:${escapeHtml(data.textColor)} !important; font-family:'SB Sans Text';">${renderSimpleText(data.headerTitle || '')}</div>`,
      )
    }
    if (data.headerDescEnabled && headerDescText) {
      parts.push(
        `<div style="font-size:14px; line-height:1.5; margin:10px 0 0 0; color:${escapeHtml(data.textColor)} !important; -webkit-text-fill-color:${escapeHtml(data.textColor)} !important; font-family:'SB Sans Text';">${richTextToHtml(headerDescText, linkStyle)}</div>`,
      )
    }
    return parts.join('')
  })()

  const hasOverlayText = Boolean(overlayInner)

  const headerImg = headerSourceImages.length
    ? headerSourceImages
        .map((img) => {
          const src = img?.src ? escapeHtml(img.src) : ''
          if (!src) return ''
          return `
    <tr>
      <td style="padding:0; margin:0;">
        ${data.headerLinkUrl ? `<a href="${escapeHtml(data.headerLinkUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; border:0;">` : ''}
          <img src="${src}"
               width="${EMAIL_WIDTH}" height="200"
               alt="${escapeHtml(data.headerAlt || '')}"
               class="img-fluid" style="display:block; width:${EMAIL_WIDTH}px; height:200px; max-width:100%; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
        ${data.headerLinkUrl ? '</a>' : ''}
      </td>
    </tr>`
        })
        .join('')
    : ''

  const headerHero = (() => {
    if (!hasOverlayText) return ''
    if (!headerSourceImages.length) {
      const padTitle =
        data.headerTitleEnabled && headerTitleText
          ? `<tr><td class="px-24" style="padding:18px 24px 0 24px; font-family:'SB Sans Text'; color:${escapeHtml(data.textColor)} !important; -webkit-text-fill-color:${escapeHtml(data.textColor)} !important;"><div style="font-size:20px; font-weight:700; line-height:1.25; margin:0;">${renderSimpleText(headerTitleText)}</div></td></tr>`
          : ''
      const padDesc =
        data.headerDescEnabled && headerDescText
          ? `<tr><td class="px-24" style="padding:10px 24px 0 24px; font-family:'SB Sans Text'; color:${escapeHtml(data.textColor)} !important; -webkit-text-fill-color:${escapeHtml(data.textColor)} !important;"><div style="font-size:14px; line-height:1.5; margin:0;">${richTextToHtml(headerDescText, linkStyle)}</div></td></tr>`
          : ''
      return padTitle + padDesc
    }

    const firstSrc = headerSourceImages[0]?.src ? escapeHtml(headerSourceImages[0].src) : ''
    if (!firstSrc) return ''

    const linkOpen = data.headerLinkUrl
      ? `<a href="${escapeHtml(data.headerLinkUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; border:0; display:block;">`
      : ''
    const linkClose = data.headerLinkUrl ? '</a>' : ''

    return `
    <tr>
      <td style="padding:0; margin:0; vertical-align:top;">
        ${linkOpen}
          <div style="display:block; position:relative; width:${EMAIL_WIDTH}px; height:200px; max-width:100%; overflow:hidden;">
            <img src="${firstSrc}"
                 width="${EMAIL_WIDTH}" height="200"
                 alt="${escapeHtml(data.headerAlt || '')}"
                 class="img-fluid" style="display:block; width:${EMAIL_WIDTH}px; height:200px; max-width:100%; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
            <div style="position:absolute; top:18px; left:24px; right:24px; bottom:24px; z-index:1;">
              ${overlayInner}
            </div>
          </div>
        ${linkClose}
      </td>
    </tr>`
  })()

  const headerRemainderImgs =
    hasOverlayText && headerSourceImages.length > 1
      ? headerSourceImages
          .slice(1)
          .map((img) => {
            const src = img?.src ? escapeHtml(img.src) : ''
            if (!src) return ''
            return `
    <tr>
      <td style="padding:0; margin:0;">
        <img src="${src}"
             width="${EMAIL_WIDTH}" height="200"
             alt="${escapeHtml(data.headerAlt || '')}"
             class="img-fluid" style="display:block; width:${EMAIL_WIDTH}px; height:200px; max-width:100%; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
      </td>
    </tr>`
          })
          .join('')
      : ''

  const headerBlock = hasOverlayText ? headerHero + headerRemainderImgs : headerImg

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
        <td class="px-24" style="padding:22px 24px 0 24px; font-family:'SB Sans Text'; color:${escapeHtml(data.textColor)};">
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
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="100%"
               style="max-width:${EMAIL_WIDTH}px; background-color:${escapeHtml(data.bgBody)}; border-radius:12px; overflow:hidden;">
          ${headerBlock}
          ${subjectBlock}
          <tr>
            <td class="px-24" style="padding:18px 24px 0 24px; font-family:'SB Sans Text'; color:${escapeHtml(data.textColor)}; font-size:14px; line-height:1.6;">
              ${isBuilderMode ? builderBodyHtml : `
              ${greetingBlock}
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

              ${buildButtonBlock(data)}
              ${signatureSection}
              `}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
