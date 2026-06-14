import type { CardComponentProps } from 'onborda'
import { useOnborda } from 'onborda'

/**
 * Custom card component for Onborda — single-step look (no prev/next),
 * matches our shadcn-style design tokens.
 */
export function OnbordaCard({ step }: CardComponentProps) {
  const { closeOnborda } = useOnborda()
  return (
    <div className="onb-tour-card">
      <h3 className="onb-tour-card__title">{step.title}</h3>
      <div className="onb-tour-card__text">{step.content}</div>
      <div className="onb-tour-card__actions">
        <button
          className="ui-btn ui-btn--s ui-btn--muted"
          type="button"
          onClick={closeOnborda}
        >
          Закрыть
        </button>
        <span style={{ flex: 1 }} />
        <button className="ui-btn ui-btn--s" type="button" onClick={closeOnborda}>
          Понятно
        </button>
      </div>
    </div>
  )
}
