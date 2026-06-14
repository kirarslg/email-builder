import type { ReactNode } from 'react'

interface FieldActionRowProps {
  children: ReactNode
  action: ReactNode
  className?: string
}

export function FieldActionRow({ children, action, className = '' }: FieldActionRowProps) {
  return (
    <div className={`field-group field-group--field-action ${className}`.trim()}>
      {children}
      <div className="ui-actions ui-actions--compact">{action}</div>
    </div>
  )
}
