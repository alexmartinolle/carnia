'use server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath }    from 'next/cache'
import { OnlineOrderSchema } from '@/lib/schemas/sale.schema'
import { effectiveUnitPrice } from '@/lib/pricing'

type ActionResult<T = unknown> = {
  success: boolean
  error?:  string
  data?:   T
}

export async function createOnlineOrder(formData: unknown): Promise<ActionResult<{ id: string; ticket_number: number }>> {
  return createOrderBase(formData, 'CASH', 'PENDING')
}

export async function createOnlineOrderPayNow(formData: unknown): Promise<ActionResult<{ id: string; ticket_number: number }>> {
  return createOrderBase(formData, 'REDSYS', 'PENDING')
}

async function createOrderBase(formData: unknown, paymentMethod: string, paymentStatus: string): Promise<ActionResult<{ id: string; ticket_number: number }>> {
  const parsed = OnlineOrderSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const data = parsed.data
  const supabase = createAdminClient()

  // Cargar productos referenciados para recalcular precios desde BD
  const productIds = Array.from(new Set(data.items.map((it) => it.product_id)))
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name_es, product_type, price, price_per_kg, offer_price, is_on_offer, stock_quantity, is_visible')
    .in('id', productIds)

  if (prodErr) return { success: false, error: prodErr.message }
  if (!products || products.length !== productIds.length) {
    return { success: false, error: 'Algún producto no está disponible' }
  }

  const byId = new Map(products.map((p) => [p.id, p]))

  // Construir líneas con precio congelado y diferenciar peso estimado vs cantidad real
  let subtotal = 0
  const items = data.items.map((it) => {
    const p = byId.get(it.product_id)!
    if (!p.is_visible) {
      throw new Error(`Producto no disponible: ${p.name_es}`)
    }
    const unit_price = effectiveUnitPrice(p)
    const isWeight   = p.product_type === 'WEIGHT'
    const total      = Number((unit_price * it.quantity).toFixed(2))
    subtotal += total
    return {
      product_id:         p.id,
      product_name:       p.name_es,
      quantity:           isWeight ? null : it.quantity,
      estimated_quantity: isWeight ? it.quantity : null,
      unit_price,
      total,
      notes:              it.notes || null,
    }
  })

  // Calcular coste de envío
  const isDelivery = data.is_delivery || false
  const shippingCost = isDelivery ? 5 : 0
  const total = subtotal + shippingCost

  // Generar número de ticket
  const { data: lastTicket } = await supabase
    .from('orders')
    .select('ticket_number')
    .order('ticket_number', { ascending: false })
    .limit(1)
    .single()
  const ticketNumber = (lastTicket?.ticket_number || 0) + 1

  // Crear pedido online
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      sale_channel:   'ONLINE',
      delivery_type:  isDelivery ? 'SHIPPING' : 'PICKUP',
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status:   'PENDING',
      guest_name:     data.guest_name,
      guest_phone:    data.guest_phone,
      guest_email:    data.guest_email || null,
      delivery_address: data.delivery_address ? JSON.stringify(data.delivery_address) : null,
      notes:          data.notes || null,
      subtotal,
      shipping_cost:  shippingCost,
      discount:       0,
      total:          total,
      ticket_number:  ticketNumber,
    })
    .select('id, ticket_number')
    .single()

  if (orderErr || !order) return { success: false, error: orderErr?.message ?? 'Error creando pedido' }

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(items.map((it) => ({ ...it, order_id: order.id })))

  if (itemsErr) {
    await supabase.from('orders').delete().eq('id', order.id)
    return { success: false, error: itemsErr.message }
  }

  // No se descuenta stock aquí: se hace al confirmar/preparar en el panel.
  revalidatePath('/panel/ventas')
  revalidatePath('/panel')
  return { success: true, data: { id: order.id, ticket_number: order.ticket_number } }
}

export async function updateOrderWeights(
  orderId: string,
  updates: Array<{ id: string; quantity: number }>,
  currentTotal: number
): Promise<ActionResult> {
  const supabase = createAdminClient()

  // Calcular nuevo total
  const { data: items } = await supabase
    .from('order_items')
    .select('id, unit_price, quantity, estimated_quantity, total')
    .eq('order_id', orderId)

  if (!items) return { success: false, error: 'Error cargando líneas' }

  const byId = new Map(items.map((it) => [it.id, it]))
  let newTotal = 0

  const toUpdate = updates.map((u) => {
    const it = byId.get(u.id)
    if (!it) throw new Error('Línea no encontrada')
    const total = Number((it.unit_price * u.quantity).toFixed(2))
    newTotal += total
    return { id: u.id, quantity: u.quantity, total }
  })

  // Sumar líneas sin cambios
  items.forEach((it) => {
    if (!updates.find((u) => u.id === it.id)) {
      newTotal += Number(it.total)
    }
  })

  // Actualizar líneas
  const { error: updateErr } = await supabase
    .from('order_items')
    .update(toUpdate)
    .in('id', updates.map((u) => u.id))

  if (updateErr) return { success: false, error: updateErr.message }

  // Actualizar total del pedido
  const { error: orderErr } = await supabase
    .from('orders')
    .update({ total: newTotal })
    .eq('id', orderId)

  if (orderErr) return { success: false, error: orderErr.message }

  revalidatePath('/panel/ventas')
  revalidatePath(`/panel/ventas/${orderId}`)
  return { success: true }
}
