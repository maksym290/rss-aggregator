import type { Feed, Article } from './types'

const FEEDS_KEY = 'feedreader_feeds_v1'
const ARTICLES_KEY = 'feedreader_articles_v1'
const READ_KEY = 'feedreader_read_v1'
const BOOKMARKS_KEY = 'feedreader_bookmarks_v1'

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export const storage = {
  getFeeds: (): Feed[] => safeGet(FEEDS_KEY, []),
  setFeeds: (feeds: Feed[]) => safeSet(FEEDS_KEY, feeds),

  getArticles: (): Article[] => safeGet(ARTICLES_KEY, []),
  setArticles: (articles: Article[]) => safeSet(ARTICLES_KEY, articles),

  addArticles: (incoming: Article[]) => {
    const existing = safeGet<Article[]>(ARTICLES_KEY, [])
    const existingUrls = new Set(existing.map(a => a.url))
    const fresh = incoming.filter(a => !existingUrls.has(a.url))
    // Keep max 2000 articles total, trim oldest
    const merged = [...fresh, ...existing].slice(0, 2000)
    safeSet(ARTICLES_KEY, merged)
    return fresh.length
  },

  getReadIds: (): string[] => safeGet(READ_KEY, []),
  markRead: (id: string) => {
    const ids = safeGet<string[]>(READ_KEY, [])
    if (!ids.includes(id)) {
      safeSet(READ_KEY, [...ids, id])
    }
  },
  markAllRead: (ids: string[]) => {
    const existing = safeGet<string[]>(READ_KEY, [])
    const merged = Array.from(new Set([...existing, ...ids]))
    safeSet(READ_KEY, merged)
  },

  getBookmarkIds: (): string[] => safeGet(BOOKMARKS_KEY, []),
  toggleBookmark: (id: string) => {
    const ids = safeGet<string[]>(BOOKMARKS_KEY, [])
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    safeSet(BOOKMARKS_KEY, next)
    return next.includes(id)
  },
}
