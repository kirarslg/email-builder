import { test, expect } from '@playwright/test'
import { createDefaultEmailFormData } from '../src/domain/email/defaults'
import { emailFormReducer } from '../src/domain/email/reducer'
import { buildEmailHtmlForInputs } from '../src/domain/email/render'
import { clampHexColor, escapeHtml, formatKilobytes, safeUrl } from '../src/domain/shared/html'

test.describe('email HTML renderer', () => {
  test('renders safe default email markup', () => {
    const html = buildEmailHtmlForInputs(createDefaultEmailFormData())

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<html lang="ru"')
    expect(html).toContain('width="100%"')
    expect(html).toContain('max-width:600px')
    expect(html).toContain('SB Sans Text')
    expect(html).toContain('Открыть документ')
    expect(html).toContain('text-decoration:none !important')
    expect(html).toContain('xmlns:v="urn:schemas-microsoft-com:vml"')
  })

  test('escapes user text and keeps unsafe code out of plain fields', () => {
    const data = {
      ...createDefaultEmailFormData(),
      subject: 'Релиз <script>alert(1)</script>',
      intro: 'Текст <img src=x onerror=alert(1)>',
      cta: '<b>Важно</b>',
      buttonText: 'Открыть <документ>',
    }

    const html = buildEmailHtmlForInputs(data)

    expect(html).toContain('Релиз &lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('Текст &lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('&lt;b&gt;Важно&lt;/b&gt;')
    expect(html).toContain('Открыть &lt;документ&gt;')
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
  })

  test('does not render CTA button when url is unsafe', () => {
    const data = {
      ...createDefaultEmailFormData(),
      buttonText: 'Опасная кнопка',
      buttonUrl: 'javascript:alert(1)',
    }

    const html = buildEmailHtmlForInputs(data)

    expect(html).not.toContain('Опасная кнопка')
    expect(html).not.toContain('javascript:alert(1)')
  })

  test('renders gradient button with centered text and clamped width', () => {
    const data = {
      ...createDefaultEmailFormData(),
      buttonBgMode: 'gradient' as const,
      buttonGradDir: 'tb',
      buttonBg1: '#28BD6B',
      buttonBg2: '#0B57D0',
      buttonWidth: 9999,
      buttonRadius: 12,
    }

    const html = buildEmailHtmlForInputs(data)

    expect(html).toContain('linear-gradient(to bottom, #28BD6B, #0B57D0)')
    expect(html).toContain('width:552px')
    expect(html).toContain('text-align:center')
    expect(html).toContain('<v:fill type="gradient" color="#28BD6B" color2="#0B57D0"')
  })

  test('renders builder mode blocks instead of form-mode subject and body', () => {
    const base = createDefaultEmailFormData()
    const stateWithBlock = emailFormReducer(
      {
        ...base,
        emailViewMode: 'builder',
        builderRows: [
          {
            id: 'row-1',
            layout: 1,
            columns: [{ id: 'col-1', blocks: [] }],
          },
        ],
        builderActiveColumnId: 'col-1',
      },
      { type: 'addBuilderBlock', blockType: 'text' },
    )

    const html = buildEmailHtmlForInputs(stateWithBlock)

    expect(html).toContain('Основной текст письма')
    expect(html).not.toContain('Заголовок письма')
  })
})

test.describe('shared HTML helpers', () => {
  test('escapes HTML entities', () => {
    expect(escapeHtml('<div class="x">Tom & Jerry</div>')).toBe(
      '&lt;div class=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/div&gt;',
    )
  })

  test('allows only http and https urls', () => {
    expect(safeUrl(' https://example.com/page ')).toBe('https://example.com/page')
    expect(safeUrl('http://example.com')).toBe('http://example.com')
    expect(safeUrl('mailto:test@example.com')).toBe('')
    expect(safeUrl('javascript:alert(1)')).toBe('')
  })

  test('validates hex colors and formats html size', () => {
    expect(clampHexColor('#28BD6B', '#000000')).toBe('#28BD6B')
    expect(clampHexColor('red', '#000000')).toBe('#000000')
    expect(formatKilobytes(1024)).toBe('1 KB')
    expect(formatKilobytes(1536)).toBe('1.5 KB')
  })
})
