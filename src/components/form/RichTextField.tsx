interface RichTextFieldProps {
  label: string
  value: string
  className?: string
  hint?: string
  onChange: (value: string) => void
}

export function RichTextField({
  label,
  value,
  className = '',
  hint = 'Поддерживаются ссылки: [Текст|https://...], <https://...=Текст> и обычные URL.',
  onChange,
}: RichTextFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <textarea
        className={`ui-input ${className}`.trim()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="migration-richtext-hint">{hint}</p>
    </div>
  )
}
