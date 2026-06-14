type Tab = 'email' | 'report' | 'help'
type EmailMode = 'inputs' | 'builder'

interface HelpPageProps {
  onLaunchOnboarding: () => void
  onShowTarget: (target: HelpTarget) => void
}

export interface HelpTarget {
  selector: string
  tab: Tab
  emailMode?: EmailMode
}

interface HelpItem {
  title: string
  text: string
  target?: HelpTarget
  linkLabel?: string
}

interface HelpSection {
  key: string
  title: string
  intro?: string
  items: HelpItem[]
}

const sections: HelpSection[] = [
  {
    key: 'overview',
    title: 'Обзор',
    intro:
      'Конструктор писем — инструмент для генерации HTML-писем и CI/CD отчётов прямо в браузере. Все настройки сохраняются локально, без сервера и регистрации.',
    items: [
      {
        title: 'Раздел «Письма»',
        text: 'Создание писем — через форму или визуальный конструктор. Оба режима дают одинаковый HTML на выходе.',
        target: { selector: '.app-nav__item:nth-of-type(1)', tab: 'email' },
        linkLabel: 'Перейти в раздел',
      },
      {
        title: 'Раздел «Отчёты»',
        text: 'Генерация отчётов CI/CD: настройка шапки, ячеек, сводок, репозиториев, кнопок действий и алертов.',
        target: { selector: '.app-nav__item:nth-of-type(2)', tab: 'report' },
        linkLabel: 'Перейти в раздел',
      },
    ],
  },
  {
    key: 'email',
    title: 'Раздел «Письма»',
    items: [
      {
        title: 'Режим «Форма»',
        text: 'Заполняйте поля по секциям: шапка, заголовок, тело, кнопка, разделитель, подпись. Каждая секция раскрывается отдельно и сразу влияет на превью слева.',
        target: { selector: '#emailInputsCard', tab: 'email', emailMode: 'inputs' },
        linkLabel: 'Открыть форму письма',
      },
      {
        title: 'Режим «Конструктор»',
        text: 'Перетаскивайте блоки (текст, кнопка, изображение, разделитель) в нужном порядке. Текст редактируется прямо в превью — кликните по нему дважды.',
        target: { selector: '#emailBuilderCard', tab: 'email', emailMode: 'builder' },
        linkLabel: 'Открыть конструктор',
      },
      {
        title: 'Превью и экспорт',
        text: 'Слева видно живое превью и размер итогового HTML. Кнопки сверху превью копируют HTML в буфер или скачивают .html-файл.',
        target: { selector: '#emailResultCard', tab: 'email', emailMode: 'inputs' },
        linkLabel: 'Показать превью',
      },
    ],
  },
  {
    key: 'report',
    title: 'Раздел «Отчёты»',
    items: [
      {
        title: 'Настройка шапки',
        text: 'Логотип, фоновое изображение, заголовок, статус. Цвета настраиваются отдельно — для заголовка, фона шапки и бордера.',
        target: { selector: '#reportInputsCard', tab: 'report' },
        linkLabel: 'Открыть настройки отчёта',
      },
      {
        title: 'Таблица ячеек',
        text: 'Раздел «Таблица» — карточки с заголовком и контентом для каждой ячейки. Перетаскивайте за ручку слева, чтобы менять порядок. Кнопкой добавляйте новые столбцы.',
        target: { selector: '#reportInputsCard', tab: 'report' },
        linkLabel: 'Открыть редактор',
      },
      {
        title: 'Секции отчёта',
        text: 'Сводка, алерты, таблицы параметров, репозиториев, PR-ы — каждую секцию можно включать и выключать чекбоксами. Внутри секций — те же формы с превью.',
        target: { selector: '#reportInputsCard', tab: 'report' },
        linkLabel: 'Открыть секции',
      },
      {
        title: 'Экспорт',
        text: 'Готовый HTML отчёта можно скопировать или скачать кнопками сверху превью. Размер итогового файла виден рядом с заголовком.',
        target: { selector: '#reportPreviewPane', tab: 'report' },
        linkLabel: 'Показать превью отчёта',
      },
    ],
  },
  {
    key: 'tips',
    title: 'Советы',
    items: [
      {
        title: 'Сброс к дефолтам',
        text: 'В каждом разделе есть кнопка «Сбросить к дефолтам» — возвращает все поля к исходным значениям.',
      },
      {
        title: 'Drag & drop',
        text: 'Карточки с ручкой перетаскивания (⠿ слева) можно менять местами. Зелёная полоска показывает место вставки.',
      },
      {
        title: 'Превью в реальном времени',
        text: 'Любое изменение в форме сразу же отражается в превью слева — без отдельной кнопки «Применить».',
      },
    ],
  },
]

export function HelpPage({ onLaunchOnboarding, onShowTarget }: HelpPageProps) {
  return (
    <div className="help-page">
      <div className="card help-card">
        <div className="ui-panel-header">
          <div className="ui-panel-header__title">Справка</div>
          <div className="ui-panel-header__actions">
            <button
              className="ui-btn ui-btn--m"
              type="button"
              onClick={onLaunchOnboarding}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ marginRight: 6 }}
              >
                <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M6 6.5c0-1.1.9-2 2-2s2 .9 2 2c0 .7-.4 1.1-1 1.5-.6.4-1 .8-1 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
              </svg>
              Пройти онбординг заново
            </button>
          </div>
        </div>

        <div className="help-body">
          {sections.map((section) => (
            <section className="help-section" key={section.key}>
              <h3 className="help-section__title">{section.title}</h3>
              {section.intro && (
                <p className="help-section__intro">{section.intro}</p>
              )}
              <ul className="help-list" role="list">
                {section.items.map((item) => (
                  <li className="help-item" key={item.title}>
                    <div className="help-item__title">{item.title}</div>
                    <div className="help-item__text">{item.text}</div>
                    {item.target && (
                      <button
                        className="help-item__link"
                        type="button"
                        onClick={() => onShowTarget(item.target!)}
                      >
                        {item.linkLabel || 'Показать'}
                        <span className="help-item__link-arrow" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
