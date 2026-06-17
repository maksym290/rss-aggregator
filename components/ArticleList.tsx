'use client'

import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import { Bookmark, BookmarkCheck, RefreshCw, CheckCheck } from 'lucide-react'
import type { Feed, Article } from '@/lib/types'

interface Props {
  feed: Feed | null
  articles: Article[]
  readIds: Set<string>
  bookmarkIds: Set<string>
  selectedArticleId: string | null
  filter: 'all' | 'unread' | 'bookmarked'
  isLoading: boolean
  onSelectArticle: (a: Article) => void
  onFilterChange: (f: 'all' | 'unread' | 'bookmarked') => void
  onMarkAllRead: () => void
  onToggleBookmark: (id: string) => void
}

export default function ArticleList({
  feed, articles, readIds, bookmarkIds, selectedArticleId,
  filter, isLoading, onSelectArticle, onFilterChange, onMarkAllRead, onToggleBookmark,
}: Props) {
  if (!feed) {
    return (
      <div className="flex flex-col w-80 min-w-[320px] bg-[#f8f7f4] border-r border-[#e0ded8] items-center justify-center text-center px-8">
        <div className="text-[#d4d2ce] mb-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" fill="currentColor" />
          </svg>
        </div>
        <p className="text-[14px] text-[#9e9b97]">Оберіть стрічку<br />зліва або створіть нову</p>
      </div>
    )
  }

  const unreadCount = articles.filter(a => !readIds.has(a.id)).length

  return (
    <div className="flex flex-col w-80 min-w-[320px] bg-[#f8f7f4] border-r border-[#e0ded8] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#e0ded8]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: feed.color }} />
          <h1 className="text-[14px] font-semibold text-[#1a1918] flex-1 truncate">{feed.name}</h1>
          {isLoading && <RefreshCw size={13} className="animate-spin text-[#9e9b97]" />}
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#eceae5] rounded-lg p-0.5">
          {(['all', 'unread', 'bookmarked'] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`flex-1 text-[11px] py-1 rounded-md transition-colors ${
                filter === f
                  ? 'bg-white text-[#1a1918] font-medium shadow-sm'
                  : 'text-[#9e9b97] hover:text-[#4a4845]'
              }`}
            >
              {f === 'all' ? 'Всі' : f === 'unread' ? `Непрочитані ${unreadCount > 0 ? `(${unreadCount})` : ''}` : 'Збережені'}
            </button>
          ))}
        </div>
      </div>

      {/* Mark all read */}
      {unreadCount > 0 && filter !== 'bookmarked' && (
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2 text-[11px] text-[#9e9b97] hover:text-[#4a4845] border-b border-[#e0ded8] hover:bg-[#f1f0ed] transition-colors"
        >
          <CheckCheck size={12} />
          Позначити всі прочитаними
        </button>
      )}

      {/* Articles */}
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <p className="text-[13px] text-[#9e9b97]">
              {isLoading
                ? 'Завантажуємо публікації…'
                : filter === 'bookmarked'
                ? 'Збережених статей немає'
                : filter === 'unread'
                ? 'Усі прочитано 🎉'
                : 'Публікацій поки немає'}
            </p>
          </div>
        )}
        {articles.map(article => {
          const isRead = readIds.has(article.id)
          const isBookmarked = bookmarkIds.has(article.id)
          const isSelected = selectedArticleId === article.id
          let timeAgo = ''
          try {
            timeAgo = formatDistanceToNow(new Date(article.publishedAt), { locale: uk, addSuffix: true })
          } catch {}

          return (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className={`relative px-4 py-3 border-b border-[#e0ded8] cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-white'
                  : 'hover:bg-[#f1f0ed]'
              } ${isRead ? 'opacity-70' : ''}`}
            >
              {!isRead && (
                <span className="absolute left-2 top-4 w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-[#9e9b97] font-medium truncate flex-1">{article.sourceName}</span>
                <span className="text-[10px] text-[#c0beba] flex-shrink-0">{timeAgo}</span>
              </div>
              <h3 className={`text-[13px] leading-[1.4] mb-1 line-clamp-2 ${isRead ? 'text-[#6b6966]' : 'text-[#1a1918] font-medium'}`}>
                {article.title}
              </h3>
              <p className="text-[11px] text-[#9e9b97] leading-relaxed line-clamp-2">
                {article.description}
              </p>
              <button
                onClick={e => { e.stopPropagation(); onToggleBookmark(article.id) }}
                className={`absolute right-3 bottom-3 p-1 rounded transition-colors ${
                  isBookmarked ? 'text-[#2563eb]' : 'text-[#c0beba] hover:text-[#6b6966]'
                }`}
              >
                {isBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
