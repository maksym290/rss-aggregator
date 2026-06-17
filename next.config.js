/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['rss-parser', 'cheerio'],
  },
}

module.exports = nextConfig
