const { test, expect } = require('@playwright/test')
const { ConstructorPage } = require('./pages/constructor.page')

async function openApp(page) {
  const app = new ConstructorPage(page)
  await app.goto()
  return app
}

test.describe('UI interaction coverage', () => {
  test('closes onboarding and remembers the choice after reload', async ({ page }) => {
    const app = new ConstructorPage(page)
    await app.goto({ skipOnboarding: false })

    const dialog = page.getByRole('dialog', { name: 'Онбординг' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Добро пожаловать!' })).toBeVisible()

    await dialog.getByRole('button', { name: 'Пропустить' }).click()
    await expect(dialog).toBeHidden()

    await page.reload()
    await expect(page.getByRole('dialog', { name: 'Онбординг' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Письма', exact: true })).toBeVisible()

    const onboardingFlag = await page.evaluate(() => window.localStorage.getItem('onboarding_done_v1'))
    expect(onboardingFlag).toBe('1')
  })

  test('opens and collapses email accordion sections', async ({ page }) => {
    const app = await openApp(page)
    const buttonSection = app.emailInputSection('Кнопка')

    await expect(buttonSection).toHaveAttribute('data-open', 'false')

    await buttonSection.locator('.ui-accordion__head').click()
    await expect(buttonSection).toHaveAttribute('data-open', 'true')
    await expect(buttonSection).toContainText('Текст кнопки')
    await expect(buttonSection).toContainText('URL кнопки')

    await buttonSection.locator('.ui-accordion__head').click()
    await expect(buttonSection).toHaveAttribute('data-open', 'false')
  })

  test('updates button layout through custom dropdowns and color fields', async ({ page }) => {
    const app = await openApp(page)
    const buttonSection = await app.openEmailInputSection('Кнопка')

    await app.fillInput(buttonSection, 'Текст кнопки', 'Перейти в релиз')
    await app.fillInput(buttonSection, 'URL кнопки', 'https://example.com/release')
    await app.fillInput(buttonSection, 'Ширина кнопки', '260')
    await app.selectDropdown(buttonSection, 'Положение', 'Справа')
    await app.selectDropdown(buttonSection, 'Размер', 'S')
    await app.selectDropdown(buttonSection, 'Тип цвета кнопки', 'Градиент')
    await app.fillInput(buttonSection, 'Цвет №1', '#123456')
    await app.fillInput(buttonSection, 'Цвет №2', '#abcdef')

    const html = await app.generatedHtmlArea().inputValue()
    expect(html).toContain('Перейти в релиз')
    expect(html).toContain('https://example.com/release')
    expect(html).toMatch(/align="right"/i)
    expect(html).toMatch(/width:260px/i)
    expect(html).toMatch(/height:36px/i)
    expect(html).toMatch(/text-align:center/i)
    expect(html).toMatch(/linear-gradient\(to right, #123456, #abcdef\)/i)
  })

  test('resets email form values back to defaults', async ({ page }) => {
    const app = await openApp(page)
    const bodySection = await app.openEmailInputSection('Тело')

    await app.fillRichText(bodySection, 'Текст', 'Текст после правки')
    await expect(app.generatedHtmlArea()).toHaveValue(/Текст после правки/)

    await page.getByRole('button', { name: 'Сбросить к дефолтам' }).click()

    await expect(app.generatedHtmlArea()).not.toHaveValue(/Текст после правки/)
    await expect(app.generatedHtmlArea()).toHaveValue(/Пример ссылки в тексте/)
  })

  test('copies generated email html and opens download menu', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__copiedHtml = text
          },
        },
      })
    })

    await openApp(page)

    await page.locator('#emailResultCard button[title="Копировать HTML"]').click()
    await expect(page.locator('#emailResultCard button[title="Скопировано!"]')).toBeVisible()

    const copiedHtml = await page.evaluate(() => window.__copiedHtml)
    expect(copiedHtml).toMatch(/<!doctype html>/i)

    await page.locator('#emailResultCard button[title="Скачать"]').click()
    await expect(page.locator('#emailResultCard [role="menuitem"]', { hasText: 'Скачать HTML' })).toBeVisible()
    await expect(page.locator('#emailResultCard [role="menuitem"]', { hasText: 'Скачать .EML' })).toBeVisible()
  })

  test('adds and edits a text block in visual builder mode', async ({ page }) => {
    const app = await openApp(page)
    await app.switchToEmailBuilderMode()

    await page.locator('#emailBuilderCard .builder-block-btn', { hasText: 'Текст' }).click()

    const textBlock = page.locator('.eb-block').filter({ hasText: 'Основной текст' }).first()
    await expect(textBlock).toBeVisible()

    await textBlock.locator('.eb-text').dblclick()
    const editor = page.locator('.eb-text.is-editing').first()
    await editor.fill('Текст из визуального конструктора')
    await page.mouse.click(12, 12)

    await expect(app.generatedHtmlArea()).toHaveValue(/Текст из визуального конструктора/)
  })

  test('adds a two-column row in visual builder mode', async ({ page }) => {
    await openApp(page)
    const app = new ConstructorPage(page)
    await app.switchToEmailBuilderMode()

    await page.locator('#emailBuilderCard .builder-layout-btn').nth(1).click()

    const lastRow = page.locator('.eb-row').last()
    await expect(lastRow.locator('.eb-col')).toHaveCount(2)
  })

  test('updates report header fields and can hide the report header section', async ({ page }) => {
    const app = await openApp(page)
    const headerSection = await app.openReportSection('Шапка')

    await app.fillInput(headerSection, 'Заголовок', 'Отчёт автотеста')
    await app.fillInput(headerSection, 'Статус', 'Passed')

    await expect(app.generatedHtmlArea('report')).toHaveValue(/Отчёт автотеста/)
    await expect(app.generatedHtmlArea('report')).toHaveValue(/Passed/)

    await headerSection.getByLabel('Показывать шапку').uncheck()

    await expect(app.generatedHtmlArea('report')).not.toHaveValue(/Отчёт автотеста/)
  })

  test('help page links navigate to the highlighted builder area', async ({ page }) => {
    const app = await openApp(page)

    await app.switchToHelpTab()
    await page.getByRole('button', { name: 'Открыть конструктор' }).click()

    await expect(page.getByRole('button', { name: 'Письма', exact: true })).toHaveClass(/is-active/)
    await expect(page.locator('#emailBuilderCard')).not.toHaveClass(/is-hidden/)
    await expect(page.locator('#emailBuilderCard')).toHaveClass(/help-highlight/)
  })
})
