import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FeedReader — ваш особистий агрегатор',
  description: 'Збирайте публікації з будь-яких сайтів в тематичні стрічки',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  )
}
