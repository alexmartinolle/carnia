import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'STAFF') {
    return NextResponse.json({ count: 0 }, { status: 401 })
  }

  const admin = createAdminClient()
  const { count, error } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('sale_channel', 'ONLINE')
    .eq('order_status', 'PENDING')
  if (error) return NextResponse.json({ count: 0 })
  return NextResponse.json({ count: count ?? 0 })
}
