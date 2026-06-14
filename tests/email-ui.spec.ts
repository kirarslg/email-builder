import { test, expect, type Page } from '@playwright/test'

async function openApp(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('onboarding_done_v1', '1')
  })
  await page.goto('/')
}

function fieldInput(page: Page, label: string) {
  return page
    .locator('.ui-field')
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator('input, textarea, [contenteditable="true"]')
    .first()
}

async function openHtmlOutput(page: Page) {
  const section = page.locator('#emailOutputSection')
  const trigger = section.getByRole('button', { name: /HTML письма/i })
  if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
    await trigger.click()
  }
  return section.locator('textarea')
}

test.describe('email constructor UI', () => {
  test('opens default email constructor without onboarding overlay', async ({ page }) => {
    await openApp(page)

    await expect(page.getByRole('navigation', { name: 'Разделы' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Письма' })).toHaveClass(/is-active/)
    await expect(page.getByText('Настройка через формы')).toBeVisible()
    await expect(page.getByText('Превью письма')).toBeVisible()
    await expect(page.getByTitle('Копировать HTML')).toBeVisible()
  })

  test('updates button text, url and exported html from form mode', async ({ page }) => {
    await openApp(page)

    await page.getByRole('button', { name: /Кнопка/ }).click()
    await fieldInput(page, 'Текст кнопки').fill('Перейти к релизу')
    await fieldInput(page, 'URL кнопки').fill('https://example.com/release')

    const preview = page.frameLocator('iframe[title="Email preview"]')
    await expect(preview.getByRole('link', { name: 'Перейти к релизу' })).toHaveAttribute(
      'href',
      'https://example.com/release',
    )

    const htmlOutput = await openHtmlOutput(page)
    await expect(htmlOutput).toContainText('Перейти к релизу')
    await expect(htmlOutput).toContainText('https://example.com/release')
  })

  test('does not put an unsafe button url into preview html', async ({ page }) => {
    await openApp(page)

    await page.getByRole('button', { name: /Кнопка/ }).click()
    await fieldInput(page, 'Текст кнопки').fill('Опасная ссылка')
    await fieldInput(page, 'URL кнопки').fill('javascript:alert(1)')

    const preview = page.frameLocator('iframe[title="Email preview"]')
    await expect(preview.getByRole('link', { name: 'Опасная ссылка' })).toHaveCount(0)

    const htmlOutput = await openHtmlOutput(page)
    await expect(htmlOutput).not.toContainText('javascript:alert(1)')
  })

  test('switches to builder mode and adds a text block to canvas', async ({ page }) => {
    await openApp(page)

    await page.getByTitle('Режим конструктора').click()
    await expect(page.getByText('Настройка через конструктор')).toBeVisible()

    await page
      .locator('.builder-block-btn')
      .filter({ has: page.getByText('Текст', { exact: true }) })
      .click()

    await expect(page.locator('.eb-block')).toContainText('Основной текст письма')
    await expect(page.locator('.builder-node')).toContainText('Основной текст письма')
  })

  test('switches to report and help sections from top navigation', async ({ page }) => {
    await openApp(page)

    await page.getByRole('button', { name: 'Отчёты' }).click()
    await expect(page.locator('#tab-report')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Отчёты' })).toHaveClass(/is-active/)

    await page.getByRole('button', { name: 'Справка' }).click()
    await expect(page.locator('#tab-help')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Справка' })).toHaveClass(/is-active/)
  })
})
