import { NextRequest, NextResponse } from 'next/server';

// Mobile User-Agent patterns
const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get('user-agent') ?? '';
  const isMobileUA = MOBILE_UA.test(ua);

  // Already on a /mobile route — leave it alone
  if (pathname.startsWith('/mobile')) {
    // If somehow a desktop UA hits /mobile, redirect to /
    // (optional — commenting out to not break direct /mobile links)
    // if (!isMobileUA) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // Desktop-only routes — always pass through on desktop
  if (!isMobileUA) {
    return NextResponse.next();
  }

  // Mobile UA hitting a desktop route — redirect to /mobile
  // Preserve sub-path if possible (e.g. /stock/AAPL → /mobile/stock/AAPL)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/mobile', request.url));
  }

  // For other desktop paths, just go to mobile home
  return NextResponse.redirect(new URL('/mobile', request.url));
}

export const config = {
  // Run middleware on all page routes except API, _next static, and favicon
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
