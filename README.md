# Email Builder

Конструктор писем и отчётов на React + Vite.

## Entry point

- [index.html](index.html) — Vite entrypoint, монтирует React app (`src/main.tsx`).

## Структура

- `src/` — весь исходный код (страницы, компоненты, домен, стили).
- `public/` — статика, отдаваемая как есть по абсолютным путям (`/logo`, `/icons`).
- `tests/` — Playwright smoke-набор.

## Основные экраны

- [src/pages/EmailPage.tsx](src/pages/EmailPage.tsx) — вкладка `Письмо` (`Поля` и `Конструктор`).
- [src/pages/ReportPage.tsx](src/pages/ReportPage.tsx) — вкладка `Отчёт`.
- [src/app/App.tsx](src/app/App.tsx) — shell приложения и переключение вкладок.

## Команды

```bash
npm run dev
npm run typecheck
npm run build
npm test
```

## Smoke coverage

- [tests/ui-constructor.spec.js](tests/ui-constructor.spec.js)
- [tests/pages/constructor.page.js](tests/pages/constructor.page.js)
- [playwright.config.ts](playwright.config.ts)

Покрытые сценарии:

- открытие вкладки `Письмо`;
- генерация email HTML и preview;
- переключение `Поля / Конструктор`;
- sanitization небезопасных URL;
- открытие вкладки `Отчёт`;
- генерация report HTML и preview.
