import { NextResponse } from 'next/server';

// Forcer le rendu dynamique pour cette route
export const dynamic = 'force-dynamic';
// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://immopix-ai.site/sitemap.xml

# Disallow API routes
Disallow: /api/

# Crawl-delay
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 