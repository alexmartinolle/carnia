import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, DELIVERY_TYPE_LABELS } from '@/lib/schemas/sale.schema'
import { CheckCircle, Store, Info, Circle, CircleCheck, CreditCard, Clock, Truck, MapPin } from 'lucide-react'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function OrderConfirmationPage({ params }: { params: Props['params'] }) {
  const { locale, id } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, created_at, sale_channel, order_status, payment_status, payment_method, delivery_type,
      guest_name, guest_phone, guest_email, notes, subtotal, total, ticket_number, delivery_address,
      order_items (id, product_name, quantity, estimated_quantity, unit_price, total, notes)
    `)
    .eq('id', id)
    .eq('sale_channel', 'ONLINE')
    .single()

  if (!order) notFound()

  const items   = order.order_items ?? []
  const hasEstim = items.some((it) => it.estimated_quantity != null)
  const deliveryAddress = order.delivery_address ? JSON.parse(order.delivery_address as string) : null

  const timelineSteps = [
    { key: 'PENDING', label: 'Recibido' },
    { key: 'CONFIRMED', label: 'Confirmado' },
    { key: 'PREPARING', label: 'Preparando' },
    { key: 'READY', label: 'Listo' },
    { key: 'DELIVERED', label: 'Entregado' },
  ]

  const currentStepIndex = timelineSteps.findIndex(step => step.key === order.order_status)

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 space-y-8">

      {/* Confirmación */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center bg-linear-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 animate-in fade-in zoom-in duration-500">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>
          ¡Pedido recibido!
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Ticket <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-emerald-50 to-green-50 border border-emerald-200 font-mono font-bold text-emerald-700 shadow-sm">#{order.ticket_number ?? '—'}</span>
        </p>
      </div>

      {/* Timeline del estado */}
      <div className="rounded-2xl p-6 bg-white border" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex items-center justify-between relative">
          {timelineSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isPending = index > currentStepIndex

            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all z-10 ${
                  isCompleted ? 'bg-emerald-500 border-emerald-500' :
                  isCurrent ? 'bg-emerald-100 border-emerald-500' :
                  'bg-gray-100 border-gray-300'
                }`}>
                  {isCompleted ? (
                    <CircleCheck className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <Circle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isCompleted ? 'text-emerald-600' :
                  isCurrent ? 'text-emerald-700' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < timelineSteps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 h-0.5 -translate-x-1/2 -z-10 ${
                    index < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} style={{ width: 'calc(100% + 1rem)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Estado del pago */}
      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.payment_status === 'PAID' ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              {order.payment_status === 'PAID' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-main)' }}>
                Estado del pago
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {PAYMENT_STATUS_LABELS[order.payment_status as keyof typeof PAYMENT_STATUS_LABELS] ?? order.payment_status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {order.payment_method === 'REDSYS' ? (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta online</span>
              </>
            ) : (
              <>
                <Store className="w-4 h-4" />
                <span>Efectivo en tienda</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      {order.delivery_type === 'SHIPPING' && deliveryAddress ? (
        <div className="rounded-2xl p-5 text-sm space-y-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center gap-2 font-semibold text-blue-900">
            <Truck className="w-4 h-4" />
            Envío a domicilio
          </div>
          <div className="flex items-start gap-2 text-blue-800">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p>{deliveryAddress.address}</p>
              <p>{deliveryAddress.postal_code} {deliveryAddress.city}</p>
              <p>{deliveryAddress.province}</p>
            </div>
          </div>
          <p className="text-blue-700">Te avisaremos cuando esté listo para enviar. {order.payment_method === 'CASH' ? 'El pago se realiza al recoger.' : 'Ya has pagado online.'}</p>
        </div>
      ) : (
        <div className="rounded-2xl p-5 text-sm space-y-2 bg-linear-to-r from-orange-50 to-amber-50 border border-orange-200">
          <div className="flex items-center gap-2 font-semibold text-orange-900">
            <Store className="w-4 h-4" />
            Recogida en tienda
          </div>
          <p className="text-orange-800">Te avisaremos cuando esté listo. {order.payment_method === 'CASH' ? 'El pago se realiza al recoger.' : 'Ya has pagado online.'}</p>
          <p className="text-orange-700">Carnicería El Uru · Gran Via de Lluís Companys, 102, Premià de Mar</p>
        </div>
      )}

      {/* Datos */}
      <div className="bg-white border rounded-2xl p-6 space-y-3"
        style={{ borderColor: '#e5e7eb' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>
          Datos
        </h2>
        <Row label="Nombre"   value={order.guest_name} />
        <Row label="Teléfono" value={order.guest_phone} />
        {order.guest_email && <Row label="Email" value={order.guest_email} />}
        <Row label="Estado"   value={ORDER_STATUS_LABELS[order.order_status as keyof typeof ORDER_STATUS_LABELS] ?? order.order_status} />
        <Row label="Pago"     value="Al recogerlo en tienda" />
        {order.notes && <Row label="Notas" value={order.notes} />}
      </div>

      {/* Líneas */}
      <div className="bg-white border rounded-2xl p-6 space-y-4"
        style={{ borderColor: '#e5e7eb' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>
          Productos
        </h2>
        <ul className="divide-y" style={{ borderColor: '#e5e7eb' }}>
          {items.map((it) => {
            const qty   = it.quantity ?? it.estimated_quantity
            const isEst = it.estimated_quantity != null && it.quantity == null
            return (
              <li key={it.id} className="py-3 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium" style={{ color: 'var(--color-text-main)' }}>
                    {it.product_name}
                  </p>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    {qty} {it.estimated_quantity != null ? 'kg' : 'ud'}
                    {' · '}
                    {Number(it.unit_price).toFixed(2)} €
                  </p>
                  {it.notes && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {it.notes}
                    </p>
                  )}
                </div>
                <span className="font-semibold shrink-0"
                  style={{ color: 'var(--color-text-main)' }}>
                  {Number(it.total).toFixed(2)} €
                </span>
              </li>
            )
          })}
        </ul>

        <div className="border-t pt-3 flex justify-between font-bold text-lg"
          style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}>
          <span>Total</span>
          <span>{Number(order.total).toFixed(2)} €</span>
        </div>
      </div>

      <Link href={`/${locale}/productos`}
        className="block text-center text-base hover:underline"
        style={{ color: 'var(--color-text-muted)' }}>
        ← Seguir comprando
      </Link>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-right" style={{ color: 'var(--color-text-main)' }}>{value}</span>
    </div>
  )
}
