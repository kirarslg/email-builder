const { expect } = require('@playwright/test')

class ConstructorPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    const response = await this.page.goto('/')
    if (!response || !response.ok()) {
      throw new Error('Не удалось открыть React-конструктор')
    }
    // Close onboarding modal if it auto-opened (first-visit flow).
    const onbClose = this.page.locator('.onb-skip').first()
    if (await onbClose.isVisible().catch(() => false)) {
      await onbClose.click()
    }
    await expect(this.page.getByRole('button', { name: 'Письма', exact: true })).toBeVisible()
  }

  async switchToEmailTab() {
    const tab = this.page.getByRole('button', { name: 'Письма', exact: true })
    await tab.click()
    await expect(tab).toHaveClass(/is-active/)
  }

  async switchToReportTab() {
    const tab = this.page.getByRole('button', { name: 'Отчёты', exact: true })
    await tab.click()
    await expect(tab).toHaveClass(/is-active/)
  }

  async switchToEmailFieldsMode() {
    await this.switchToEmailTab()
    const btn = this.page.locator('.email-pane:not(.is-hidden) .email-view-toggle button[title="Режим полей"]')
    await btn.click()
    await expect(btn).toHaveClass(/is-active/)
  }

  async switchToEmailBuilderMode() {
    await this.switchToEmailTab()
    const btn = this.page.locator('.email-pane:not(.is-hidden) .email-view-toggle button[title="Режим конструктора"]')
    await btn.click()
    await expect(btn).toHaveClass(/is-active/)
  }

  async openSection(title) {
    const section = this.page
      .locator('section.ui-accordion')
      .filter({ has: this.page.getByRole('heading', { name: title, level: 3 }) })
      .first()

    await expect(section.locator('.ui-accordion__head')).toBeVisible()

    const isOpen = await section.getAttribute('data-open')
    if (isOpen !== 'true') {
      await section.locator('.ui-accordion__head').click()
      await expect(section).toHaveAttribute('data-open', 'true')
    }
    return section
  }

  async openHtmlAccordion(sectionId = 'emailOutputSection') {
    const section = this.page.locator(`section#${sectionId}`)
    await expect(section).toBeVisible()
    const isOpen = await section.getAttribute('data-open')
    if (isOpen !== 'true') {
      await section.locator('.csec__head').click()
      await expect(section).toHaveAttribute('data-open', 'true')
    }
    return section
  }

  async generatedHtmlArea(sectionId = 'emailOutputSection') {
    await this.openHtmlAccordion(sectionId)
    return this.page.locator(`#${sectionId} textarea.ui-textarea`)
  }
}

module.exports = { ConstructorPage }
