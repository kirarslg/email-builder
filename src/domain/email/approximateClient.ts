/**
 * Approximate how desktop Outlook (the Word rendering engine) would show the
 * generated HTML, for an in-app preview. This is intentionally a rough
 * approximation — it does not run a real Outlook renderer — but it surfaces the
 * differences users hit most: squared corners, flattened gradients/backgrounds,
 * and overlay text that drops below its image.
 */

const COLOR = /#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/

export function approximateOutlookHtml(html: string): string {
  let out = html

  // Outlook ignores rounded corners.
  out = out.replace(/border-radius\s*:\s*[^;"']+;?/gi, '')

  // Gradients collapse to a single flat colour (the first one).
  out = out.replace(/background(?:-image)?\s*:\s*linear-gradient\([^)]*\)\s*;?/gi, (match) => {
    const color = match.match(COLOR)
    return color ? `background:${color[0]};` : ''
  })

  // Background images are dropped (kept colour only).
  out = out.replace(/background-image\s*:\s*url\([^)]*\)\s*;?/gi, '')
  out = out.replace(/background\s*:\s*([^;"']*?)url\([^)]*\)[^;"']*;?/gi, (_match, pre) => {
    const color = String(pre).match(COLOR)
    return color ? `background:${color[0]};` : ''
  })

  // No CSS positioning: overlay text falls back into normal flow (below the
  // image), which is what Outlook/Gmail do when they strip `position`.
  out = out.replace(/position\s*:\s*(?:absolute|relative|fixed)\s*;?/gi, '')

  return out
}
