const { test, expect } = require('@playwright/test')
const { ConstructorPage } = require('./pages/constructor.page')

test.describe('UI constructor smoke suite', () => {
  test.beforeEach(async ({ page }) => {
    const app = new ConstructorPage(page)
    await app.goto()
  })

  test('loads email tab with generated preview and html output', async ({ page }) => {
    const app = new ConstructorPage(page)

    await expect(page.getByRole('button', { name: 'Письма', exact: true })).toHaveClass(/is-active/)
    await expect(page.locator('iframe[title="Email preview"]')).toBeVisible()
    await expect(page.getByText('Настройка через формы')).toBeVisible()
    await expect(app.generatedHtmlArea()).toHaveValue(/<!doctype html>/i)
  })

  test('exports email html with embedded styles and email meta tags', async ({ page }) => {
    const html = await new ConstructorPage(page).generatedHtmlArea().inputValue()

    expect(html).toMatch(/<style[\s>]/i)
    expect(html).toMatch(/<meta[^>]+http-equiv=["']Content-Type["'][^>]+charset\s*=\s*utf-?8/i)
    expect(html).toMatch(/<meta[^>]+charset=["']?utf-?8["']?/i)
    expect(html).toMatch(/<meta[^>]+name=["']viewport["']/i)
    expect(html).toMatch(/<meta[^>]+name=["']x-apple-disable-message-reformatting["']/i)
    expect(html).toMatch(/<meta[^>]+name=["']format-detection["']/i)
    expect(html).toMatch(/<html\b[^>]*xmlns:v=/i)
    expect(html).toMatch(/<html\b[^>]*xmlns:o=/i)
    expect(html).not.toMatch(/<link\b[^>]*rel=["']stylesheet["']/i)
    expect(html).not.toMatch(/@import\b/i)
    expect(html).not.toMatch(/<script\b/i)
  })

  test('updates email html and iframe preview after editing fields', async ({ page }) => {
    const app = new ConstructorPage(page)

    const titleSection = await app.openEmailInputSection('Заголовок и приветствие')
    await app.fillRichText(titleSection, 'Заголовок', 'Тестовое письмо')
    await app.fillRichText(titleSection, 'Приветствие', 'Привет!')

    const bodySection = await app.openEmailInputSection('Тело')
    await app.fillRichText(bodySection, 'Текст', 'Проверка автотеста.')

    const buttonSection = await app.openEmailInputSection('Кнопка')
    await app.fillInput(buttonSection, 'Текст кнопки', 'Открыть документ')
    await app.fillInput(buttonSection, 'URL кнопки', 'https://example.com/doc')

    const signatureSection = await app.openEmailInputSection('Подпись')
    await app.fillInput(signatureSection, 'Имя', 'Кира')

    const htmlArea = await app.generatedHtmlArea()
    await expect(htmlArea).toHaveValue(/Открыть документ/)
    await expect(htmlArea).toHaveValue(/https:\/\/example\.com\/doc/)
    await expect(htmlArea).toHaveValue(/Кира/)

    const previewSrcdoc = await page.locator('iframe[title="Email preview"]').getAttribute('srcdoc')
    expect(previewSrcdoc || '').toContain('Открыть документ')
    expect(previewSrcdoc || '').toContain('Кира')
  })

  test('strips unsafe javascript urls from generated output', async ({ page }) => {
    const app = new ConstructorPage(page)
    const buttonSection = await app.openEmailInputSection('Кнопка')

    await app.fillInput(buttonSection, 'Текст кнопки', 'Небезопасная ссылка')
    await app.fillInput(buttonSection, 'URL кнопки', 'javascript:alert(1)')

    await expect(await app.generatedHtmlArea()).not.toHaveValue(/javascript:/i)
  })

  test('switches between email fields and builder modes', async ({ page }) => {
    const app = new ConstructorPage(page)

    await app.switchToEmailBuilderMode()
    await expect(page.locator('#emailBuilderCard')).not.toHaveClass(/is-hidden/)
    await expect(page.locator('.builder-canvas')).toBeVisible()

    await app.switchToEmailFieldsMode()
    await expect(page.locator('#emailInputsCard')).not.toHaveClass(/is-hidden/)
    await expect(page.getByText('Настройка через формы')).toBeVisible()
  })

  test('switches to report tab and renders report output', async ({ page }) => {
    const app = new ConstructorPage(page)

    await app.switchToReportTab()
    await expect(page.locator('iframe[title="Report preview"]')).toBeVisible()
    await expect(page.locator('#reportInputsCard')).toContainText('Настройка через формы')
    await expect(app.generatedHtmlArea('report')).toHaveValue(/<!doctype html>/i)
  })

  test('exports report html with embedded styles and email meta tags', async ({ page }) => {
    const app = new ConstructorPage(page)

    await app.switchToReportTab()
    const html = await app.generatedHtmlArea('report').inputValue()

    expect(html).toMatch(/<style[\s>]/i)
    expect(html).toMatch(/<meta[^>]+http-equiv=["']Content-Type["'][^>]+charset\s*=\s*utf-?8/i)
    expect(html).toMatch(/<meta[^>]+charset=["']?utf-?8["']?/i)
    expect(html).toMatch(/<meta[^>]+name=["']viewport["']/i)
    expect(html).toMatch(/<meta[^>]+name=["']x-apple-disable-message-reformatting["']/i)
    expect(html).toMatch(/<meta[^>]+name=["']format-detection["']/i)
    expect(html).toMatch(/<html\b[^>]*xmlns:v=/i)
    expect(html).toMatch(/<html\b[^>]*xmlns:o=/i)
    expect(html).not.toMatch(/<link\b[^>]*rel=["']stylesheet["']/i)
    expect(html).not.toMatch(/@import\b/i)
    expect(html).not.toMatch(/<script\b/i)
    expect(html).toMatch(/Отчёт|Детали по репозиториям|Параметры запуска/i)
  })
})
