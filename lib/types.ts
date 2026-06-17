export interface Source {
  id: string
  name: string
  url: string
  favicon?: string
}

export interface Feed {
  id: string
  name: string
  color: string
  interval: number // minutes
  sources: Source[]
  createdAt: string
  lastFetched?: string
}

export interface Article {
  id: string
  feedId: string
  sourceId: string
  sourceName: string
  title: string
  description: string
  content?: string
  url: string
  imageUrl?: string
  publishedAt: string
  fetchedAt: string
  isRead: boolean
  isBookmarked: boolean
}

export interface AppState {
  feeds: Feed[]
  articles: Article[]
  readIds: string[]
  bookmarkIds: string[]
}
