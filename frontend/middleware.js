import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname
  const { pathname } = request.nextUrl;

  // If it's the root path and includes LIFF URL parameters, redirect to register
  if (pathname === '/' && request.url.includes('liff.state')) {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};
