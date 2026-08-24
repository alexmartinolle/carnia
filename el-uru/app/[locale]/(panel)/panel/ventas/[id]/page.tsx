import Link            from 'next/link'
import { getSaleById } from '@/lib/queries/sales'
import { notFound }    from 'next/navigation'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  DELIVERY_TYPE_LABELS,
} from '@/lib/schemas/sale.schema'
import SaleWeightForm  from '@/components/panel/sales/SaleWeightForm'

export default async function ViewSalePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const sale = await getSaleById(id)
  if (!sale) notFound()

  const created = new Date(sale.created_at)
  const dateFmt = created.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeFmt = created.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Ticket #{sale.ticket_number ?? '—'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">{dateFmt} · {timeFmt}</p>
        </div>
        <Link
          href={`/${locale}/panel/ventas`}
          className="px-4 py-2 rounded-lg border border-white/10 text-zinc-300 text-sm hover:bg-white/5 transition-colors"
        >
          ← Volver
        </Link>
      </div>

      {/* Metadatos */}
      <div className="bg-[#1f100a] border border-white/5 rounded-xl p-5 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Field label="Canal" value={sale.sale_channel === 'TIENDA' ? 'Tienda' : 'Online'} />
        <Field label="Estado" value={ORDER_STATUS_LABELS[sale.order_status as keyof typeof ORDER_STATUS_LABELS] ?? sale.order_status} />
        <Field label="Pago" value={PAYMENT_STATUS_LABELS[sale.payment_status as keyof typeof PAYMENT_STATUS_LABELS] ?? sale.payment_status} />
        <Field label="Método" value={PAYMENT_METHOD_LABELS[sale.payment_method as keyof typeof PAYMENT_METHOD_LABELS] ?? sale.payment_method} />
        <Field label="Entrega" value={DELIVERY_TYPE_LABELS[sale.delivery_type as keyof typeof DELIVERY_TYPE_LABELS] ?? sale.delivery_type} />
        <Field label="Cliente" value={sale.guest_name || '—'} />
        <Field label="Teléfono" value={sale.guest_phone || '—'} />
        <Field label="Email" value={sale.guest_email || '—'} />
      </div>

      {/* Formulario peso real si hay productos por kg sin peso confirmado */}
      <SaleWeightForm
        orderId={sale.id}
        items={sale.order_items}
        currentTotal={Number(sale.total)}
      />

      {/* Líneas */}
      <div className="bg-[#1f100a] border border-white/5 rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="text-left  px-4 py-3 font-medium text-zinc-400">Producto</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Cantidad</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">€ / ud.</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sale.order_items.map(it => {
              const qty   = it.quantity ?? it.estimated_quantity
              const isEst = it.estimated_quantity != null && it.quantity == null
              return (
                <tr key={it.id}>
                  <td className="px-4 py-3 text-zinc-200">{it.product_name}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">
                    {qty != null ? Number(qty).toFixed(2) : '—'}
                    {isEst && <span className="ml-1 text-xs text-amber-400">(aprox.)</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">{Number(it.unit_price).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#E57368]">{Number(it.total).toFixed(2)} €</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="bg-[#1f100a] border border-white/5 rounded-xl p-5 ml-auto md:max-w-xs space-y-2 text-sm">
        <Row label="Subtotal" value={`${Number(sale.subtotal).toFixed(2)} €`} />
        {Number(sale.discount) > 0 && (
          <Row label="Descuento" value={`- ${Number(sale.discount).toFixed(2)} €`} muted />
        )}
        {Number(sale.shipping_cost) > 0 && (
          <Row label="Envío" value={`${Number(sale.shipping_cost).toFixed(2)} €`} muted />
        )}
        <div className="border-t border-white/10 pt-2 flex items-center justify-between">
          <span className="text-zinc-300 font-medium">Total</span>
          <span className="text-[#E57368] font-bold text-lg">{Number(sale.total).toFixed(2)} €</span>
        </div>
      </div>

      {sale.notes && (
        <div className="mt-4 bg-[#1f100a] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Notas</p>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap">{sale.notes}</p>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-zinc-200">{value}</p>
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-zinc-500' : 'text-zinc-400'}>{label}</span>
      <span className={muted ? 'text-zinc-400' : 'text-zinc-200'}>{value}</span>
    </div>
  )
}
