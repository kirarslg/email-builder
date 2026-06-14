import type { OnbordaProps } from 'onborda'

type Tour = OnbordaProps['steps'][number]

/**
 * One tour per Help item. Each tour has exactly ONE step — we use onborda
 * as a single-element highlighter, not a multi-step walkthrough.
 *
 * `showControls: false` hides the prev/next/finish buttons; the user closes
 * the tour via the Close button in our custom card.
 */
export interface HelpTourMeta {
  tourName: string
  tab: 'email' | 'report' | 'help'
  emailMode?: 'inputs' | 'builder'
  title: string
  text: string
}

interface ItemConfig {
  tourName: string
  selector: string
  side: 'top' | 'bottom' | 'left' | 'right'
  title: string
  text: string
  tab: 'email' | 'report' | 'help'
  emailMode?: 'inputs' | 'builder'
}

export const HELP_ITEMS: Record<string, ItemConfig> = {
  emailSection: {
    tourName: 'h_emailSection',
    selector: '.app-nav__item:nth-of-type(1)',
    side: 'bottom',
    title: 'Раздел «Письма»',
    text: 'Создание писем — через форму или визуальный конструктор. Оба режима дают одинаковый HTML на выходе.',
    tab: 'email',
  },
  reportSection: {
    tourName: 'h_reportSection',
    selector: '.app-nav__item:nth-of-type(2)',
    side: 'bottom',
    title: 'Раздел «Отчёты»',
    text: 'Генерация отчётов CI/CD: настройка шапки, ячеек, сводок, репозиториев, кнопок действий и алертов.',
    tab: 'report',
  },
  emailForm: {
    tourName: 'h_emailForm',
    selector: '#emailInputsCard',
    side: 'left',
    title: 'Режим «Форма»',
    text: 'Заполняйте поля по секциям: шапка, заголовок, тело, кнопка, разделитель, подпись. Каждая секция раскрывается отдельно и сразу влияет на превью слева.',
    tab: 'email',
    emailMode: 'inputs',
  },
  emailBuilder: {
    tourName: 'h_emailBuilder',
    selector: '#emailBuilderCard',
    side: 'left',
    title: 'Режим «Конструктор»',
    text: 'Перетаскивайте блоки (текст, кнопка, изображение, разделитель) в нужном порядке. Текст редактируется прямо в превью — кликните по нему дважды.',
    tab: 'email',
    emailMode: 'builder',
  },
  emailPreview: {
    tourName: 'h_emailPreview',
    selector: '#emailResultCard',
    side: 'right',
    title: 'Превью и экспорт',
    text: 'Слева видно живое превью и размер итогового HTML. Кнопки сверху превью копируют HTML в буфер или скачивают .html-файл.',
    tab: 'email',
    emailMode: 'inputs',
  },
  reportHeader: {
    tourName: 'h_reportHeader',
    selector: '#reportInputsCard',
    side: 'left',
    title: 'Настройка шапки',
    text: 'Логотип, фоновое изображение, заголовок, статус. Цвета настраиваются отдельно — для заголовка, фона шапки и бордера.',
    tab: 'report',
  },
  reportCells: {
    tourName: 'h_reportCells',
    selector: '#reportInputsCard',
    side: 'left',
    title: 'Таблица ячеек',
    text: 'Раздел «Таблица» — карточки с заголовком и контентом для каждой ячейки. Перетаскивайте за ручку слева, чтобы менять порядок. Кнопкой добавляйте новые столбцы.',
    tab: 'report',
  },
  reportSections: {
    tourName: 'h_reportSections',
    selector: '#reportInputsCard',
    side: 'left',
    title: 'Секции отчёта',
    text: 'Сводка, алерты, таблицы параметров, репозиториев, PR-ы — каждую секцию можно включать и выключать чекбоксами. Внутри секций — те же формы с превью.',
    tab: 'report',
  },
  reportExport: {
    tourName: 'h_reportExport',
    selector: '#reportPreviewPane',
    side: 'right',
    title: 'Экспорт',
    text: 'Готовый HTML отчёта можно скопировать или скачать кнопками сверху превью. Размер итогового файла виден рядом с заголовком.',
    tab: 'report',
  },
}

export const helpTours: Tour[] = Object.values(HELP_ITEMS).map((item) => ({
  tour: item.tourName,
  steps: [
    {
      icon: null,
      title: item.title,
      content: item.text,
      selector: item.selector,
      side: item.side,
      showControls: false,
      pointerPadding: 8,
      pointerRadius: 10,
    },
  ],
}))
