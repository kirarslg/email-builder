import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string
  value: string
  onChange: (value: string) => void
}

export function TextField({ label, value, onChange, id, ...props }: TextFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      <input
        {...props}
        id={id}
        className={`ui-input ${props.className || ''}`.trim()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
