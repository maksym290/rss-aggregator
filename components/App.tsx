'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Feed, Article } from '@/lib/types'
import { storage } from '@/lib/storage'
import Sidebar from './Sidebar'
import ArticleList from './ArticleList'
import ArticleReader from './ArticleReader'
import FeedModal from './FeedModal'

export default function App() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set())
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [feedModalOpen, setFeedModalOpen] = useState(false)
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null)
  const [loadingFeedIds, setLoadingFeedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'unread' | 'bookmarked'>('all')
  const timers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  // Load from storage on mount
  useEffect(() => {
    const savedFeeds = storage.getFeeds()
    const savedArticles = storage.getArticles()
    const savedRead = storage.getReadIds()
    const savedBookmarks = storage.getBookmarkIds()

    setFeeds(savedFeeds)
    setArticles(savedArticles)
    setReadIds(new Set(savedRead))
    setBookmarkIds(new Set(savedBookmarks))

    if (savedFeeds.length > 0) {
      setActiveFeedId(savedFeeds[0].id)
    }
  }, [])

  const fetchFeed = useCallback(async (feed: Feed) => {
    if (!feed.sources.length) return
    setLoadingFeedIds(prev => new Set([...prev, feed.id]))
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: feed.sources, feedId: feed.id }),
      })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      const count = storage.addArticles(data.articles)
      if (count > 0) {
        setArticles(storage.getArticles())
      }
      // Update lastFetched
      const updatedFeeds = storage.getFeeds().map(f =>
        f.id === feed.id ? { ...f, lastFetched: new Date().toISOString() } : f
      )
      storage.setFeeds(updatedFeeds)
      setFeeds(updatedFeeds)
    } catch (e) {
      console.error('Fetch error for feed', feed.name, e)
    } finally {
      setLoadingFeedIds(prev => {
        const next = new Set(prev)
        next.delete(feed.id)
        return next
      })
    }
  }, [])

  // Set up auto-refresh timers
  useEffect(() => {
    // Clear existing timers
    timers.current.forEach(t => clearInterval(t))
    timers.current.clear()

    feeds.forEach(feed => {
      if (!feed.sources.length) return
      // Fetch immediately if never fetched or stale
      const lastFetched = feed.lastFetched ? new Date(feed.lastFetched) : null
      const staleMs = feed.interval * 60 * 1000
      if (!lastFetched || Date.now() - lastFetched.getTime() > staleMs) {
        fetchFeed(feed)
      }
      // Schedule recurring
      const t = setInterval(() => fetchFeed(feed), staleMs)
      timers.current.set(feed.id, t)
    })

    return () => {
      timers.current.forEach(t => clearInterval(t))
    }
  }, [feeds, fetchFeed])

  const handleSaveFeed = (feed: Feed) => {
    const current = storage.getFeeds()
    let updated: Feed[]
    if (current.find(f => f.id === feed.id)) {
      updated = current.map(f => f.id === feed.id ? feed : f)
    } else {
      updated = [...current, feed]
      setActiveFeedId(feed.id)
    }
    storage.setFeeds(updated)
    setFeeds(updated)
    setFeedModalOpen(false)
    setEditingFeed(null)
    // Fetch new/updated feed immediately
    setTimeout(() => fetchFeed(feed), 100)
  }

  const handleDeleteFeed = (feedId: string) => {
    const updated = feeds.filter(f => f.id !== feedId)
    storage.setFeeds(updated)
    setFeeds(updated)
    if (activeFeedId === feedId) {
      setActiveFeedId(updated[0]?.id || null)
    }
    // Clear articles for this feed
    const remainingArticles = storage.getArticles().filter(a => a.feedId !== feedId)
    storage.setArticles(remainingArticles)
    setArticles(remainingArticles)
  }

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article)
    storage.markRead(article.id)
    setReadIds(new Set(storage.getReadIds()))
  }

  const handleToggleBookmark = (articleId: string) => {
    storage.toggleBookmark(articleId)
    setBookmarkIds(new Set(storage.getBookmarkIds()))
  }

  const handleMarkAllRead = () => {
    if (!activeFeedId) return
    const ids = visibleArticles.map(a => a.id)
    storage.markAllRead(ids)
    setReadIds(new Set(storage.getReadIds()))
  }

  const activeFeed = feeds.find(f => f.id === activeFeedId) || null

  const visibleArticles = articles
    .filter(a => {
      if (a.feedId !== activeFeedId) return false
      if (filter === 'unread') return !readIds.has(a.id)
      if (filter === 'bookmarked') return bookmarkIds.has(a.id)
      return true
    })

  const unreadCount = (feedId: string) =>
    articles.filter(a => a.feedId === feedId && !readIds.has(a.id)).length

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f0ed]">
      <Sidebar
        feeds={feeds}
        activeFeedId={activeFeedId}
        unreadCount={unreadCount}
        loadingFeedIds={loadingFeedIds}
        onSelectFeed={(id) => {
          setActiveFeedId(id)
          setSelectedArticle(null)
          setFilter('all')
        }}
        onNewFeed={() => {
          setEditingFeed(null)
          setFeedModalOpen(true)
        }}
        onEditFeed={(feed) => {
          setEditingFeed(feed)
          setFeedModalOpen(true)
        }}
        onDeleteFeed={handleDeleteFeed}
        onRefreshFeed={(feed) => fetchFeed(feed)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ArticleList
          feed={activeFeed}
          articles={visibleArticles}
          readIds={readIds}
          bookmarkIds={bookmarkIds}
          selectedArticleId={selectedArticle?.id || null}
          filter={filter}
          isLoading={activeFeedId ? loadingFeedIds.has(activeFeedId) : false}
          onSelectArticle={handleSelectArticle}
          onFilterChange={setFilter}
          onMarkAllRead={handleMarkAllRead}
          onToggleBookmark={handleToggleBookmark}
        />

        <ArticleReader
          article={selectedArticle}
          feed={activeFeed}
          isRead={selectedArticle ? readIds.has(selectedArticle.id) : false}
          isBookmarked={selectedArticle ? bookmarkIds.has(selectedArticle.id) : false}
          onClose={() => setSelectedArticle(null)}
          onToggleBookmark={handleToggleBookmark}
        />
      </div>

      {feedModalOpen && (
        <FeedModal
          feed={editingFeed}
          onSave={handleSaveFeed}
          onClose={() => {
            setFeedModalOpen(false)
            setEditingFeed(null)
          }}
        />
      )}
    </div>
  )
}
