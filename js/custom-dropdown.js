(function () {
  'use strict'

  const ROOT_SELECTOR = '.custom-dropdown'
  const VALUE_SELECTOR = '.custom-dropdown__value'
  const TRIGGER_SELECTOR = '.custom-dropdown__trigger'
  const MENU_SELECTOR = '.custom-dropdown__menu'
  const OPTION_SELECTOR = '.custom-dropdown__option'

  function getParts(root) {
    return {
      value: root.querySelector(VALUE_SELECTOR),
      trigger: root.querySelector(TRIGGER_SELECTOR),
      label: root.querySelector('.custom-dropdown__label'),
      menu: root.querySelector(MENU_SELECTOR),
      options: Array.from(root.querySelectorAll(OPTION_SELECTOR)),
    }
  }

  function getSelectedOption(parts) {
    return parts.options.find((option) => option.dataset.value === String(parts.value.value || '')) || null
  }

  function syncVisibility(root, parts) {
    if (!parts.value) return
    root.style.display = parts.value.style.display === 'none' ? 'none' : ''
  }

  function syncSelected(root) {
    const parts = getParts(root)
    if (!parts.value || !parts.label) return
    const selected = getSelectedOption(parts)
    parts.label.textContent = selected ? selected.textContent.trim() : (root.dataset.placeholder || '')
    parts.trigger.classList.toggle('is-placeholder', !selected)
    parts.options.forEach((option) => {
      const isSelected = option === selected
      option.classList.toggle('is-selected', isSelected)
      option.setAttribute('aria-selected', isSelected ? 'true' : 'false')
    })
    syncVisibility(root, parts)
  }

  function close(root) {
    const parts = getParts(root)
    root.classList.remove('is-open')
    if (parts.trigger) parts.trigger.setAttribute('aria-expanded', 'false')
  }

  function closeAll(exceptRoot) {
    document.querySelectorAll(ROOT_SELECTOR + '.is-open').forEach((root) => {
      if (root !== exceptRoot) close(root)
    })
  }

  function open(root) {
    const parts = getParts(root)
    if (!parts.trigger || !parts.menu || parts.trigger.disabled) return
    closeAll(root)
    root.classList.add('is-open')
    parts.trigger.setAttribute('aria-expanded', 'true')
    const selected = getSelectedOption(parts)
    const focusTarget = selected || parts.options[0]
    if (focusTarget) focusTarget.focus({ preventScroll: true })
  }

  function commit(root, option) {
    const parts = getParts(root)
    if (!parts.value || !option || option.disabled || option.getAttribute('aria-disabled') === 'true') return
    const nextValue = option.dataset.value || ''
    const changed = parts.value.value !== nextValue
    parts.value.value = nextValue
    syncSelected(root)
    close(root)
    if (changed) {
      parts.value.dispatchEvent(new Event('input', { bubbles: true }))
      parts.value.dispatchEvent(new Event('change', { bubbles: true }))
    }
    if (parts.trigger) parts.trigger.focus({ preventScroll: true })
  }

  function moveFocus(root, delta) {
    const parts = getParts(root)
    if (!parts.options.length) return
    const active = document.activeElement
    const currentIndex = Math.max(0, parts.options.indexOf(active))
    const nextIndex = (currentIndex + delta + parts.options.length) % parts.options.length
    parts.options[nextIndex].focus({ preventScroll: true })
  }

  function init(root) {
    if (!root || root.dataset.customDropdownReady === 'true') return
    const parts = getParts(root)
    if (!parts.value || !parts.trigger || !parts.menu || !parts.options.length) return

    root.dataset.customDropdownReady = 'true'
    parts.trigger.setAttribute('aria-haspopup', 'listbox')
    parts.trigger.setAttribute('aria-expanded', 'false')
    parts.menu.setAttribute('role', 'listbox')
    parts.options.forEach((option) => {
      option.setAttribute('role', 'option')
      option.tabIndex = -1
    })

    parts.trigger.addEventListener('click', (event) => {
      event.preventDefault()
      root.classList.contains('is-open') ? close(root) : open(root)
    })

    root.addEventListener('click', (event) => {
      const option = event.target.closest(OPTION_SELECTOR)
      if (!option || !root.contains(option)) return
      event.preventDefault()
      commit(root, option)
    })

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close(root)
        parts.trigger.focus({ preventScroll: true })
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        root.classList.contains('is-open') ? moveFocus(root, 1) : open(root)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        root.classList.contains('is-open') ? moveFocus(root, -1) : open(root)
      } else if (event.key === 'Enter' || event.key === ' ') {
        const option = event.target.closest(OPTION_SELECTOR)
        if (option) {
          event.preventDefault()
          commit(root, option)
        }
      }
    })

    const observer = new MutationObserver(() => syncVisibility(root, getParts(root)))
    observer.observe(parts.value, { attributes: true, attributeFilter: ['style', 'disabled', 'value'] })
    root.__customDropdownObserver = observer
    syncSelected(root)
  }

  function refresh(root) {
    const scope = root || document
    if (scope.matches && scope.matches(ROOT_SELECTOR)) init(scope)
    if (scope.querySelectorAll) scope.querySelectorAll(ROOT_SELECTOR).forEach(init)
  }

  document.addEventListener('mousedown', (event) => {
    if (!event.target.closest(ROOT_SELECTOR)) closeAll(null)
  }, true)

  const pageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return
        refresh(node)
      })
    })
  })

  window.CustomDropdowns = {
    init,
    refresh,
    refreshAll: () => refresh(document),
    sync: syncSelected,
    closeAll,
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      refresh(document)
      pageObserver.observe(document.documentElement, { childList: true, subtree: true })
    })
  } else {
    refresh(document)
    pageObserver.observe(document.documentElement, { childList: true, subtree: true })
  }
})()
