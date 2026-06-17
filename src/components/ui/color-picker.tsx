import * as React from "react"
import { HexAlphaColorPicker } from "react-colorful"
import { Pipette, ChevronsUpDown } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  /** Current color — `#rrggbb` or `#rrggbbaa`. */
  value: string
  onChange: (value: string) => void
  "aria-label"?: string
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  /** Custom trigger content. When provided, renders this instead of the colour swatch. */
  trigger?: React.ReactNode
  /** Fires on trigger mousedown — used to capture editor selection before the popover opens. */
  onTriggerMouseDown?: () => void
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

function isValidHex(v: string): boolean {
  return HEX_RE.test(v)
}

// EyeDropper API — supported in Chromium-based browsers (Chrome, Edge, Arc, Opera).
type EyeDropperResult = { sRGBHex: string }
interface EyeDropperCtor {
  new (): { open(): Promise<EyeDropperResult> }
}
const EyeDropperGlobal = (typeof window !== "undefined"
  ? (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper
  : undefined)

export function ColorPicker({
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
  style,
  disabled,
  trigger,
  onTriggerMouseDown,
}: ColorPickerProps) {
  const [draft, setDraft] = React.useState(value)
  React.useEffect(() => {
    setDraft(value)
  }, [value])

  const safeValue = isValidHex(value) ? value : "#000000"

  async function pickFromScreen() {
    if (!EyeDropperGlobal) return
    try {
      const result = await new EyeDropperGlobal().open()
      onChange(result.sRGBHex.toLowerCase())
    } catch {
      /* user cancelled */
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ? (
          <button
            type="button"
            aria-label={ariaLabel ?? "Выбрать цвет"}
            disabled={disabled}
            className={className}
            style={style}
            onMouseDown={onTriggerMouseDown}
          >
            {trigger}
          </button>
        ) : (
          <button
            type="button"
            aria-label={ariaLabel ?? "Выбрать цвет"}
            disabled={disabled}
            className={cn(
              "ui-color-picker__trigger",
              disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
            style={{ backgroundColor: safeValue, ...style }}
            onMouseDown={onTriggerMouseDown}
          />
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-[232px] p-3 space-y-2.5"
        sideOffset={8}
        align="end"
      >
        <div className="cp-picker">
          <HexAlphaColorPicker
            color={safeValue}
            onChange={(c) => {
              setDraft(c)
              onChange(c.toLowerCase())
            }}
          />
        </div>

        <div className="flex items-stretch gap-2">
          {EyeDropperGlobal && (
            <button
              type="button"
              onClick={pickFromScreen}
              aria-label="Взять цвет с экрана"
              title="Взять цвет с экрана"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Pipette className="h-3.5 w-3.5" />
            </button>
          )}

          <input
            value={draft}
            onChange={(e) => {
              let next = e.target.value
              if (!next.startsWith("#")) next = `#${next}`
              setDraft(next)
              if (isValidHex(next)) onChange(next.toLowerCase())
            }}
            onBlur={() => {
              if (!isValidHex(draft)) setDraft(value)
            }}
            spellCheck={false}
            maxLength={9}
            className="flex h-8 min-w-0 flex-1 rounded-md border-2 border-border bg-background px-3 text-sm font-mono uppercase outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
          />

          <div className="flex h-8 items-center gap-1 rounded-md border-2 border-border bg-background px-2 text-[11px] font-medium">
            Hex
            <ChevronsUpDown className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
