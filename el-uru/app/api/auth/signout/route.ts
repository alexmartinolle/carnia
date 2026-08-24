import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.signOut()
  
  // Get locale from URL or default to 'es'
  const url = new URL(request.url)
  const pathname = url.pathname
  const localeMatch = pathname.match(/^\/(es|ca)/)
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale
  
  return NextResponse.redirect(
    new URL(`/${locale}/login`, process.env.NEXT_PUBLIC_APP_URL!)
  )
}
