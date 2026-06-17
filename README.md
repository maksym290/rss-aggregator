# FeedReader — Особистий RSS Агрегатор

Веб-застосунок для збирання публікацій з будь-яких сайтів у тематичні стрічки.

## Можливості

- **Тематичні стрічки** — необмежена кількість стрічок з різними джерелами
- **Необмежені джерела** — додавайте скільки завгодно RSS/Atom URL до кожної стрічки
- **Вбудований ридер** — читайте статті прямо в застосунку
- **Автооновлення** — кожна стрічка оновлюється за своїм розкладом (від 15 хвилин)
- **Збережені статті** — позначайте статті закладками
- **Фільтри** — всі / непрочитані / збережені
- **Persistent storage** — всі налаштування та статті зберігаються в браузері

## Деплой на Vercel (рекомендовано)

### Варіант 1: Через GitHub (найпростіший)

1. Завантажте цю папку на GitHub (новий репозиторій)
2. Зайдіть на [vercel.com](https://vercel.com) → New Project
3. Підключіть GitHub репозиторій
4. Натисніть Deploy — готово!

### Варіант 2: Через Vercel CLI

```bash
# Встановіть Vercel CLI
npm i -g vercel

# В папці проєкту
vercel

# Слідуйте інструкціям — застосунок буде розгорнуто за хвилину
```

## Локальний запуск

```bash
npm install
npm run dev
# Відкрийте http://localhost:3000
```

## Структура проєкту

```
rss-aggregator/
├── app/
│   ├── api/
│   │   ├── articles/route.ts   # Серверний RSS-парсинг
│   │   └── feeds/route.ts      # Валідація RSS URL
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── App.tsx                 # Головний компонент, весь стан
│   ├── Sidebar.tsx             # Список стрічок
│   ├── ArticleList.tsx         # Список статей
│   ├── ArticleReader.tsx       # Ридер статей
│   └── FeedModal.tsx           # Створення/редагування стрічок
├── lib/
│   ├── types.ts                # TypeScript типи
│   └── storage.ts              # localStorage wrapper
└── vercel.json
```

## Популярні RSS-стрічки для початку

| Тема | URL |
|------|-----|
| Укрінформ | https://www.ukrinform.ua/rss/block-ukraine |
| DOU | https://dou.ua/rss/ |
| The Verge (Tech) | https://www.theverge.com/rss/index.xml |
| Hacker News | https://news.ycombinator.com/rss |
| BBC News | http://feeds.bbci.co.uk/news/rss.xml |
| Reuters | https://feeds.reuters.com/reuters/topNews |
| CSS-Tricks | https://css-tricks.com/feed/ |
| Smashing Magazine | https://www.smashingmagazine.com/feed/ |

## Обмеження безкоштовного Vercel

- Serverless functions: 100 GB-Hrs/місяць (більш ніж достатньо)
- Час виконання: до 15 секунд на запит
- Зберігання даних: у браузері (localStorage, до ~5MB)

Якщо потрібне більше зберігання — можна підключити Vercel KV (безкоштовний план).
