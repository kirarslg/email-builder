# Email Builder

Основной интерфейс конструктора теперь живёт в React.

## Entry points

- [Email builder.html](</Users/krslg/Desktop/Email builder — тест версия/Email builder.html>) — основной entrypoint приложения.
- [index.html](</Users/krslg/Desktop/Email builder — тест версия/index.html>) — альтернативный Vite entrypoint на тот же React app.
- [legacy.html](</Users/krslg/Desktop/Email builder — тест версия/legacy.html>) — сохранённая legacy-версия монолитного конструктора для fallback и сверки поведения.

## Основные экраны

- [src/pages/EmailPage.tsx](</Users/krslg/Desktop/Email builder — тест версия/src/pages/EmailPage.tsx>) — вкладка `Письмо`, включая `Поля` и `Конструктор`.
- [src/pages/ReportPage.tsx](</Users/krslg/Desktop/Email builder — тест версия/src/pages/ReportPage.tsx>) — вкладка `Отчёт`.
- [src/app/App.tsx](</Users/krslg/Desktop/Email builder — тест версия/src/app/App.tsx>) — shell приложения и переключение вкладок.

## Команды

```bash
npm run dev -- --host 127.0.0.1 --port 4173
npm run typecheck
npm run build
npm test
```

## Smoke coverage

Актуальный smoke-набор теперь тестирует React entrypoint, а не старый монолит:

- [tests/ui-constructor.spec.js](</Users/krslg/Desktop/Email builder — тест версия/tests/ui-constructor.spec.js>)
- [tests/pages/constructor.page.js](</Users/krslg/Desktop/Email builder — тест версия/tests/pages/constructor.page.js>)
- [playwright.config.js](</Users/krslg/Desktop/Email builder — тест версия/playwright.config.js>)

Покрытые сценарии:

- открытие вкладки `Письмо`;
- генерация email HTML и preview;
- переключение `Поля / Конструктор`;
- sanitization небезопасных URL;
- открытие вкладки `Отчёт`;
- генерация report HTML и preview.

## Что считать source of truth

- Для текущей разработки source of truth — React-код в [src](</Users/krslg/Desktop/Email builder — тест версия/src>).
- `legacy.html` нужен только как fallback и reference для parity-проверок.
- Новые изменения в UI и логике стоит вносить в React-ветку, а не в legacy-монолит.
