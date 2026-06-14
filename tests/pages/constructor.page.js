const { expect } = require('@playwright/test')

class ConstructorPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    const response = await this.page.goto('/Email%20builder.html')
    if (!response || !response.ok()) {
      throw new Error('Не удалось открыть React-конструктор')
    }
    await expect(this.page.getByRole('button', { name: 'Письмо', exact: true })).toBeVisible()
  }

  async switchToEmailTab() {
    const tab = this.page.getByRole('button', { name: 'Письмо', exact: true })
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
    const tab = this.page.locator('#emailModeInputs')
    await tab.click()
    await expect(tab).toHaveClass(/is-active/)
  }

  async switchToEmailBuilderMode() {
    await this.switchToEmailTab()
    const tab = this.page.locator('#emailModeBuilder')
    await tab.click()
    await expect(tab).toHaveClass(/is-active/)
  }

  async openSection(title) {
    const section = this.page
      .locator('section.csec')
      .filter({ has: this.page.getByRole('heading', { name: title }) })
      .first()

    await expect(section.locator('.csec__head')).toBeVisible()

    const isOpen = await section.getAttribute('data-open')
    if (isOpen !== 'true') {
      await section.locator('.csec__head').click()
      await expect(section).toHaveAttribute('data-open', 'true')
    }

    return section
  }

  generatedHtmlArea() {
    return this.page.locator('textarea.codearea').first()
  }
}

module.exports = { ConstructorPage }
