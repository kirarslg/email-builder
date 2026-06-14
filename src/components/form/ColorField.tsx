import { useId, useRef } from 'react'
import { clampHexColor } from '../../domain/shared/html'

interface ColorFieldProps {
  label: string
  value: string
  fallback?: string
  onChange: (value: string) => void
}

export function ColorField({ label, value, fallback = '#000000', onChange }: ColorFieldProps) {
  const colorInputRef = useRef<HTMLInputElement | null>(null)
  const inputId = useId()
  const normalized = clampHexColor(value, fallback)

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="ui-color-field__row">
        <input
          id={inputId}
          className="ui-input ui-color-field__input"
          value={value}
          onChange={(event) => onChange(clampHexColor(event.target.value, normalized))}
        />
        <div className="ui-color-picker">
          <button
            aria-label={`${label}: открыть выбор цвета`}
            className="ui-color-picker__trigger"
            style={{ backgroundColor: normalized }}
            type="button"
            onClick={() => colorInputRef.current?.click()}
          />
          <input
            ref={colorInputRef}
            className="migration-color-field__native"
            type="color"
            value={normalized}
            onChange={(event) => onChange(event.target.value)}
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  )
}
