import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Proxy runs on server-side and cannot access localStorage
// Client-side protection is handled in dashboard/layout.tsx
export function proxy(request: NextRequest) {
  // Let all requests pass through
  // Authentication is handled client-side in layouts
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
