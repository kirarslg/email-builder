interface NumberFieldProps {
  label: string
  value: number | null
  allowEmpty?: boolean
  onChange: (value: number | null) => void
}

export function NumberField({ label, value, allowEmpty = false, onChange }: NumberFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <input
        className="ui-input"
        inputMode="numeric"
        value={value == null ? '' : String(value)}
        onChange={(event) => {
          const raw = event.target.value.trim()
          if (!raw && allowEmpty) {
            onChange(null)
            return
          }
          const next = Number(raw)
          if (Number.isFinite(next)) onChange(next)
        }}
      />
    </div>
  )
}
