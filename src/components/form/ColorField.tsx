import { useId } from 'react'
import { clampHexColor } from '../../domain/shared/html'
import { ColorPicker } from '@/components/ui/color-picker'

interface ColorFieldProps {
  label: string
  value: string
  fallback?: string
  onChange: (value: string) => void
}

export function ColorField({ label, value, fallback = '#000000', onChange }: ColorFieldProps) {
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
          <ColorPicker
            value={normalized}
            onChange={(c) => onChange(clampHexColor(c, normalized))}
            aria-label={`${label}: открыть выбор цвета`}
          />
        </div>
      </div>
    </div>
  )
}
