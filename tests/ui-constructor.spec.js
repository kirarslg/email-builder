const { test, expect } = require('@playwright/test')
const { ConstructorPage } = require('./pages/constructor.page')

test.describe('UI constructor smoke suite', () => {
  test.beforeEach(async ({ page }) => {
    const app = new ConstructorPage(page)
    await app.goto()
  })

  test('loads email tab with generated preview and html output', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Письмо' })).toHaveClass(/is-active/)
    await expect(page.locator('iframe[title="Email preview"]')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Форма' })).toBeVisible()
    await expect(new ConstructorPage(page).generatedHtmlArea()).toHaveValue(/<!doctype html>/i)
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

    await app.switchToEmailFieldsMode()

    await page.locator('.ui-field').filter({ hasText: 'Заголовок письма' }).locator('input').fill('Тестовое письмо')
    await page.locator('.ui-field').filter({ hasText: 'Приветствие' }).locator('textarea').fill('Привет!')
    await page.locator('.ui-field').filter({ hasText: 'Текст письма' }).locator('textarea').fill('Проверка автотеста.')
    await page.locator('.ui-field').filter({ hasText: 'Текст кнопки' }).locator('input').fill('Открыть документ')
    await page.locator('.ui-field').filter({ hasText: 'URL кнопки' }).locator('input').fill('https://example.com/doc')
    await page.locator('.ui-field').filter({ hasText: 'Имя отправителя' }).locator('textarea').fill('Кира')

    const htmlArea = app.generatedHtmlArea()
    await expect(htmlArea).toHaveValue(/Тестовое письмо/)
    await expect(htmlArea).toHaveValue(/Проверка автотеста\./)
    await expect(htmlArea).toHaveValue(/https:\/\/example\.com\/doc/)
    await expect(htmlArea).toHaveValue(/Кира/)

    const previewSrcdoc = await page.locator('iframe[title="Email preview"]').getAttribute('srcdoc')
    expect(previewSrcdoc || '').toContain('Проверка автотеста.')
    expect(previewSrcdoc || '').toContain('Кира')
  })

  test('strips unsafe javascript urls from generated output', async ({ page }) => {
    const app = new ConstructorPage(page)

    await app.switchToEmailFieldsMode()

    await page.locator('.ui-field').filter({ hasText: 'Текст кнопки' }).locator('input').fill('Небезопасная ссылка')
    await page.locator('.ui-field').filter({ hasText: 'URL кнопки' }).locator('input').fill('javascript:alert(1)')

    await expect(app.generatedHtmlArea()).not.toHaveValue(/javascript:/i)
  })

  test('switches between email fields and builder modes', async ({ page }) => {
    const app = new ConstructorPage(page)

    await app.switchToEmailBuilderMode()
    await expect(page.locator('.builder-workbench')).toBeVisible()
    await expect(page.locator('#emailModeBuilder')).toHaveClass(/is-active/)

    await app.switchToEmailFieldsMode()
    await expect(page.locator('#emailModeInputs')).toHaveClass(/is-active/)
  })

  test('switches to report tab and renders report output', async ({ page }) => {
    const app = new ConstructorPage(page)

    await app.switchToReportTab()
    await expect(page.locator('iframe[title="Report preview"]')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Настройки' })).toBeVisible()
    await expect(app.generatedHtmlArea()).toHaveValue(/<!doctype html>/i)
  })

  test('exports report html with embedded styles and email meta tags', async ({ page }) => {
    const app = new ConstructorPage(page)

    await app.switchToReportTab()
    const html = await app.generatedHtmlArea().inputValue()
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
    expect(html).toMatch(/Сводная статистика|Детали по репозиториям|Параметры запуска/i)
  })
})
