import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/home', '/scan']
const publicRoutes = ['/auth/login', '/auth/signup', '/', "/landing"]

export function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)
    const session = req.cookies.get('session')?.value

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/auth/login', req.nextUrl))
    }

    if (isPublicRoute && session && !req.nextUrl.pathname.startsWith('/home')) {
        return NextResponse.redirect(new URL('/home', req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
}
