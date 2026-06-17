import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { Article, Source } from '@/lib/types'
import crypto from 'crypto'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'FeedReader/1.0 (+https://github.com/feedreader)' },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
})

function extractImage(item: Record<string, unknown>): string | undefined {
  // Try various common image fields
  const mc = item.mediaContent as Record<string, unknown> | undefined
  if (mc?.$.url) return mc.$.url as string
  const mt = item.mediaThumbnail as Record<string, unknown> | undefined
  if (mt?.$.url) return mt.$.url as string
  const enc = item.enclosure as Record<string, unknown> | undefined
  if (enc?.url && (enc.type as string)?.startsWith('image/')) return enc.url as string
  // Try to extract from content
  const content = (item.contentEncoded || item.content || '') as string
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (match) return match[1]
  return undefined
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)
}

export async function POST(req: NextRequest) {
  try {
    const { sources, feedId } = await req.json() as { sources: Source[]; feedId: string }

    if (!sources?.length || !feedId) {
      return NextResponse.json({ error: 'Missing sources or feedId' }, { status: 400 })
    }

    const allArticles: Article[] = []
    const errors: string[] = []

    await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const feed = await parser.parseURL(source.url)
          const items = (feed.items || []).slice(0, 30)

          for (const item of items) {
            const url = item.link || item.guid || ''
            if (!url) continue

            const id = crypto
              .createHash('sha1')
              .update(url)
              .digest('hex')
              .slice(0, 16)

            const rawContent = (item as Record<string, unknown>).contentEncoded as string ||
              item.content || ''
            const description = item.contentSnippet ||
              cleanHtml(rawContent) ||
              cleanHtml(item.summary || '') ||
              ''

            allArticles.push({
              id,
              feedId,
              sourceId: source.id,
              sourceName: source.name,
              title: cleanHtml(item.title || 'Без назви'),
              description,
              content: rawContent || item.content || '',
              url,
              imageUrl: extractImage(item as Record<string, unknown>),
              publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
              fetchedAt: new Date().toISOString(),
              isRead: false,
              isBookmarked: false,
            })
          }
        } catch (err) {
          errors.push(`${source.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      })
    )

    // Sort by date descending
    allArticles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    return NextResponse.json({ articles: allArticles, errors })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
