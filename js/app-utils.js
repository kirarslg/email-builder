(function () {
  'use strict'

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')

  function safeUrl(value) {
    const url = String(value || '').trim()
    if (!url) return ''
    if (/^https?:\/\/.+/i.test(url)) return url
    return ''
  }

  function formatKilobytes(size) {
    const kb = Number(size || 0) / 1024
    const value = kb >= 100 ? Math.round(kb) : Math.round(kb * 10) / 10
    return `${value} KB`
  }

  function clampHexColor(value, fallback) {
    const color = String(value || '').trim()
    if (!color) return fallback
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return color
    return fallback
  }

  function sanitizeCssColor(value, fallback = '#000000') {
    const color = String(value || '').trim()
    const safeFallback = String(fallback || '#000000').trim()
    if (!color) return safeFallback
    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) return color
    if (/^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*,\s*(?:0|1|0?\.\d+|\.\d+|\d{1,3}%))?\s*\)$/i.test(color)) return color
    if (/^hsla?\(\s*-?\d+(?:deg|rad|turn)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+|\.\d+|\d{1,3}%))?\s*\)$/i.test(color)) return color
    if (/^(?:transparent|currentColor|inherit)$/i.test(color)) return color
    return safeFallback
  }

  function sanitizeCssUrl(value) {
    const url = String(value || '').trim().replace(/^['"]|['"]$/g, '')
    if (!url) return ''
    if (/^https?:\/\/[^\s"'<>\\]+$/i.test(url)) return url
    if (/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(url)) return url
    return ''
  }

  function sanitizeCssBackground(value, fallback = '#232323') {
    const raw = String(value || '').trim()
    const safeFallback = sanitizeCssColor(fallback, '#232323')
    if (!raw) return safeFallback

    const compact = raw.replace(/<\/style/gi, '').replace(/[\r\n]+/g, ' ').trim()
    if (!compact || compact.length > 4000 || /[<>{}]/.test(compact)) return safeFallback
    if (/(?:javascript\s*:|expression\s*\(|@import)/i.test(compact)) return safeFallback

    const urlMatch = compact.match(/^url\(\s*(['"]?)(.*?)\1\s*\)\s*(.*)$/i)
    if (urlMatch) {
      const safeUrlValue = sanitizeCssUrl(urlMatch[2])
      if (!safeUrlValue) return safeFallback
      const suffix = String(urlMatch[3] || '').trim()
      if (suffix && !/^[\w\s.%/-]+$/.test(suffix)) return `url("${safeUrlValue}")`
      return `url("${safeUrlValue}")${suffix ? ` ${suffix}` : ''}`
    }

    const color = sanitizeCssColor(compact, '')
    if (color) return color

    if (
      /gradient\s*\(/i.test(compact) &&
      !/url\s*\(/i.test(compact) &&
      !/;/.test(compact) &&
      /^[#a-z0-9\s.,()%+-]+$/i.test(compact)
    ) {
      return compact
    }

    return safeFallback
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  window.AppUtils = {
    escapeHtml,
    esc: escapeHtml,
    safeUrl,
    formatKilobytes,
    clampHexColor,
    sanitizeCssColor,
    sanitizeCssUrl,
    sanitizeCssBackground,
    fileToDataUrl,
  }
})()
