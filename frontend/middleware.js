import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/']; // Dashboard
const authRoutes = ['/auth/login']; // Login page
const publicRoutes = ['/frontapi/auth/me', '/frontapi/login']; // API routes that don't need auth check

export function middleware(req) {
    // 2. Check for the auth token
    const path = req.nextUrl.pathname;
    const isProtectedRoute =
        path === '/' ||
        (!path.startsWith('/auth') && !path.startsWith('/_next') && !path.startsWith('/static') && !path.startsWith('/favicon.ico'));

    const isAuthRoute = authRoutes.includes(path);
    const isPublicApiRoute = publicRoutes.some(route => path.startsWith(route));

    // Skip middleware for Next.js internals, static files, public API routes, and survey page + API
    if (path.startsWith('/_next') || path.startsWith('/static') || path.startsWith('/favicon.ico') || path.startsWith('/public') || isPublicApiRoute || path.startsWith('/survey') || path.startsWith('/frontapi/surveys')) {
        return NextResponse.next();
    }

    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    // 3. Redirect logic
    if (isProtectedRoute && !token) {
        // If trying to access a protected route without a token, redirect to login
        return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }

    if (isAuthRoute && token) {
        // If trying to access login page while already authenticated, redirect to dashboard
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // 4. API Route Protection (Optional, but good practice)
    if (path.startsWith('/frontapi') && !isPublicApiRoute && !token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
}

// Configure middleware to match specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
