import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// Validar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Cliente de Supabase para el servidor (con service role)
 * Bypass RLS - usar con precaución
 */
export function createServerClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Cliente de Supabase para el navegador (con anon key)
 * Respeta RLS
 */
export function createBrowserClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

/**
 * Singleton del cliente de servidor
 */
let serverClientInstance: ReturnType<typeof createServerClient> | null = null

export function getServerClient() {
  if (!serverClientInstance) {
    serverClientInstance = createServerClient()
  }
  return serverClientInstance
}