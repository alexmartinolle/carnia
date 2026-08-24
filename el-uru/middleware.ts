import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

function getPathnameWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/(es|ca)/, '') || '/'
}

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(es|ca)/)
  return match ? match[1] : routing.defaultLocale
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Assets y API: pasar directamente sin procesar
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const bare = getPathnameWithoutLocale(pathname)
  const locale = getLocaleFromPathname(pathname)

  // Sólo invocamos Supabase en rutas que dependen de la sesión.
  const needsAuth =
    bare.startsWith('/panel') ||
    bare.startsWith('/cuenta') ||
    bare === '/login' ||
    bare === '/registro'

  if (!needsAuth) {
    return intlMiddleware(request)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined

  // Protección panel
  if (bare.startsWith('/panel')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/login`
      return NextResponse.redirect(url)
    }
    if (role !== 'STAFF') {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      return NextResponse.redirect(url)
    }
  }

  // Protección cuenta
  if (bare.startsWith('/cuenta') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Si ya tiene sesión y va a login/registro
  if ((bare === '/login' || bare === '/registro') && user) {
    const url = request.nextUrl.clone()
    url.pathname = role === 'STAFF' ? `/${locale}/panel` : `/${locale}`
    return NextResponse.redirect(url)
  }

  // Aplicar i18n y copiar cookies de Supabase
  const intlResponse = intlMiddleware(request)
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie)
  })

  return intlResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
