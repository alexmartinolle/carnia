import { createServerClient } from '@supabase/ssr'

// Cliente de lectura pública: no toca cookies, por lo que las páginas que
// sólo consultan catálogo pueden mantener ISR (`export const revalidate`).
export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
