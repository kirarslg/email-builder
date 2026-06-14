import { useId, useState } from 'react'

interface UploadedAsset {
  src: string
  name: string
}

interface ImageUploadFieldProps {
  label?: string
  description?: string
  multiple?: boolean
  items: UploadedAsset[]
  onUpload: (files: FileList) => Promise<void>
  onRemove: (index?: number) => void
  buttonLabel?: string
}

export function ImageUploadField({
  label,
  description,
  multiple = false,
  items,
  onUpload,
  onRemove,
  buttonLabel,
}: ImageUploadFieldProps) {
  const inputId = useId()
  const [busy, setBusy] = useState(false)
  const [dragover, setDragover] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      await onUpload(files)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ui-field">
      {label && (
        <label className="ui-label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="migration-color-field__native"
        onChange={async (e) => {
          await handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div className="ui-dropzone-group">
        <label
          htmlFor={inputId}
          className={`ui-dropzone${dragover ? ' is-dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
          onDragLeave={() => setDragover(false)}
          onDrop={async (e) => {
            e.preventDefault()
            setDragover(false)
            await handleFiles(e.dataTransfer.files)
          }}
        >
          <span className="ui-dropzone__text">
            {busy ? 'Загружаю...' : 'Перетащите изображение сюда или нажмите кнопку ниже'}
          </span>
          <span className="ui-dropzone__btn">
            {buttonLabel || 'Выбрать файл'}
          </span>
        </label>

        {description && (
          <p className="ui-dropzone__description">{description}</p>
        )}
      </div>

      {items.map((item, index) => (
        <div className="ui-upload-meta has-file" key={`${item.name}-${index}`}>
          <span className="ui-upload-meta__name">{item.name}</span>
          <button
            className="ui-btn ui-btn--xxs ui-btn--error-light ui-btn--icon ui-upload-meta__remove"
            type="button"
            aria-label="Удалить изображение"
            title="Удалить изображение"
            onClick={() => onRemove(index)}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path d="M1 1L7 7M7 1L1 7" stroke="#FE495B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
