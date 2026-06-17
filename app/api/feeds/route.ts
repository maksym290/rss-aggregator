import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({ timeout: 8000 })

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string }
    if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 })

    const feed = await parser.parseURL(url)
    return NextResponse.json({
      valid: true,
      title: feed.title || '',
      description: feed.description || '',
      itemCount: feed.items?.length || 0,
    })
  } catch (err) {
    return NextResponse.json({
      valid: false,
      error: err instanceof Error ? err.message : 'Cannot parse feed',
    })
  }
}
