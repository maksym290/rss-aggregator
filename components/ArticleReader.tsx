'use client'

import { ExternalLink, Bookmark, BookmarkCheck, X, ArrowUpRight } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { uk } from 'date-fns/locale'
import type { Feed, Article } from '@/lib/types'

interface Props {
  article: Article | null
  feed: Feed | null
  isRead: boolean
  isBookmarked: boolean
  onClose: () => void
  onToggleBookmark: (id: string) => void
}

export default function ArticleReader({ article, feed, isRead, isBookmarked, onClose, onToggleBookmark }: Props) {
  if (!article) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center text-[#d4d2ce]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" />
          </svg>
          <p className="text-[13px] text-[#b8b5b0]">Оберіть статтю для читання</p>
        </div>
      </div>
    )
  }

  let publishedStr = ''
  try {
    const d = new Date(article.publishedAt)
    publishedStr = format(d, 'd MMMM yyyy, HH:mm', { locale: uk })
  } catch {}

  const hasFullContent = article.content && article.content.length > 200

  return (
    <div className="flex-1 bg-white overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e8e7e3] flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {feed && (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: feed.color }} />
          )}
          <span className="text-[12px] text-[#9e9b97] truncate">{article.sourceName}</span>
          <span className="text-[#d4d2ce]">·</span>
          <span className="text-[12px] text-[#9e9b97]">{publishedStr}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleBookmark(article.id)}
            className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-[#2563eb] bg-[#eff6ff]' : 'text-[#9e9b97] hover:bg-[#f8f7f4]'}`}
            title="Зберегти"
          >
            {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-[#9e9b97] hover:bg-[#f8f7f4] transition-colors"
            title="Відкрити оригінал"
          >
            <ExternalLink size={15} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#9e9b97] hover:bg-[#f8f7f4] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-8 py-10">
          {/* Title */}
          <h1 className="text-[26px] font-semibold leading-tight text-[#1a1918] mb-6" style={{ letterSpacing: '-0.02em' }}>
            {article.title}
          </h1>

          {/* Hero image */}
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt=""
              className="w-full rounded-xl mb-8 object-cover max-h-80"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}

          {/* Article body */}
          {hasFullContent ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content! }}
            />
          ) : (
            <div>
              <p className="article-content text-[17px] leading-relaxed text-[#1a1918] mb-6">
                {article.description}
              </p>
              <div className="mt-8 p-5 bg-[#f8f7f4] rounded-xl border border-[#e8e7e3]">
                <p className="text-[13px] text-[#6b6966] mb-3">
                  Повний текст статті доступний на сайті джерела. Деякі RSS-стрічки містять лише анонси.
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Читати далі <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
