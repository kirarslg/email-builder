interface TextareaFieldProps {
  label: string
  value: string
  className?: string
  onChange: (value: string) => void
}

export function TextareaField({ label, value, className = '', onChange }: TextareaFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <textarea
        className={`ui-input ${className}`.trim()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
