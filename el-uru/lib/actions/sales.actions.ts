'use server'
import { createClient }      from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath }    from 'next/cache'
import { SaleSchema, type SaleInput } from '@/lib/schemas/sale.schema'

type ActionResult<T = unknown> = {
  success: boolean
  error?:  string
  data?:   T
}

async function requireStaff(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'STAFF'
}

function computeTotals(input: SaleInput) {
  const subtotal = input.items.reduce((s, it) => s + Number(it.total || 0), 0)
  const total    = Math.max(0, subtotal + Number(input.shipping_cost || 0) - Number(input.discount || 0))
  return { subtotal, total }
}

function orderPayload(data: SaleInput, totals: { subtotal: number; total: number }) {
  return {
    sale_channel:   data.sale_channel,
    delivery_type:  data.delivery_type,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
    order_status:   data.order_status,
    guest_name:     data.guest_name  || null,
    guest_phone:    data.guest_phone || null,
    guest_email:    data.guest_email || null,
    notes:          data.notes       || null,
    subtotal:       totals.subtotal,
    shipping_cost:  Number(data.shipping_cost || 0),
    discount:       Number(data.discount || 0),
    total:          totals.total,
  }
}

function itemsPayload(orderId: string, data: SaleInput) {
  return data.items.map((it) => ({
    order_id:           orderId,
    product_id:         it.product_id,
    product_name:       it.product_name,
    quantity:           it.quantity != null ? Number(it.quantity) : null,
    estimated_quantity: it.estimated_quantity != null ? Number(it.estimated_quantity) : null,
    unit_price:         Number(it.unit_price),
    total:              Number(it.total),
    notes:              it.notes || null,
  }))
}

// ----- Crear ----------------------------------------------------------
export async function createSale(formData: unknown): Promise<ActionResult<{ id: string; ticket_number: number }>> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const result = SaleSchema.safeParse(formData)
  if (!result.success) return { success: false, error: result.error.issues[0].message }

  const data   = result.data
  const totals = computeTotals(data)
  const supabase = createAdminClient()

  const { data: lastTicket } = await supabase
    .from('orders')
    .select('ticket_number')
    .order('ticket_number', { ascending: false })
    .limit(1)
    .single()
  const ticketNumber = (lastTicket?.ticket_number || 0) + 1

  const { data: order, error } = await supabase
    .from('orders')
    .insert({ ...orderPayload(data, totals), ticket_number: ticketNumber })
    .select('id, ticket_number')
    .single()

  if (error || !order) return { success: false, error: error?.message ?? 'Error creando venta' }

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(itemsPayload(order.id, data))

  if (itemsErr) {
    await supabase.from('orders').delete().eq('id', order.id)
    return { success: false, error: itemsErr.message }
  }

  // Restar del stock (read-modify-write; uso staff de baja concurrencia).
  // Si el pedido se cancela posteriormente, habrá que reponer manualmente.
  await Promise.all(data.items.map(async (it) => {
    const { data: prod } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', it.product_id)
      .single()
    if (!prod) return
    const newQty = Math.max(0, Number(prod.stock_quantity) - Number(it.quantity))
    await supabase
      .from('products')
      .update({ stock_quantity: newQty })
      .eq('id', it.product_id)
  }))

  revalidatePath('/panel/ventas')
  revalidatePath('/panel/productos')
  revalidatePath('/panel/stock')
  revalidatePath('/panel')
  return { success: true, data: { id: order.id, ticket_number: order.ticket_number } }
}

// ----- Actualizar -----------------------------------------------------
export async function updateSale(id: string, formData: unknown): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const result = SaleSchema.safeParse(formData)
  if (!result.success) return { success: false, error: result.error.issues[0].message }

  const data   = result.data
  const totals = computeTotals(data)
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('orders')
    .update(orderPayload(data, totals))
    .eq('id', id)
  if (error) return { success: false, error: error.message }

  // Reemplazar items: borrar + insertar (sencillo y consistente)
  const { error: delErr } = await supabase.from('order_items').delete().eq('order_id', id)
  if (delErr) return { success: false, error: delErr.message }

  const { error: insErr } = await supabase
    .from('order_items')
    .insert(itemsPayload(id, data))
  if (insErr) return { success: false, error: insErr.message }

  revalidatePath('/panel/ventas')
  revalidatePath(`/panel/ventas/${id}`)
  revalidatePath('/panel')
  return { success: true }
}

// ----- Cambio de estado ----------------------------------------------
export async function completeSale(id: string): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ order_status: 'DELIVERED', payment_status: 'PAID' })
    .eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/ventas')
  revalidatePath(`/panel/ventas/${id}`)
  revalidatePath('/panel')
  return { success: true }
}

export async function cancelSale(id: string): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ order_status: 'CANCELLED' })
    .eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/ventas')
  revalidatePath(`/panel/ventas/${id}`)
  return { success: true }
}

// ----- Borrar ---------------------------------------------------------
export async function deleteSale(id: string): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }
  const supabase = createAdminClient()
  // order_items se eliminan en cascada si has aplicado la migración.
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/ventas')
  revalidatePath('/panel')
  return { success: true }
}
