export interface MigrationCheckpoint {
  title: string
  description: string
}

export const overviewCheckpoints: MigrationCheckpoint[] = [
  {
    title: 'React shell рядом с legacy',
    description: 'Новая точка входа живёт отдельно и не ломает текущий HTML-конструктор.',
  },
  {
    title: 'Доменные defaults и types вынесены',
    description: 'Теперь у нас есть независимая основа для стейта Email и Report без привязки к DOM.',
  },
  {
    title: 'Следующий шаг — адаптеры генераторов',
    description: 'Дальше безопасно выносим pure-генерацию письма и отчёта из монолита в отдельные модули.',
  },
]
