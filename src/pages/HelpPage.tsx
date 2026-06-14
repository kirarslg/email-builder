interface HelpPageProps {
  onLaunchOnboarding: () => void
}

interface HelpItem {
  title: string
  text: string
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
      },
      {
        title: 'Раздел «Отчёты»',
        text: 'Генерация отчётов CI/CD: настройка шапки, ячеек, сводок, репозиториев, кнопок действий и алертов.',
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
      },
      {
        title: 'Режим «Конструктор»',
        text: 'Перетаскивайте блоки (текст, кнопка, изображение, разделитель) в нужном порядке. Текст редактируется прямо в превью — кликните по нему дважды.',
      },
      {
        title: 'Превью и экспорт',
        text: 'Слева видно живое превью и размер итогового HTML. Кнопки сверху превью копируют HTML в буфер или скачивают .html-файл.',
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
      },
      {
        title: 'Таблица ячеек',
        text: 'Раздел «Таблица» — карточки с заголовком и контентом для каждой ячейки. Перетаскивайте за ручку слева, чтобы менять порядок. Кнопкой добавляйте новые столбцы.',
      },
      {
        title: 'Секции отчёта',
        text: 'Сводка, алерты, таблицы параметров, репозиториев, PR-ы — каждую секцию можно включать и выключать чекбоксами. Внутри секций — те же формы с превью.',
      },
      {
        title: 'Экспорт',
        text: 'Готовый HTML отчёта можно скопировать или скачать кнопками сверху превью. Размер итогового файла виден рядом с заголовком.',
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

export function HelpPage({ onLaunchOnboarding }: HelpPageProps) {
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
