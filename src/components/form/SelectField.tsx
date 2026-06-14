import { useEffect, useId, useRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
}

type CustomDropdownApi = {
  init?: (root: Element) => void
  sync?: (root: Element) => void
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Style',
}: SelectFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputId = useId()

  useEffect(() => {
    const root = rootRef.current
    const input = inputRef.current
    if (!root || !input) return

    const api = (window as Window & { CustomDropdowns?: CustomDropdownApi }).CustomDropdowns
    const handleChange = () => onChange(input.value)

    input.value = value
    api?.init?.(root)
    api?.sync?.(root)
    input.addEventListener('change', handleChange)

    return () => {
      input.removeEventListener('change', handleChange)
    }
  }, [onChange, value, options])

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={inputId}>
        {label}
      </label>
      <div ref={rootRef} className="custom-dropdown ui-dropdown" data-placeholder={placeholder}>
        <input ref={inputRef} className="custom-dropdown__value" id={inputId} type="hidden" value={value} readOnly />
        <button className="custom-dropdown__trigger" type="button">
          <span className="custom-dropdown__label"></span>
          <span className="custom-dropdown__chevron" aria-hidden="true">
            <svg viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 1l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <div className="custom-dropdown__menu">
          {options.map((option) => (
            <button key={option.value} className="custom-dropdown__option" data-value={option.value} type="button">
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
