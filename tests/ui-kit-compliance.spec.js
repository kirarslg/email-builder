const { test, expect } = require('@playwright/test')
const fs = require('node:fs')
const path = require('node:path')
const { ConstructorPage } = require('./pages/constructor.page')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', 'coverage', 'playwright-report', 'test-results'].includes(entry.name)) continue
      files.push(...walk(fullPath))
      continue
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(fullPath)
  }

  return files
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
}

function sourceFiles() {
  return walk(SRC).map((filePath) => ({ path: rel(filePath), content: fs.readFileSync(filePath, 'utf8') }))
}

function expectNoViolations(violations, message) {
  expect(violations, `${message}\n${violations.join('\n')}`).toEqual([])
}

test.describe('UI kit compliance: static code audit', () => {
  test('does not add native selects, native color inputs or third-party form kits outside the approved kit layer', () => {
    const violations = []

    for (const file of sourceFiles()) {
      if (/<select\b/i.test(file.content)) {
        violations.push(`${file.path}: native <select> is forbidden; use SelectField/custom dropdown from the kit`)
      }

      if (/<input\b[^>]*type=["']color["']/i.test(file.content)) {
        violations.push(`${file.path}: native input[type=color] is forbidden; use ColorField/ColorPicker from the kit`)
      }

      const forbiddenImports = [
        ['react-select', /from\s+["']react-select["']/],
        ['antd', /from\s+["']antd(?:\/[^"']*)?["']/],
        ['MUI', /from\s+["']@mui\//],
        ['Headless UI', /from\s+["']@headlessui\//],
      ]

      for (const [name, pattern] of forbiddenImports) {
        if (pattern.test(file.content)) {
          violations.push(`${file.path}: ${name} import is forbidden for constructor controls; wrap the approved kit component instead`)
        }
      }

      if (/from\s+["']react-colorful["']/.test(file.content) && file.path !== 'src/components/ui/color-picker.tsx') {
        violations.push(`${file.path}: react-colorful must be used only inside src/components/ui/color-picker.tsx`)
      }
    }

    expectNoViolations(violations, 'Found UI controls that bypass the approved kit layer.')
  })

  test('keeps raw form controls isolated in kit files or documented complex editor exceptions', () => {
    const allowedPrefixes = [
      'src/components/form/',
      'src/components/ui/',
      'src/components/shared/',
      'src/components/report/',
      'src/app/App.tsx',
      'src/pages/EmailPage.tsx',
    ]

    const rawControlPattern = /<(button|input|textarea|select)\b/i
    const violations = sourceFiles()
      .filter((file) => rawControlPattern.test(file.content))
      .filter((file) => !allowedPrefixes.some((allowed) => file.path === allowed || file.path.startsWith(allowed)))
      .map((file) => `${file.path}: raw form/control tag found outside approved UI-kit boundaries`)

    expectNoViolations(
      violations,
      'New raw controls should not be added directly to feature code. Create or reuse a kit wrapper instead.',
    )
  })

  test('keeps the expected DOM contract for core constructor kit components', () => {
    const contracts = [
      {
        file: 'src/components/form/TextField.tsx',
        markers: ['className="ui-field"', 'className="ui-label"', 'ui-input'],
      },
      {
        file: 'src/components/form/TextareaField.tsx',
        markers: ['className="ui-field"', 'className="ui-label"', 'textarea', 'ui-input'],
      },
      {
        file: 'src/components/form/RichTextField.tsx',
        markers: ['className="ui-field"', 'className="ui-label"', 'textarea', 'ui-input', 'migration-richtext-hint'],
      },
      {
        file: 'src/components/form/RteField.tsx',
        markers: ['className="ui-field"', 'className="ui-label"', 'ui-rte', 'ui-rte__toolbar', 'ui-rte__editor'],
      },
      {
        file: 'src/components/form/NumberField.tsx',
        markers: ['className="ui-field"', 'className="ui-label"', 'inputMode="numeric"', 'ui-input'],
      },
      {
        file: 'src/components/form/CheckboxField.tsx',
        markers: ['className="ui-checkbox"', 'ui-checkbox__label'],
      },
      {
        file: 'src/components/form/SelectField.tsx',
        markers: ['custom-dropdown ui-dropdown', 'custom-dropdown__trigger', 'custom-dropdown__option'],
      },
      {
        file: 'src/components/form/ColorField.tsx',
        markers: ['ColorPicker', 'ui-color-field__row', 'ui-color-picker'],
      },
      {
        file: 'src/components/ui/color-picker.tsx',
        markers: ['Popover', 'HexAlphaColorPicker', 'ui-color-picker__trigger'],
      },
      {
        file: 'src/components/report/ReportAccordionSection.tsx',
        markers: ['ui-accordion', 'ui-accordion__head', 'ui-accordion__body'],
      },
      {
        file: 'src/components/shared/HtmlOutputAccordion.tsx',
        markers: ['csec', 'csec__head', 'mono ui-textarea'],
      },
    ]

    const violations = []

    for (const contract of contracts) {
      const content = read(contract.file)
      for (const marker of contract.markers) {
        if (!content.includes(marker)) {
          violations.push(`${contract.file}: missing kit marker "${marker}"`)
        }
      }
    }

    expectNoViolations(violations, 'A core kit component lost part of its DOM/class contract.')
  })
})

test.describe('UI kit compliance: runtime DOM audit', () => {
  test.beforeEach(async ({ page }) => {
    await new ConstructorPage(page).goto()
  })

  test('email form renders fields through kit wrappers instead of native browser widgets', async ({ page }) => {
    const app = new ConstructorPage(page)
    await app.switchToEmailFieldsMode()
    await app.openEmailInputSection('Основные стили')
    await app.openEmailInputSection('Кнопка')
    await app.openEmailInputSection('Заголовок и приветствие')

    const inputCard = page.locator('#emailInputsCard')

    await expect(inputCard.locator('select')).toHaveCount(0)
    await expect(inputCard.locator('input[type="color"]')).toHaveCount(0)

    const fieldCount = await inputCard.locator('.ui-field').count()
    const dropdownCount = await inputCard.locator('.custom-dropdown.ui-dropdown').count()
    const colorPickerCount = await inputCard.locator('.ui-color-picker .ui-color-picker__trigger').count()
    const rteCount = await inputCard.locator('.ui-rte .ui-rte__editor[contenteditable="true"]').count()

    expect(fieldCount, 'email form should render fields through .ui-field wrappers').toBeGreaterThan(8)
    expect(dropdownCount, 'email form should use kit dropdowns').toBeGreaterThan(0)
    expect(colorPickerCount, 'email form should use kit color pickers').toBeGreaterThan(0)
    expect(rteCount, 'email form should use kit rich text editors').toBeGreaterThan(0)

    const orphanControls = await inputCard.evaluate((root) => {
      const controls = Array.from(
        root.querySelectorAll([
          'input.ui-input',
          'textarea.ui-input',
          'textarea.ui-textarea',
          '.custom-dropdown.ui-dropdown',
          '.ui-color-picker__trigger',
          '.ui-rte__editor[contenteditable="true"]',
        ].join(',')),
      )

      return controls
        .filter((control) => !control.closest('.ui-field'))
        .map((control) => {
          const tag = control.tagName.toLowerCase()
          const className = control.getAttribute('class') || ''
          const label = control.closest('label')?.textContent?.trim() || control.getAttribute('aria-label') || ''
          return `${tag}.${className} ${label}`.trim()
        })
    })

    expect(orphanControls, 'Every editable form control in the email form must live inside .ui-field.').toEqual([])
  })

  test('report form keeps accordion, field, dropdown and color picker kit contracts', async ({ page }) => {
    const app = new ConstructorPage(page)
    await app.switchToReportTab()
    await app.openReportSection('Основные стили')
    await app.openReportSection('Шапка')

    const reportCard = page.locator('#reportInputsCard')

    await expect(reportCard.locator('select')).toHaveCount(0)
    await expect(reportCard.locator('input[type="color"]')).toHaveCount(0)

    const accordionCount = await reportCard.locator('section.ui-accordion').count()
    const fieldCount = await reportCard.locator('.ui-field').count()
    const colorPickerCount = await reportCard.locator('.ui-color-picker .ui-color-picker__trigger').count()

    expect(accordionCount, 'report editor should use kit accordions').toBeGreaterThan(4)
    expect(fieldCount, 'report editor should render settings through .ui-field wrappers').toBeGreaterThan(2)
    expect(colorPickerCount, 'report editor should use kit color pickers').toBeGreaterThan(0)
  })

  test('button settings use kit dropdowns without native selects', async ({ page }) => {
    const app = new ConstructorPage(page)
    const buttonSection = await app.openEmailInputSection('Кнопка')

    await expect(buttonSection.locator('select')).toHaveCount(0)

    const dropdownCount = await buttonSection.locator('.custom-dropdown.ui-dropdown').count()
    expect(dropdownCount, 'button settings should use custom kit dropdowns').toBeGreaterThanOrEqual(3)

    await app.selectDropdown(buttonSection, 'Размер', 'S')
    await app.selectDropdown(buttonSection, 'Тип цвета кнопки', 'Градиент')

    await expect(
      app.fieldByLabel(buttonSection, 'Размер').locator('.custom-dropdown__label'),
    ).toContainText('S')
    await expect(
      app.fieldByLabel(buttonSection, 'Тип цвета кнопки').locator('.custom-dropdown__label'),
    ).toContainText('Градиент')
  })
})
