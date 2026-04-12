import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Silently handle Chrome DevTools metadata requests
  if (pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
