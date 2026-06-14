(function () {
  'use strict'

  const UIKit = {}
  const COLOR_PICKER_EYEDROPPER_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4.5 19.5 9.5M7.25 16.75 15.5 8.5M5.75 18.25l-1 3 3-1 8.75-8.75-2-2L5.75 18.25Zm7.5-11.5 2-2a1.77 1.77 0 0 1 2.5 0l1.5 1.5a1.77 1.77 0 0 1 0 2.5l-2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

  function addClass(node, className) {
    if (node && className) node.classList.add(...String(className).split(/\s+/).filter(Boolean))
    return node
  }

  function createButton(options = {}) {
    const button = document.createElement('button')
    button.type = options.type || 'button'
    const size = ['xs', 's', 'm', 'l'].includes(String(options.size || '').toLowerCase())
      ? String(options.size).toLowerCase()
      : 'm'
    button.className = `ui-btn ui-btn--${size}${options.variant ? ` ui-btn--${options.variant}` : ''}${options.icon ? ' ui-btn--icon' : ''}`
    if (options.className) addClass(button, options.className)
    if (options.label) button.setAttribute('aria-label', options.label)
    if (options.title) button.setAttribute('title', options.title)
    if (options.disabled) button.disabled = true
    if (options.html != null) button.innerHTML = String(options.html)
    else button.textContent = options.text || ''
    return button
  }

  function createInput(options = {}) {
    const input = document.createElement(options.multiline ? 'textarea' : 'input')
    input.className = options.multiline ? 'ui-textarea' : 'ui-input'
    if (!options.multiline) input.type = options.type || 'text'
    if (options.id) input.id = options.id
    if (options.name) input.name = options.name
    if (options.placeholder) input.placeholder = options.placeholder
    if (options.value != null) input.value = String(options.value)
    if (options.disabled) input.disabled = true
    if (options.readOnly) input.readOnly = true
    if (options.className) addClass(input, options.className)
    return input
  }

  function createCheckbox(options = {}) {
    const label = document.createElement('label')
    const size = String(options.size || 'm').toLowerCase() === 's' ? 's' : 'm'
    label.className = `ui-checkbox ui-checkbox--${size}${options.label ? '' : ' ui-checkbox--bare'}${options.className ? ` ${options.className}` : ''}`

    const input = document.createElement('input')
    input.type = 'checkbox'
    if (options.id) input.id = options.id
    if (options.name) input.name = options.name
    if (options.checked) input.checked = true
    if (options.disabled) input.disabled = true
    label.appendChild(input)

    if (options.label) {
      const text = document.createElement('span')
      text.className = 'ui-checkbox__label'
      text.textContent = options.label
      label.appendChild(text)
    }

    return label
  }

  function createFieldSwatches(colors = [], options = {}) {
    const swatches = document.createElement('div')
    swatches.className = `ui-field__swatches${options.className ? ` ${options.className}` : ''}`
    colors.forEach((item) => {
      if (!item) return
      const meta = typeof item === 'string' ? { color: item } : item
      const swatch = document.createElement(meta.interactive ? 'button' : 'span')
      swatch.className = `ui-field__swatch${meta.className ? ` ${meta.className}` : ''}${meta.active ? ' is-active' : ''}`
      if (meta.interactive) swatch.type = 'button'
      swatch.style.setProperty('--ui-field-swatch', meta.color || meta.value || '#3DC47A')
      if (meta.label) swatch.setAttribute('aria-label', meta.label)
      else swatch.setAttribute('aria-hidden', 'true')
      if (meta.title) swatch.title = meta.title
      if (meta.dataset) {
        Object.entries(meta.dataset).forEach(([key, value]) => {
          swatch.dataset[key] = String(value)
        })
      }
      swatches.appendChild(swatch)
    })
    return swatches
  }

  function createInputField(options = {}) {
    const inputId = options.id || (options.label ? `ui-field-${Math.random().toString(16).slice(2)}` : '')
    const label = options.label
      ? (() => {
          const node = document.createElement('label')
          node.className = `ui-label${options.labelClassName ? ` ${options.labelClassName}` : ''}`
          if (inputId) node.setAttribute('for', inputId)
          node.textContent = options.label
          return node
        })()
      : null

    const input = createInput({
      multiline: options.multiline,
      type: options.type,
      id: inputId || undefined,
      name: options.name,
      placeholder: options.placeholder,
      value: options.value,
      disabled: options.disabled,
      readOnly: options.readOnly,
      className: options.inputClassName || '',
    })

    let control = input
    if (options.picker) {
      const row = document.createElement('div')
      row.className = `ui-color-field__row${options.rowClassName ? ` ${options.rowClassName}` : ''}`
      if (!input.classList.contains('ui-color-field__input')) input.classList.add('ui-color-field__input')
      row.append(
        input,
        createColorPicker({
          pickerLabel: options.pickerLabel || 'Выбрать цвет',
          allowTransparent: !!options.allowTransparent,
        })
      )
      control = row
    }

    const needsField = !!(label || options.headSwatches?.length || options.checkbox || options.supportSwatches?.length || options.picker || options.className)
    if (!needsField) return control

    const field = document.createElement('div')
    field.className = `ui-field${options.picker ? ' ui-color-field' : ''}${options.checkbox || options.supportSwatches?.length ? ' ui-field--with-support' : ''}${options.className ? ` ${options.className}` : ''}`

    if (options.checkbox || options.supportSwatches?.length) {
      const stack = document.createElement('div')
      stack.className = 'ui-field__stack'
      if (label) stack.appendChild(label)
      stack.appendChild(control)
      field.appendChild(stack)

      const support = document.createElement('div')
      support.className = `ui-field__support${options.supportClassName ? ` ${options.supportClassName}` : ''}`
      if (options.checkbox) {
        support.appendChild(createCheckbox({
          size: options.checkbox.size || 's',
          label: options.checkbox.label,
          checked: options.checkbox.checked,
          disabled: options.checkbox.disabled ?? options.disabled,
          className: options.checkbox.className || '',
        }))
      }
      if (options.supportSwatches?.length) support.appendChild(createFieldSwatches(options.supportSwatches, { className: options.supportSwatchesClassName || '' }))
      field.appendChild(support)
      return field
    }

    if (label && options.headSwatches?.length) {
      const head = document.createElement('div')
      head.className = `ui-field__head${options.headClassName ? ` ${options.headClassName}` : ''}`
      head.append(label, createFieldSwatches(options.headSwatches, { className: options.headSwatchesClassName || '' }))
      field.append(head, control)
      return field
    }

    if (label) field.appendChild(label)
    field.appendChild(control)
    return field
  }

  function createColorField(options = {}) {
    return createInputField({
      id: options.id || `ui-color-${Math.random().toString(16).slice(2)}`,
      name: options.name,
      label: options.label || '',
      value: options.value || '',
      placeholder: options.placeholder || '#000000',
      disabled: options.disabled,
      readOnly: options.readOnly,
      inputClassName: 'ui-color-field__input',
      className: options.className || '',
      picker: true,
      pickerLabel: options.pickerLabel || 'Выбрать цвет',
      allowTransparent: !!options.allowTransparent,
    })
  }

  function normalizeHex(value) {
    const raw = String(value || '').trim()
    if (!raw) return null
    const compact = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9a-f]{3}$/i.test(compact)) {
      return `#${compact[1]}${compact[1]}${compact[2]}${compact[2]}${compact[3]}${compact[3]}`.toUpperCase()
    }
    if (/^#[0-9a-f]{6}$/i.test(compact)) return compact.toUpperCase()
    return null
  }

  function isTransparentValue(value) {
    return /^transparent$/i.test(String(value || '').trim())
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function hexToRgb(value) {
    const hex = normalizeHex(value)
    if (!hex) return null
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    }
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
  }

  function rgbToHsv(r, g, b) {
    const rn = clamp(r, 0, 255) / 255
    const gn = clamp(g, 0, 255) / 255
    const bn = clamp(b, 0, 255) / 255
    const max = Math.max(rn, gn, bn)
    const min = Math.min(rn, gn, bn)
    const delta = max - min
    let h = 0
    if (delta !== 0) {
      if (max === rn) h = ((gn - bn) / delta) % 6
      else if (max === gn) h = (bn - rn) / delta + 2
      else h = (rn - gn) / delta + 4
      h *= 60
      if (h < 0) h += 360
    }
    const s = max === 0 ? 0 : delta / max
    return { h, s, v: max }
  }

  function hsvToRgb(h, s, v) {
    const hue = ((Number(h) % 360) + 360) % 360
    const sat = clamp(Number(s), 0, 1)
    const val = clamp(Number(v), 0, 1)
    const c = val * sat
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = val - c
    let r1 = 0
    let g1 = 0
    let b1 = 0
    if (hue < 60) [r1, g1, b1] = [c, x, 0]
    else if (hue < 120) [r1, g1, b1] = [x, c, 0]
    else if (hue < 180) [r1, g1, b1] = [0, c, x]
    else if (hue < 240) [r1, g1, b1] = [0, x, c]
    else if (hue < 300) [r1, g1, b1] = [x, 0, c]
    else [r1, g1, b1] = [c, 0, x]
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    }
  }

  function makePickerState(color, alpha = 1) {
    const rgb = color || { r: 255, g: 255, b: 255 }
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    return {
      h: hsv.h,
      s: hsv.s,
      v: hsv.v,
      a: clamp(alpha, 0, 1),
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    }
  }

  function normalizeState(state) {
    const rgb = hsvToRgb(state.h, state.s, state.v)
    return {
      h: ((Number(state.h) % 360) + 360) % 360,
      s: clamp(Number(state.s), 0, 1),
      v: clamp(Number(state.v), 0, 1),
      a: clamp(Number(state.a == null ? 1 : state.a), 0, 1),
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    }
  }

  function getFallbackPickerState(root, input) {
    const fallbackHex = normalizeHex(input?.placeholder) || root?.dataset.lastValidColor || '#FFFFFF'
    return makePickerState(hexToRgb(fallbackHex))
  }

  function resolvePickerState(root, input) {
    const rawValue = String(input?.value || '').trim()
    const fallback = getFallbackPickerState(root, input)
    const lastState = root?._uiColorPickerState || fallback
    const normalized = normalizeHex(rawValue)
    if (normalized) return { ...makePickerState(hexToRgb(normalized)), a: root?.dataset.lastAlpha ? clamp(Number(root.dataset.lastAlpha), 0, 1) : 1 }
    if (isTransparentValue(rawValue)) return { ...lastState, a: 0, hex: lastState.hex }
    return lastState
  }

  function resolveColorPickerInput(root) {
    if (!root) return null
    if (root.dataset.input) return document.getElementById(root.dataset.input)
    const prev = root.previousElementSibling
    if (prev && prev.matches?.('input:not([type="hidden"]):not([type="color"]), textarea')) return prev
    return root.closest('.ui-color-field__row')?.querySelector('input:not([type="hidden"]):not([type="color"]), textarea') || null
  }

  function createColorPicker(options = {}) {
    const picker = document.createElement('div')
    picker.className = `ui-color-picker${options.className ? ` ${options.className}` : ''}`
    if (options.pickerLabel) picker.dataset.pickerLabel = options.pickerLabel
    if (options.allowTransparent) picker.dataset.allowTransparent = 'true'
    return picker
  }

  function ensureColorPickerMarkup(root) {
    if (!root || root.dataset.uiColorPickerBuilt === 'true') return
    root.dataset.uiColorPickerBuilt = 'true'

    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = 'ui-color-picker__trigger'
    trigger.setAttribute('aria-haspopup', 'dialog')
    trigger.setAttribute('aria-expanded', 'false')
    trigger.setAttribute('aria-label', root.dataset.pickerLabel || 'Выбрать цвет')

    const swatch = document.createElement('span')
    swatch.className = 'ui-color-picker__swatch'
    trigger.appendChild(swatch)

    const popover = document.createElement('div')
    popover.className = 'ui-color-picker__popover'
    popover.hidden = true

    const board = document.createElement('div')
    board.className = 'ui-color-picker__board'
    board.tabIndex = 0
    const boardKnob = document.createElement('span')
    boardKnob.className = 'ui-color-picker__board-knob'
    board.appendChild(boardKnob)

    const controls = document.createElement('div')
    controls.className = 'ui-color-picker__controls'

    const eyeDropperButton = document.createElement('button')
    eyeDropperButton.type = 'button'
    eyeDropperButton.className = 'ui-color-picker__eyedropper'
    eyeDropperButton.dataset.action = 'eyedropper'
    eyeDropperButton.setAttribute('aria-label', 'Пипетка')
    eyeDropperButton.innerHTML = COLOR_PICKER_EYEDROPPER_ICON

    const sliderGroup = document.createElement('div')
    sliderGroup.className = 'ui-color-picker__slider-group'

    const hueSliderWrap = document.createElement('div')
    hueSliderWrap.className = 'ui-color-picker__slider ui-color-picker__slider--hue'
    hueSliderWrap.dataset.channel = 'hue'
    hueSliderWrap.tabIndex = 0
    const hueThumb = document.createElement('span')
    hueThumb.className = 'ui-color-picker__slider-thumb'
    hueSliderWrap.appendChild(hueThumb)

    const alphaSliderWrap = document.createElement('div')
    alphaSliderWrap.className = 'ui-color-picker__slider ui-color-picker__slider--alpha'
    alphaSliderWrap.dataset.channel = 'alpha'
    alphaSliderWrap.tabIndex = 0
    const alphaPattern = document.createElement('span')
    alphaPattern.className = 'ui-color-picker__alpha-pattern'
    const alphaThumb = document.createElement('span')
    alphaThumb.className = 'ui-color-picker__slider-thumb'
    alphaSliderWrap.append(alphaPattern, alphaThumb)

    sliderGroup.append(hueSliderWrap, alphaSliderWrap)
    controls.append(eyeDropperButton, sliderGroup)

    const channels = document.createElement('div')
    channels.className = 'ui-color-picker__channels'

    const createChannelColumn = (labelText, channel, modifiers = '') => {
      const column = document.createElement('div')
      column.className = `ui-color-picker__channel${modifiers ? ` ${modifiers}` : ''}`

      const label = document.createElement('span')
      label.className = 'ui-color-picker__channel-label'
      label.textContent = labelText

      const field = document.createElement('input')
      field.type = 'text'
      field.className = `ui-input ui-color-picker__field${channel === 'hex' ? ' ui-color-picker__field--hex' : ''}`
      field.dataset.channel = channel
      if (channel === 'hex') {
        field.inputMode = 'text'
        field.maxLength = 7
        field.placeholder = '#FFFFFF'
      } else {
        field.inputMode = 'numeric'
        field.maxLength = 3
      }

      column.append(label, field)
      return { column, field }
    }

    const hexChannel = createChannelColumn('HEX', 'hex', 'ui-color-picker__channel--hex')
    const rgbGroup = document.createElement('div')
    rgbGroup.className = 'ui-color-picker__rgb-group'
    const redChannel = createChannelColumn('R', 'r')
    const greenChannel = createChannelColumn('G', 'g')
    const blueChannel = createChannelColumn('B', 'b')
    rgbGroup.append(redChannel.column, greenChannel.column, blueChannel.column)
    channels.append(hexChannel.column, rgbGroup)

    const nativeInput = document.createElement('input')
    nativeInput.type = 'color'
    nativeInput.className = 'ui-color-picker__native'
    nativeInput.tabIndex = -1
    nativeInput.setAttribute('aria-hidden', 'true')

    popover.append(board, controls, channels)
    root.append(trigger, popover, nativeInput)
  }

  function renderColorPicker(root, state, flags = {}) {
    const trigger = root.querySelector('.ui-color-picker__trigger')
    const swatch = root.querySelector('.ui-color-picker__swatch')
    const nativeInput = root.querySelector('.ui-color-picker__native')
    const board = root.querySelector('.ui-color-picker__board')
    const boardKnob = root.querySelector('.ui-color-picker__board-knob')
    const hueSlider = root.querySelector('.ui-color-picker__slider[data-channel="hue"]')
    const alphaSlider = root.querySelector('.ui-color-picker__slider[data-channel="alpha"]')
    const hueThumb = root.querySelector('.ui-color-picker__slider[data-channel="hue"] .ui-color-picker__slider-thumb')
    const alphaThumb = root.querySelector('.ui-color-picker__slider[data-channel="alpha"] .ui-color-picker__slider-thumb')
    const hexField = root.querySelector('.ui-color-picker__field[data-channel="hex"]')
    const redField = root.querySelector('.ui-color-picker__field[data-channel="r"]')
    const greenField = root.querySelector('.ui-color-picker__field[data-channel="g"]')
    const blueField = root.querySelector('.ui-color-picker__field[data-channel="b"]')
    const hueColor = hsvToRgb(state.h, 1, 1)
    const opaque = `rgb(${state.r}, ${state.g}, ${state.b})`
    const alphaBg = `linear-gradient(90deg, rgba(${state.r}, ${state.g}, ${state.b}, 0) 0%, rgba(${state.r}, ${state.g}, ${state.b}, 1) 100%)`

    root.style.setProperty('--ui-color-picker-board-hue', rgbToHex(hueColor.r, hueColor.g, hueColor.b))
    root.style.setProperty('--ui-color-picker-alpha', String(state.a))
    root.style.setProperty('--ui-color-picker-current', opaque)
    root.style.setProperty('--ui-color-picker-current-solid', state.hex)

    if (boardKnob) {
      boardKnob.style.left = `${state.s * 100}%`
      boardKnob.style.top = `${(1 - state.v) * 100}%`
    }
    if (hueThumb) hueThumb.style.left = `${(state.h / 360) * 100}%`
    if (alphaThumb) alphaThumb.style.left = `${state.a * 100}%`
    if (alphaSlider) alphaSlider.style.setProperty('--ui-color-picker-alpha-gradient', alphaBg)
    if (hexField && document.activeElement !== hexField) hexField.value = state.hex
    if (redField && document.activeElement !== redField) redField.value = String(state.r)
    if (greenField && document.activeElement !== greenField) greenField.value = String(state.g)
    if (blueField && document.activeElement !== blueField) blueField.value = String(state.b)
    if (swatch) swatch.style.opacity = flags.isTransparent ? '0' : String(state.a)
    if (nativeInput) nativeInput.value = state.hex
    if (trigger) trigger.title = flags.isTransparent ? 'Transparent' : state.hex
  }

  function syncColorPickerState(root) {
    const input = resolveColorPickerInput(root)
    if (!input) return
    root._uiColorPickerInput = input
    input.classList.add('ui-color-picker__text')

    const trigger = root.querySelector('.ui-color-picker__trigger')
    const nativeInput = root.querySelector('.ui-color-picker__native')
    const rawValue = String(input.value || '').trim()
    const normalized = normalizeHex(rawValue)
    const isTransparent = isTransparentValue(rawValue)
    const invalid = !!rawValue && !normalized && !isTransparent
    const state = resolvePickerState(root, input)

    root._uiColorPickerState = state
    root.dataset.lastValidColor = state.hex
    root.dataset.lastAlpha = String(state.a)
    root.classList.toggle('is-disabled', !!input.disabled)
    root.classList.toggle('is-transparent', isTransparent)
    root.classList.toggle('is-invalid', invalid)
    input.classList.toggle('is-invalid', invalid)

    renderColorPicker(root, state, { isTransparent })
    if (nativeInput) nativeInput.disabled = !!input.disabled
    if (trigger) {
      trigger.disabled = !!input.disabled
      trigger.setAttribute('aria-label', root.dataset.pickerLabel || 'Выбрать цвет')
    }
    root.querySelectorAll('.ui-color-picker__field, .ui-color-picker__slider, .ui-color-picker__eyedropper').forEach((node) => {
      if ('disabled' in node) node.disabled = !!input.disabled
      if (node.classList?.contains('ui-color-picker__slider')) {
        node.tabIndex = input.disabled ? -1 : 0
        node.setAttribute('aria-disabled', input.disabled ? 'true' : 'false')
      }
    })
  }

  function closeColorPicker(root) {
    if (!root) return
    root.classList.remove('is-open')
    const trigger = root.querySelector('.ui-color-picker__trigger')
    const popover = root.querySelector('.ui-color-picker__popover')
    if (trigger) trigger.setAttribute('aria-expanded', 'false')
    if (popover) popover.hidden = true
  }

  function closeAllColorPickers(exceptRoot) {
    document.querySelectorAll('.ui-color-picker.is-open').forEach((root) => {
      if (root !== exceptRoot) closeColorPicker(root)
    })
  }

  function openColorPicker(root) {
    if (!root || root.classList.contains('is-disabled')) return
    closeAllColorPickers(root)
    const trigger = root.querySelector('.ui-color-picker__trigger')
    const popover = root.querySelector('.ui-color-picker__popover')
    root.classList.add('is-open')
    if (trigger) trigger.setAttribute('aria-expanded', 'true')
    if (popover) popover.hidden = false
  }

  function commitPickerState(root, nextState, { fireChange = true } = {}) {
    const input = resolveColorPickerInput(root)
    if (!input) return
    const normalizedState = normalizeState(nextState)
    const shouldBeTransparent = root.dataset.allowTransparent === 'true' && normalizedState.a <= 0.001
    root._uiColorPickerState = normalizedState
    root.dataset.lastAlpha = String(normalizedState.a)
    input.value = shouldBeTransparent ? 'transparent' : normalizedState.hex
    syncColorPickerState(root)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    if (fireChange) input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function initColorPicker(root) {
    if (!root || root.dataset.uiColorPickerReady === 'true') return
    ensureColorPickerMarkup(root)
    const input = resolveColorPickerInput(root)
    if (!input) return

    const trigger = root.querySelector('.ui-color-picker__trigger')
    const popover = root.querySelector('.ui-color-picker__popover')
    const nativeInput = root.querySelector('.ui-color-picker__native')
    const board = root.querySelector('.ui-color-picker__board')
    const hueSlider = root.querySelector('.ui-color-picker__slider[data-channel="hue"]')
    const alphaSlider = root.querySelector('.ui-color-picker__slider[data-channel="alpha"]')
    const hexField = root.querySelector('.ui-color-picker__field[data-channel="hex"]')
    const redField = root.querySelector('.ui-color-picker__field[data-channel="r"]')
    const greenField = root.querySelector('.ui-color-picker__field[data-channel="g"]')
    const blueField = root.querySelector('.ui-color-picker__field[data-channel="b"]')
    const eyeDropperButton = root.querySelector('.ui-color-picker__eyedropper')

    const getState = () => root._uiColorPickerState || resolvePickerState(root, input)
    const commitPartialState = (patch, options = {}) => {
      const base = getState()
      commitPickerState(root, { ...base, ...patch }, options)
    }
    const syncBoardFromPointer = (event, fireChange) => {
      const rect = board?.getBoundingClientRect()
      if (!rect) return
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1)
      commitPartialState({ s: x, v: 1 - y }, { fireChange })
    }
    const syncSliderFromPointer = (slider, event, fireChange) => {
      const rect = slider?.getBoundingClientRect()
      if (!rect) return
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)
      if (slider.dataset.channel === 'hue') {
        commitPartialState({ h: ratio * 360 }, { fireChange })
      } else {
        commitPartialState({ a: ratio }, { fireChange })
      }
    }

    trigger?.addEventListener('click', (event) => {
      event.preventDefault()
      root.classList.contains('is-open') ? closeColorPicker(root) : openColorPicker(root)
    })

    nativeInput?.addEventListener('input', () => {
      const rgb = hexToRgb(nativeInput.value)
      if (!rgb) return
      commitPickerState(root, { ...getState(), ...makePickerState(rgb), a: 1 }, { fireChange: false })
    })
    nativeInput?.addEventListener('change', () => {
      const rgb = hexToRgb(nativeInput.value)
      if (!rgb) return
      commitPickerState(root, { ...getState(), ...makePickerState(rgb), a: 1 })
      closeColorPicker(root)
    })

    board?.addEventListener('pointerdown', (event) => {
      if (input.disabled) return
      event.preventDefault()
      board.setPointerCapture?.(event.pointerId)
      syncBoardFromPointer(event, false)
    })
    board?.addEventListener('pointermove', (event) => {
      if (!board.hasPointerCapture?.(event.pointerId)) return
      syncBoardFromPointer(event, false)
    })
    board?.addEventListener('pointerup', (event) => {
      if (!board.hasPointerCapture?.(event.pointerId)) return
      syncBoardFromPointer(event, true)
      board.releasePointerCapture?.(event.pointerId)
    })

    ;[hueSlider, alphaSlider].forEach((slider) => {
      slider?.addEventListener('pointerdown', (event) => {
        if (input.disabled) return
        event.preventDefault()
        slider.setPointerCapture?.(event.pointerId)
        syncSliderFromPointer(slider, event, false)
      })
      slider?.addEventListener('pointermove', (event) => {
        if (!slider.hasPointerCapture?.(event.pointerId)) return
        syncSliderFromPointer(slider, event, false)
      })
      slider?.addEventListener('pointerup', (event) => {
        if (!slider.hasPointerCapture?.(event.pointerId)) return
        syncSliderFromPointer(slider, event, true)
        slider.releasePointerCapture?.(event.pointerId)
      })
      slider?.addEventListener('keydown', (event) => {
        const isHue = slider.dataset.channel === 'hue'
        const step = isHue ? 1 : 0.01
        const current = isHue ? getState().h : getState().a
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault()
          const next = isHue ? clamp(current - step, 0, 360) : clamp(current - step, 0, 1)
          commitPartialState(isHue ? { h: next } : { a: next })
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault()
          const next = isHue ? clamp(current + step, 0, 360) : clamp(current + step, 0, 1)
          commitPartialState(isHue ? { h: next } : { a: next })
        }
      })
    })

    eyeDropperButton?.addEventListener('click', async (event) => {
      event.preventDefault()
      if (input.disabled) return
      try {
        if (window.EyeDropper) {
          const eyeDropper = new window.EyeDropper()
          const result = await eyeDropper.open()
          const rgb = hexToRgb(result.sRGBHex)
          if (rgb) commitPickerState(root, { ...getState(), ...makePickerState(rgb), a: 1 })
          return
        }
      } catch (error) {
        return
      }
      nativeInput?.click()
    })

    hexField?.addEventListener('input', () => {
      const normalizedHex = normalizeHex(hexField.value)
      hexField.classList.toggle('is-invalid', !!hexField.value && !normalizedHex)
      if (!normalizedHex) return
      const rgb = hexToRgb(normalizedHex)
      if (!rgb) return
      commitPickerState(root, { ...getState(), ...makePickerState(rgb), a: getState().a }, { fireChange: false })
    })
    hexField?.addEventListener('change', () => {
      const normalizedHex = normalizeHex(hexField.value)
      if (!normalizedHex) {
        hexField.value = getState().hex
        hexField.classList.remove('is-invalid')
        return
      }
      const rgb = hexToRgb(normalizedHex)
      if (!rgb) return
      hexField.classList.remove('is-invalid')
      commitPickerState(root, { ...getState(), ...makePickerState(rgb), a: getState().a })
    })

    ;[redField, greenField, blueField].forEach((field) => {
      field?.addEventListener('input', () => {
        const r = Number(redField?.value)
        const g = Number(greenField?.value)
        const b = Number(blueField?.value)
        const valid = [r, g, b].every((value) => Number.isFinite(value) && value >= 0 && value <= 255)
        ;[redField, greenField, blueField].forEach((node) => node?.classList.toggle('is-invalid', !valid))
        if (!valid) return
        commitPickerState(root, { ...getState(), ...makePickerState({ r, g, b }), a: getState().a }, { fireChange: false })
      })
      field?.addEventListener('change', () => {
        const r = clamp(Number(redField?.value), 0, 255)
        const g = clamp(Number(greenField?.value), 0, 255)
        const b = clamp(Number(blueField?.value), 0, 255)
        ;[redField, greenField, blueField].forEach((node) => node?.classList.remove('is-invalid'))
        commitPickerState(root, { ...getState(), ...makePickerState({ r, g, b }), a: getState().a })
      })
    })

    input.addEventListener('input', () => {
      syncColorPickerState(root)
    })
    input.addEventListener('change', () => {
      const normalized = normalizeHex(input.value)
      if (normalized && input.value !== normalized) input.value = normalized
      syncColorPickerState(root)
    })
    input.addEventListener('blur', () => {
      const normalized = normalizeHex(input.value)
      if (normalized && input.value !== normalized) {
        input.value = normalized
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      } else {
        syncColorPickerState(root)
      }
    })

    root.dataset.uiColorPickerReady = 'true'
    syncColorPickerState(root)
  }

  function createDropdown(options = {}) {
    const root = document.createElement('div')
    root.className = `custom-dropdown ui-dropdown${options.className ? ` ${options.className}` : ''}`
    root.dataset.placeholder = options.placeholder || 'Style'

    const value = document.createElement('input')
    value.type = 'hidden'
    value.className = 'custom-dropdown__value'
    value.value = options.value || ''
    if (options.id) value.id = options.id

    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = 'custom-dropdown__trigger'
    trigger.innerHTML = '<span class="custom-dropdown__label"></span><span class="custom-dropdown__chevron" aria-hidden="true"><svg viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'

    const menu = document.createElement('div')
    menu.className = 'custom-dropdown__menu'
    ;(options.items || []).forEach((item) => {
      const option = document.createElement('button')
      option.type = 'button'
      option.className = 'custom-dropdown__option'
      option.dataset.value = item.value
      option.textContent = item.label
      menu.appendChild(option)
    })

    root.append(value, trigger, menu)
    if (window.CustomDropdowns) window.CustomDropdowns.init(root)
    return root
  }

  function enhance(root = document) {
    const scope = root || document
    const collect = (selector) => {
      const nodes = []
      if (scope.matches && scope.matches(selector)) nodes.push(scope)
      scope.querySelectorAll?.(selector).forEach((node) => nodes.push(node))
      return nodes
    }

    collect('.ui-dropdown.custom-dropdown').forEach((dropdown) => {
      if (window.CustomDropdowns) window.CustomDropdowns.init(dropdown)
    })

    collect('.ui-color-picker').forEach((picker) => {
      initColorPicker(picker)
    })

    collect('.ui-btn').forEach((button) => {
      if (button.dataset.uiRippleBound === '1') return
      button.dataset.uiRippleBound = '1'
      button.addEventListener('pointerdown', handleButtonRipple)
    })
  }

  function handleButtonRipple(event) {
    const button = event.currentTarget
    if (!button || button.disabled) return
    if (event.button != null && event.button !== 0) return

    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.2
    const x = `${((event.clientX - rect.left) / rect.width) * 100}%`
    const y = `${((event.clientY - rect.top) / rect.height) * 100}%`
    button.style.setProperty('--ui-ripple-size', `${size}px`)
    button.style.setProperty('--ui-ripple-x', x)
    button.style.setProperty('--ui-ripple-y', y)
    button.classList.remove('is-rippling')
    void button.offsetWidth
    button.classList.add('is-rippling')
    window.setTimeout(() => {
      button.classList.remove('is-rippling')
    }, 930)
  }

  UIKit.createButton = createButton
  UIKit.createInput = createInput
  UIKit.createInputField = createInputField
  UIKit.createCheckbox = createCheckbox
  UIKit.createFieldSwatches = createFieldSwatches
  UIKit.createColorField = createColorField
  UIKit.createColorPicker = createColorPicker
  UIKit.createDropdown = createDropdown
  UIKit.enhance = enhance
  UIKit.normalizeHexColor = normalizeHex
  UIKit.syncColorPickers = (root) => {
    const scope = root || document
    enhance(scope)
    const nodes = []
    if (scope.matches?.('.ui-color-picker')) nodes.push(scope)
    scope.querySelectorAll?.('.ui-color-picker').forEach((node) => nodes.push(node))
    nodes.forEach((node) => syncColorPickerState(node))
  }
  UIKit.refreshDropdowns = (root) => window.CustomDropdowns && window.CustomDropdowns.refresh(root || document)

  window.UIKit = UIKit

  document.addEventListener('mousedown', (event) => {
    if (!event.target.closest('.ui-color-picker')) closeAllColorPickers(null)
  }, true)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllColorPickers(null)
  })

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      enhance(document)
      observe()
    })
  } else {
    enhance(document)
    observe()
  }

  function observe() {
    if (UIKit._observer || !window.MutationObserver || !document.documentElement) return
    UIKit._observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return
          enhance(node)
        })
      })
    })
    UIKit._observer.observe(document.documentElement, { childList: true, subtree: true })
  }
})()
