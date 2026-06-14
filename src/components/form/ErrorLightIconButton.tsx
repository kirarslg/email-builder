interface ErrorLightIconButtonProps {
  label: string
  title?: string
  disabled?: boolean
  onClick: () => void
}

export function ErrorLightIconButton({
  label,
  title,
  disabled = false,
  onClick,
}: ErrorLightIconButtonProps) {
  return (
    <button
      aria-label={label}
      className="ui-btn ui-btn--s ui-btn--error-light ui-btn--icon"
      disabled={disabled}
      title={title || label}
      type="button"
      onClick={onClick}
    >
      <img alt="" aria-hidden="true" src="/Icons/close.svg" />
    </button>
  )
}
