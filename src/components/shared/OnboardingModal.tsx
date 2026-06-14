import { useState } from 'react'

interface OnboardingModalProps {
  onClose: () => void
}

interface Step {
  key: string
  visualClass: string
  visual: React.ReactNode
  label: string | null
  title: string
  desc: string
  features: string[] | null
}

function VisualWelcome() {
  return (
    <svg width="200" height="140" viewBox="0 0 200 140" fill="none" aria-hidden="true">
      <rect x="70" y="20" width="60" height="60" rx="16" fill="#3dc47a" opacity="0.15"/>
      <rect x="82" y="32" width="36" height="36" rx="10" fill="#3dc47a" opacity="0.3"/>
      <rect x="84" y="38" width="32" height="22" rx="4" fill="#3dc47a"/>
      <path d="M84 40l16 11 16-11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="44" cy="50" r="5" fill="#3dc47a" opacity="0.25"/>
      <circle cx="156" cy="70" r="7" fill="#3dc47a" opacity="0.2"/>
      <circle cx="150" cy="35" r="4" fill="#3dc47a" opacity="0.15"/>
      <circle cx="52" cy="80" r="3" fill="#3dc47a" opacity="0.2"/>
      <rect x="60" y="94" width="80" height="8" rx="4" fill="#3dc47a" opacity="0.2"/>
      <rect x="76" y="108" width="48" height="6" rx="3" fill="#3dc47a" opacity="0.12"/>
    </svg>
  )
}

function VisualEmail() {
  return (
    <svg width="320" height="196" viewBox="0 0 320 196" fill="none" aria-hidden="true">
      <rect x="20" y="24" width="118" height="148" rx="10" fill="white" opacity="0.85"/>
      <rect x="32" y="38" width="50" height="5" rx="2.5" fill="#9ba6b1"/>
      <rect x="32" y="48" width="94" height="20" rx="4" fill="#edf2f6"/>
      <rect x="32" y="76" width="50" height="5" rx="2.5" fill="#9ba6b1"/>
      <rect x="32" y="86" width="94" height="20" rx="4" fill="#edf2f6"/>
      <rect x="32" y="114" width="50" height="5" rx="2.5" fill="#9ba6b1"/>
      <rect x="32" y="124" width="94" height="32" rx="4" fill="#edf2f6"/>
      <path d="M148 98l12 0" stroke="#3dc47a" strokeWidth="2" strokeLinecap="round"/>
      <path d="M154 93l6 5-6 5" stroke="#3dc47a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="168" y="24" width="132" height="148" rx="10" fill="white" opacity="0.85"/>
      <rect x="178" y="34" width="112" height="48" rx="6" fill="#edf2f6"/>
      <rect x="186" y="44" width="60" height="7" rx="3" fill="#3dc47a" opacity="0.5"/>
      <rect x="186" y="56" width="90" height="5" rx="2.5" fill="#9ba6b1" opacity="0.6"/>
      <rect x="186" y="65" width="72" height="5" rx="2.5" fill="#9ba6b1" opacity="0.4"/>
      <rect x="178" y="90" width="112" height="5" rx="2.5" fill="#E0E8F2"/>
      <rect x="178" y="100" width="112" height="5" rx="2.5" fill="#E0E8F2"/>
      <rect x="178" y="110" width="90" height="5" rx="2.5" fill="#E0E8F2"/>
      <rect x="206" y="126" width="56" height="22" rx="6" fill="#3dc47a" opacity="0.7"/>
      <rect x="220" y="133" width="28" height="8" rx="4" fill="white" opacity="0.8"/>
      <rect x="178" y="156" width="60" height="5" rx="2.5" fill="#E0E8F2"/>
    </svg>
  )
}

function VisualBuilder() {
  return (
    <svg width="320" height="196" viewBox="0 0 320 196" fill="none" aria-hidden="true">
      <rect x="20" y="16" width="280" height="164" rx="12" fill="white" opacity="0.7"/>
      <rect x="36" y="28" width="248" height="44" rx="6" fill="#e8f2f8"/>
      <rect x="36" y="28" width="248" height="44" rx="6" stroke="#b8d4e8" strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="148" y="42" width="24" height="16" rx="4" fill="#9ba6b1" opacity="0.4"/>
      <rect x="36" y="80" width="248" height="46" rx="6" fill="#f8f4ff"/>
      <rect x="36" y="80" width="248" height="46" rx="6" stroke="#c4b8f0" strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="50" y="92" width="120" height="6" rx="3" fill="#9ba6b1" opacity="0.5"/>
      <rect x="50" y="103" width="180" height="5" rx="2.5" fill="#9ba6b1" opacity="0.3"/>
      <rect x="50" y="113" width="140" height="5" rx="2.5" fill="#9ba6b1" opacity="0.3"/>
      <rect x="42" y="136" width="236" height="30" rx="6" fill="white"/>
      <rect x="42" y="136" width="236" height="30" rx="6" stroke="#3dc47a" strokeWidth="1.5"/>
      <rect x="126" y="145" width="68" height="12" rx="6" fill="#3dc47a" opacity="0.7"/>
      <circle cx="30" cy="50" r="2.5" fill="#9ba6b1" opacity="0.6"/>
      <circle cx="30" cy="103" r="2.5" fill="#9ba6b1" opacity="0.6"/>
      <circle cx="30" cy="151" r="2.5" fill="#3dc47a" opacity="0.8"/>
    </svg>
  )
}

function VisualReport() {
  return (
    <svg width="320" height="196" viewBox="0 0 320 196" fill="none" aria-hidden="true">
      <rect x="20" y="16" width="280" height="164" rx="12" fill="white" opacity="0.85"/>
      <rect x="20" y="16" width="280" height="52" rx="12" fill="#f5f8fa"/>
      <rect x="20" y="48" width="280" height="20" fill="#f5f8fa"/>
      <rect x="34" y="28" width="24" height="24" rx="6" fill="#3dc47a" opacity="0.3"/>
      <rect x="38" y="32" width="16" height="16" rx="4" fill="#3dc47a" opacity="0.5"/>
      <rect x="68" y="30" width="80" height="8" rx="4" fill="#333" opacity="0.5"/>
      <rect x="68" y="44" width="56" height="6" rx="3" fill="#9ba6b1" opacity="0.5"/>
      <rect x="238" y="30" width="46" height="18" rx="9" fill="#3dc47a" opacity="0.2"/>
      <rect x="246" y="36" width="30" height="6" rx="3" fill="#3dc47a" opacity="0.6"/>
      <rect x="34" y="78" width="60" height="28" rx="6" fill="#f3f5f7"/>
      <rect x="38" y="83" width="32" height="4" rx="2" fill="#9ba6b1"/>
      <rect x="38" y="91" width="44" height="5" rx="2.5" fill="#333" opacity="0.5"/>
      <rect x="102" y="78" width="60" height="28" rx="6" fill="#f3f5f7"/>
      <rect x="106" y="83" width="32" height="4" rx="2" fill="#9ba6b1"/>
      <rect x="106" y="91" width="44" height="5" rx="2.5" fill="#333" opacity="0.5"/>
      <rect x="170" y="78" width="60" height="28" rx="6" fill="#f3f5f7"/>
      <rect x="174" y="83" width="32" height="4" rx="2" fill="#9ba6b1"/>
      <rect x="174" y="91" width="44" height="5" rx="2.5" fill="#333" opacity="0.5"/>
      <rect x="34" y="116" width="252" height="8" rx="3" fill="#E0E8F2"/>
      <rect x="34" y="130" width="252" height="8" rx="3" fill="#E0E8F2" opacity="0.6"/>
      <rect x="34" y="144" width="252" height="8" rx="3" fill="#E0E8F2" opacity="0.4"/>
      <rect x="120" y="128" width="36" height="12" rx="6" fill="#3dc47a" opacity="0.25"/>
      <rect x="120" y="142" width="48" height="12" rx="6" fill="#f59e0b" opacity="0.25"/>
      <rect x="238" y="158" width="50" height="16" rx="4" fill="#3dc47a" opacity="0.6"/>
    </svg>
  )
}

function VisualDone() {
  return (
    <svg width="200" height="140" viewBox="0 0 200 140" fill="none" aria-hidden="true">
      <circle cx="100" cy="68" r="44" fill="#3dc47a" opacity="0.12"/>
      <circle cx="100" cy="68" r="34" fill="#3dc47a" opacity="0.18"/>
      <circle cx="100" cy="68" r="24" fill="#3dc47a" opacity="0.7"/>
      <path d="M88 68l8 8 16-16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="48" cy="38" r="4" fill="#3dc47a" opacity="0.3"/>
      <circle cx="152" cy="44" r="5" fill="#3dc47a" opacity="0.25"/>
      <circle cx="56" cy="96" r="3" fill="#3dc47a" opacity="0.2"/>
      <circle cx="148" cy="92" r="3.5" fill="#3dc47a" opacity="0.25"/>
      <path d="M138 26l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="#3dc47a" opacity="0.3"/>
      <path d="M58 108l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5 1.5-3.5z" fill="#3dc47a" opacity="0.2"/>
    </svg>
  )
}

const steps: Step[] = [
  {
    key: 'welcome',
    visualClass: 'onb-visual--welcome',
    visual: <VisualWelcome />,
    label: null,
    title: 'Добро пожаловать!',
    desc: 'Конструктор писем — инструмент для создания HTML-писем и отчётов CI/CD прямо в браузере. Без сервера, без регистрации.',
    features: null,
  },
  {
    key: 'email',
    visualClass: 'onb-visual--email',
    visual: <VisualEmail />,
    label: 'Раздел «Письма»',
    title: 'Создавайте письма через форму',
    desc: 'Заполните поля — заголовок, изображения, текст — и получите готовый HTML сразу. Предпросмотр обновляется в реальном времени.',
    features: [
      'Загрузка изображений шапки и подписи',
      'Форматирование текста с Rich Text Editor',
      'Копирование HTML или скачивание файла',
    ],
  },
  {
    key: 'builder',
    visualClass: 'onb-visual--builder',
    visual: <VisualBuilder />,
    label: 'Раздел «Письма» → Конструктор',
    title: 'Собирайте письмо из блоков',
    desc: 'Переключитесь в режим «Конструктор»: перетаскивайте блоки в нужном порядке и редактируйте текст прямо в превью.',
    features: [
      'Блоки: текст, кнопка, изображение, разделитель',
      'Drag & drop для изменения порядка блоков',
      'Инлайн-редактирование текста в превью',
    ],
  },
  {
    key: 'report',
    visualClass: 'onb-visual--report',
    visual: <VisualReport />,
    label: 'Раздел «Отчёты»',
    title: 'Генерируйте CI/CD отчёты',
    desc: 'Настройте шапку, таблицу ячеек, сводку, алерты, репозитории и кнопки действий — и получите готовый HTML-отчёт.',
    features: [
      'Кастомизация цветов, логотипа, фона',
      'Таблицы репозиториев с бейджами статусов',
      'Перетаскивание ячеек для изменения порядка',
    ],
  },
  {
    key: 'done',
    visualClass: 'onb-visual--done',
    visual: <VisualDone />,
    label: null,
    title: 'Всё готово к работе!',
    desc: 'Если понадобится напоминание — нажмите «?» в шапке приложения, и онбординг откроется снова. Удачи!',
    features: null,
  },
]

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const isLast = step === steps.length - 1
  const isFirst = step === 0

  function next() {
    if (isLast) onClose()
    else setStep((s) => s + 1)
  }

  function prev() {
    if (!isFirst) setStep((s) => s - 1)
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="onb-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Онбординг"
    >
      <div className="onb-card">
        <div className={`onb-visual ${current.visualClass}`}>
          {current.visual}
        </div>

        <div className="onb-body">
          {current.label && (
            <div className="onb-step-label">{current.label}</div>
          )}

          <h2 className="onb-title">{current.title}</h2>
          <p className="onb-desc">{current.desc}</p>

          {current.features && (
            <ul className="onb-features" role="list">
              {current.features.map((f) => (
                <li className="onb-feature" key={f}>
                  <span className="onb-feature__icon" aria-hidden="true">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#3dc47a"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="onb-footer">
            <div className="onb-dots" aria-hidden="true">
              {steps.map((s, i) => (
                <span
                  key={s.key}
                  className={`onb-dot${i === step ? ' is-active' : ''}`}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>

            {!isLast && (
              <button className="onb-skip" type="button" onClick={onClose}>
                Пропустить
              </button>
            )}

            {!isFirst && (
              <button
                className="ui-btn ui-btn--s ui-btn--ghost"
                type="button"
                onClick={prev}
              >
                Назад
              </button>
            )}

            <button className="ui-btn ui-btn--s" type="button" onClick={next}>
              {isLast ? 'Начать работу' : 'Далее →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   TOUR (spotlight) version — disabled.

   To switch to the interactive tour:
   1. Comment out the OnboardingModal export above.
   2. Uncomment the OnboardingTour block below and
      rename it to OnboardingModal.
   3. In App.tsx pass: activeTab, setActiveTab,
      emailViewMode, setEmailViewMode props.
   4. Uncomment tour styles in onboarding.css.
   ──────────────────────────────────────────── */

// import { useEffect, useLayoutEffect, useRef } from 'react'
//
// type Tab = 'email' | 'report'
// type EmailMode = 'inputs' | 'builder'
//
// interface OnboardingTourProps {
//   onClose: () => void
//   activeTab: Tab
//   setActiveTab: (t: Tab) => void
//   emailViewMode: EmailMode
//   setEmailViewMode: (m: EmailMode) => void
// }
//
// interface TourStep {
//   selector: string
//   title: string
//   text: string
//   tab?: Tab
//   emailMode?: EmailMode
// }
//
// const tourSteps: TourStep[] = [
//   { selector: '.app-nav', title: 'Разделы конструктора',
//     text: 'Сверху переключайтесь между «Письмами» и «Отчётами».', tab: 'email' },
//   { selector: '#emailInputsCard', title: 'Форма письма',
//     text: 'Заполняйте поля — секции раскрываются отдельно.', tab: 'email', emailMode: 'inputs' },
//   { selector: '.email-view-toggle', title: 'Режимы работы',
//     text: 'Переключайтесь между формой и конструктором.', tab: 'email', emailMode: 'inputs' },
//   { selector: '#emailBuilderCard', title: 'Визуальный конструктор',
//     text: 'Перетаскивайте блоки и редактируйте текст.', tab: 'email', emailMode: 'builder' },
//   { selector: '#emailResultCard', title: 'Превью и экспорт',
//     text: 'Превью, размер HTML, копирование и скачивание.', tab: 'email', emailMode: 'inputs' },
//   { selector: '.app-nav__item:nth-of-type(2)', title: 'Раздел «Отчёты»',
//     text: 'Конструктор CI/CD отчётов.', tab: 'email' },
//   { selector: '#reportInputsCard', title: 'Настройки отчёта',
//     text: 'Шапка, ячейки, сводка, репозитории — всё формами.', tab: 'report' },
//   { selector: '#reportPreviewPane', title: 'Превью отчёта',
//     text: 'Результат, HTML и кнопки экспорта.', tab: 'report' },
//   { selector: '.onb-help-btn', title: 'Подсказки всегда рядом',
//     text: 'Кнопка «?» в шапке открывает онбординг заново.', tab: 'report' },
// ]
//
// const CARD_WIDTH = 340
// const CARD_HEIGHT_EST = 240
// const GAP = 20
// const VIEWPORT_PAD = 16
//
// function clamp(v: number, min: number, max: number) {
//   return Math.min(Math.max(v, min), max)
// }
//
// export function OnboardingTour({
//   onClose, activeTab, setActiveTab, emailViewMode, setEmailViewMode,
// }: OnboardingTourProps) {
//   const [stepIndex, setStepIndex] = useState(0)
//   const [cardPos, setCardPos] = useState({ top: -9999, left: -9999, ready: false })
//   const cardRef = useRef<HTMLDivElement>(null)
//   const targetRef = useRef<HTMLElement | null>(null)
//   const liftedRef = useRef<HTMLElement[]>([])
//
//   const current = tourSteps[stepIndex]
//   const isLast = stepIndex === tourSteps.length - 1
//   const isFirst = stepIndex === 0
//
//   useEffect(() => {
//     if (current.tab && current.tab !== activeTab) setActiveTab(current.tab)
//     if (current.emailMode && current.emailMode !== emailViewMode) setEmailViewMode(current.emailMode)
//     setCardPos((p) => ({ ...p, ready: false }))
//   }, [stepIndex])
//
//   useLayoutEffect(() => {
//     let raf = 0, attempts = 0
//     const MAX_ATTEMPTS = 20
//     const clearHL = () => {
//       if (targetRef.current) targetRef.current.classList.remove('onb-target')
//       liftedRef.current.forEach((n) => n.classList.remove('onb-lifted'))
//       targetRef.current = null
//       liftedRef.current = []
//     }
//     const update = () => {
//       const target = document.querySelector(current.selector) as HTMLElement | null
//       if (!target || !target.getClientRects().length) {
//         attempts += 1
//         if (attempts < MAX_ATTEMPTS) raf = requestAnimationFrame(update)
//         return
//       }
//       if (targetRef.current && targetRef.current !== target) {
//         targetRef.current.classList.remove('onb-target')
//       }
//       liftedRef.current.forEach((n) => n.classList.remove('onb-lifted'))
//       target.classList.add('onb-target')
//       targetRef.current = target
//       const lifted: HTMLElement[] = []
//       const candidates = [
//         target.closest('.card'), target.closest('.app-header'),
//         target.closest('.report-pane'), target.closest('.email-pane'),
//       ]
//       candidates.forEach((node) => {
//         if (node && node !== target && !lifted.includes(node as HTMLElement)) {
//           lifted.push(node as HTMLElement)
//         }
//       })
//       lifted.forEach((n) => n.classList.add('onb-lifted'))
//       liftedRef.current = lifted
//       const rect = target.getBoundingClientRect()
//       const cardEl = cardRef.current
//       const cardW = cardEl?.offsetWidth || CARD_WIDTH
//       const cardH = cardEl?.offsetHeight || CARD_HEIGHT_EST
//       const vw = window.innerWidth, vh = window.innerHeight
//       const fitsRight = rect.right + GAP + cardW <= vw - VIEWPORT_PAD
//       const fitsLeft = rect.left - GAP - cardW >= VIEWPORT_PAD
//       const fitsBottom = rect.bottom + GAP + cardH <= vh - VIEWPORT_PAD
//       const fitsTop = rect.top - GAP - cardH >= VIEWPORT_PAD
//       let top: number, left: number
//       if (fitsRight) { left = rect.right + GAP; top = rect.top + rect.height/2 - cardH/2 }
//       else if (fitsLeft) { left = rect.left - cardW - GAP; top = rect.top + rect.height/2 - cardH/2 }
//       else if (fitsBottom) { left = rect.left + rect.width/2 - cardW/2; top = rect.bottom + GAP }
//       else if (fitsTop) { left = rect.left + rect.width/2 - cardW/2; top = rect.top - cardH - GAP }
//       else { left = vw/2 - cardW/2; top = vh/2 - cardH/2 }
//       top = clamp(top, VIEWPORT_PAD, Math.max(VIEWPORT_PAD, vh - cardH - VIEWPORT_PAD))
//       left = clamp(left, VIEWPORT_PAD, Math.max(VIEWPORT_PAD, vw - cardW - VIEWPORT_PAD))
//       setCardPos({ top: Math.round(top), left: Math.round(left), ready: true })
//     }
//     raf = requestAnimationFrame(() => { raf = requestAnimationFrame(update) })
//     const onResize = () => { cancelAnimationFrame(raf); attempts = 0; raf = requestAnimationFrame(update) }
//     window.addEventListener('resize', onResize)
//     window.addEventListener('scroll', onResize, true)
//     return () => {
//       cancelAnimationFrame(raf)
//       window.removeEventListener('resize', onResize)
//       window.removeEventListener('scroll', onResize, true)
//       clearHL()
//     }
//   }, [stepIndex, activeTab, emailViewMode])
//
//   // ...rest of tour UI omitted — see git history for full version
// }
