export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function safeUrl(value: unknown): string {
  const url = String(value || '').trim()
  if (!url) return ''
  if (/^https?:\/\/.+/i.test(url)) return url
  return ''
}

export function clampHexColor(value: unknown, fallback: string): string {
  const color = String(value || '').trim()
  if (!color) return fallback
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return color
  return fallback
}

export function formatKilobytes(size: number): string {
  const kb = Number(size || 0) / 1024
  const normalized = kb >= 100 ? Math.round(kb) : Math.round(kb * 10) / 10
  return `${normalized} Кб`
}

/**
 * Build a safe file name (without extension) from a possibly-HTML title.
 * Strips tags, trims, collapses whitespace to "_", drops unsafe chars.
 * Falls back to `fallback` when nothing usable remains.
 */
export function slugifyFilename(raw: string, fallback: string): string {
  const text = String(raw || '')
    .replace(/<[^>]*>/g, ' ')        // strip HTML tags
    .replace(/&[a-z]+;/gi, ' ')      // strip entities
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return fallback
  const slug = text
    .replace(/[\\/:*?"<>|]+/g, '') // chars illegal in filenames
    .replace(/\s+/g, '_')
    .slice(0, 80)
  return slug || fallback
}
