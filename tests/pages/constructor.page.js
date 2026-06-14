const { expect } = require('@playwright/test')

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

class ConstructorPage {
  constructor(page) {
    this.page = page
  }

  async goto({ skipOnboarding = true } = {}) {
    if (skipOnboarding) {
      await this.page.addInitScript(() => {
        window.localStorage.setItem('onboarding_done_v1', '1')
      })
    }

    const response = await this.page.goto('/Email%20builder.html')
    if (!response || !response.ok()) {
      throw new Error('Не удалось открыть React-конструктор')
    }

    await expect(this.page.getByRole('button', { name: 'Письма', exact: true })).toBeVisible()

    if (skipOnboarding) {
      await expect(this.page.getByRole('dialog', { name: 'Онбординг' })).toBeHidden()
    }
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
    await expect(this.page.locator('#tab-report')).toBeVisible()
  }

  async switchToHelpTab() {
    const tab = this.page.getByRole('button', { name: 'Справка', exact: true })
    await tab.click()
    await expect(tab).toHaveClass(/is-active/)
    await expect(this.page.locator('#tab-help')).toBeVisible()
  }

  async switchToEmailFieldsMode() {
    await this.switchToEmailTab()
    const hiddenBuilder = await this.page.locator('#emailBuilderCard').evaluate((el) => el.classList.contains('is-hidden')).catch(() => true)
    if (!hiddenBuilder) {
      await this.page.locator('#emailBuilderCard button[title="Режим полей"]').click()
    }
    await expect(this.page.locator('#emailInputsCard')).not.toHaveClass(/is-hidden/)
  }

  async switchToEmailBuilderMode() {
    await this.switchToEmailTab()
    const hiddenBuilder = await this.page.locator('#emailBuilderCard').evaluate((el) => el.classList.contains('is-hidden'))
    if (hiddenBuilder) {
      await this.page.locator('#emailInputsCard button[title="Режим конструктора"]').click()
    }
    await expect(this.page.locator('#emailBuilderCard')).not.toHaveClass(/is-hidden/)
  }

  emailInputSection(title) {
    return this.page
      .locator('#emailInputsCard .ui-accordion')
      .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) })
      .first()
  }

  reportSection(title) {
    return this.page
      .locator('#reportInputsCard .ui-accordion')
      .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) })
      .first()
  }

  async openAccordion(section) {
    await expect(section).toBeAttached()
    const isOpen = await section.getAttribute('data-open')
    if (isOpen !== 'true') {
      await section.locator('.ui-accordion__head').first().click()
      await expect(section).toHaveAttribute('data-open', 'true')
    }
    return section
  }

  async openEmailInputSection(title) {
    await this.switchToEmailFieldsMode()
    return this.openAccordion(this.emailInputSection(title))
  }

  async openReportSection(title) {
    await this.switchToReportTab()
    return this.openAccordion(this.reportSection(title))
  }

  fieldByLabel(scope, label) {
    const labelPattern = new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`)
    return scope
      .locator('.ui-field')
      .filter({ has: this.page.locator('label.ui-label', { hasText: labelPattern }) })
      .first()
  }

  async fillInput(scope, label, value) {
    const field = this.fieldByLabel(scope, label)
    await field.locator('input.ui-input').first().fill(String(value))
  }

  async fillTextarea(scope, label, value) {
    const field = this.fieldByLabel(scope, label)
    await field.locator('textarea.ui-textarea, textarea.ui-input').first().fill(String(value))
  }

  async fillRichText(scope, label, value) {
    const field = this.fieldByLabel(scope, label)
    const editor = field.locator('.ui-rte__editor').first()
    await editor.click()
    await editor.fill(String(value))
    await expect(editor).toContainText(String(value))
  }

  async selectDropdown(scope, label, optionLabel) {
    const field = this.fieldByLabel(scope, label)
    await field.locator('.custom-dropdown__trigger').click()
    await field.locator('.custom-dropdown__option', { hasText: optionLabel }).first().click()
    await expect(field.locator('.custom-dropdown__label')).toContainText(optionLabel)
  }

  async openOutput(sectionId) {
    const section = this.page.locator(sectionId)
    const isOpen = await section.getAttribute('data-open')
    if (isOpen !== 'true') {
      await section.locator('.csec__head').click()
      await expect(section).toHaveAttribute('data-open', 'true')
    }
    return section
  }

  generatedHtmlArea(kind = 'email') {
    const id = kind === 'report' ? '#reportOutputSection' : '#emailOutputSection'
    return this.page.locator(`${id} textarea.mono.ui-textarea`).first()
  }
}

module.exports = { ConstructorPage }
