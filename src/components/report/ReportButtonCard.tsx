import { ColorField } from '../form/ColorField'
import { NumberField } from '../form/NumberField'
import { SelectField } from '../form/SelectField'
import { TextField } from '../form/TextField'
import type { SectionButton } from '../../domain/report/types'

export type ButtonField =
  | 'text' | 'url' | 'textColor' | 'bgColor'
  | 'align' | 'size' | 'width' | 'radius' | 'colorMode'

interface ButtonCardProps {
  index: number
  button: SectionButton
  onField: (field: ButtonField, value: string | number) => void
  onDelete: () => void
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M7.92 1.18a.7.7 0 0 1 .99.99L5.99 5l2.92 2.93a.7.7 0 1 1-.99.99L5 5.99 2.07 8.92a.7.7 0 0 1-.99-.99L4 5 1.08 2.07a.7.7 0 1 1 .99-.99L5 4l2.92-2.93z" fill="currentColor"/>
    </svg>
  )
}

export function ButtonCard({ index, button, onField, onDelete }: ButtonCardProps) {
  return (
    <div className="ui-editable-input-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{`Кнопка ${index + 1}`}</span>
        <button
          type="button"
          className="ui-btn ui-btn--xxs ui-btn--icon ui-btn--error-light"
          title="Удалить кнопку"
          aria-label="Удалить кнопку"
          onClick={onDelete}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Контент */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="ui-group-head"><span className="ui-group-head__title">Контент</span></div>
        <div className="field-group">
          <TextField label="Текст кнопки" value={button.text} onChange={(v) => onField('text', v)} />
          <TextField label="URL кнопки" value={button.url} onChange={(v) => onField('url', v)} />
        </div>
      </div>

      {/* Свойства */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="ui-group-head"><span className="ui-group-head__title">Свойства</span></div>
        <div className="field-group field-group--3">
          <SelectField
            label="Положение"
            value={button.align}
            options={[
              { value: 'left', label: 'Слева' },
              { value: 'center', label: 'По центру' },
              { value: 'right', label: 'Справа' },
            ]}
            onChange={(v) => onField('align', v)}
          />
          <SelectField
            label="Размер"
            value={button.size}
            options={[
              { value: 's', label: 'Маленький' },
              { value: 'm', label: 'Средний' },
            ]}
            onChange={(v) => onField('size', v)}
          />
          <ColorField label="Цвет текста" value={button.textColor} fallback="#333333" onChange={(v) => onField('textColor', v)} />
        </div>
        <div className="field-group field-group--3">
          <NumberField label="Ширина кнопки" value={button.width} onChange={(v) => onField('width', v ?? 0)} />
          <NumberField label="Скругление углов" value={button.radius} onChange={(v) => onField('radius', v ?? 0)} />
          <SelectField
            label="Тип цвета кнопки"
            value={button.colorMode}
            options={[
              { value: 'solid', label: 'Однотонный' },
              { value: 'gradient', label: 'Градиент' },
            ]}
            onChange={(v) => onField('colorMode', v)}
          />
        </div>
        <div className="field-group field-group--3">
          <ColorField label="Цвет кнопки" value={button.bgColor} fallback="#EDF2F6" onChange={(v) => onField('bgColor', v)} />
        </div>
      </div>
    </div>
  )
}
