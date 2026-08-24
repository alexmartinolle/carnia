import { createClient } from '@/utils/supabase/server'
import type { SaleListItem, SaleWithItems } from '@/types/sale'

export async function getSales(filters?: {
  channel?: string
  status?:  string
}): Promise<SaleListItem[]> {
  const supabase = await createClient()
  let q = supabase
    .from('orders')
    .select('id, created_at, sale_channel, order_status, payment_status, guest_name, total, ticket_number, order_items(id)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (filters?.channel) q = q.eq('sale_channel', filters.channel)
  if (filters?.status)  q = q.eq('order_status', filters.status)

  const { data, error } = await q
  if (error || !data) return []
  return data as unknown as SaleListItem[]
}

export async function getSaleById(id: string): Promise<SaleWithItems | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as unknown as SaleWithItems
}

export async function getPendingOrdersCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('sale_channel', 'ONLINE')
    .eq('order_status', 'PENDING')
  if (error) return 0
  return count ?? 0
}

export async function getTodayOrdersCount(): Promise<number> {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
  if (error) return 0
  return count ?? 0
}

export async function getTodaySalesTotal(): Promise<number> {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', today.toISOString())
  if (error || !data) return 0
  return data.reduce((sum, order) => sum + (order.total || 0), 0)
}
