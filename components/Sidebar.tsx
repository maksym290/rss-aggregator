'use client'

import { useState } from 'react'
import { Plus, RefreshCw, Pencil, Trash2, Loader2, Rss, BookMarked, ChevronDown } from 'lucide-react'
import type { Feed } from '@/lib/types'

interface Props {
  feeds: Feed[]
  activeFeedId: string | null
  unreadCount: (feedId: string) => number
  loadingFeedIds: Set<string>
  onSelectFeed: (id: string) => void
  onNewFeed: () => void
  onEditFeed: (feed: Feed) => void
  onDeleteFeed: (feedId: string) => void
  onRefreshFeed: (feed: Feed) => void
}

export default function Sidebar({
  feeds, activeFeedId, unreadCount, loadingFeedIds,
  onSelectFeed, onNewFeed, onEditFeed, onDeleteFeed, onRefreshFeed,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const intervalLabel = (min: number) => {
    if (min < 60) return `${min}хв`
    if (min < 1440) return `${min / 60}год`
    return '1д'
  }

  return (
    <aside className="flex flex-col w-60 min-w-[240px] bg-[#eceae5] border-r border-[#d8d6d0] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[#d8d6d0]">
        <div className="flex items-center gap-2 mb-1">
          <Rss size={16} className="text-[#2563eb]" />
          <span className="text-[13px] font-semibold text-[#1a1918] tracking-tight">FeedReader</span>
        </div>
        <p className="text-[11px] text-[#9e9b97]">{feeds.length} стрічок</p>
      </div>

      {/* Feed list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {feeds.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-[12px] text-[#9e9b97] leading-relaxed">
              Додайте першу стрічку,<br />щоб почати читати
            </p>
          </div>
        )}
        {feeds.map(feed => {
          const isActive = activeFeedId === feed.id
          const isLoading = loadingFeedIds.has(feed.id)
          const unread = unreadCount(feed.id)
          const isHovered = hoveredId === feed.id

          return (
            <div key={feed.id} className="relative">
              {confirmDeleteId === feed.id ? (
                <div className="mx-2 my-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-[12px] text-red-700 mb-2">Видалити «{feed.name}»?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onDeleteFeed(feed.id); setConfirmDeleteId(null) }}
                      className="flex-1 text-[11px] py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Видалити
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 text-[11px] py-1 border border-[#d8d6d0] rounded-md hover:bg-[#f1f0ed]"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelectFeed(feed.id)}
                  onMouseEnter={() => setHoveredId(feed.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`w-full text-left px-3 py-2 mx-1 rounded-lg flex items-center gap-2 transition-colors group ${
                    isActive
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-[#e0ded8]'
                  }`}
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: feed.color }}
                  />
                  <span className={`flex-1 text-[13px] truncate ${isActive ? 'font-medium text-[#1a1918]' : 'text-[#4a4845]'}`}>
                    {feed.name}
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    {isLoading && <Loader2 size={11} className="animate-spin text-[#9e9b97]" />}
                    {!isLoading && unread > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#2563eb] text-white min-w-[18px] text-center">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </span>
                  {/* Action buttons on hover */}
                  {isHovered && (
                    <span className="flex gap-0.5 flex-shrink-0">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => { e.stopPropagation(); onRefreshFeed(feed) }}
                        className="p-1 rounded hover:bg-[#d0cec8] text-[#9e9b97] hover:text-[#1a1918]"
                        title="Оновити"
                      >
                        <RefreshCw size={11} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => { e.stopPropagation(); onEditFeed(feed) }}
                        className="p-1 rounded hover:bg-[#d0cec8] text-[#9e9b97] hover:text-[#1a1918]"
                        title="Редагувати"
                      >
                        <Pencil size={11} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(feed.id) }}
                        className="p-1 rounded hover:bg-red-100 text-[#9e9b97] hover:text-red-600"
                        title="Видалити"
                      >
                        <Trash2 size={11} />
                      </span>
                    </span>
                  )}
                </button>
              )}
              {isActive && !isHovered && feed.lastFetched && (
                <p className="px-5 pb-1 text-[10px] text-[#9e9b97]">
                  {intervalLabel(feed.interval)} · {feed.sources.length} джерел
                </p>
              )}
            </div>
          )
        })}
      </nav>

      {/* Add feed button */}
      <div className="p-3 border-t border-[#d8d6d0]">
        <button
          onClick={onNewFeed}
          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#4a4845] hover:text-[#1a1918] hover:bg-[#e0ded8] rounded-lg transition-colors"
        >
          <Plus size={15} />
          Нова стрічка
        </button>
      </div>
    </aside>
  )
}
