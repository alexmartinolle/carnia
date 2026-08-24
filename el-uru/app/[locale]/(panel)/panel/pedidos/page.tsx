import Link             from 'next/link'
import { getSales }      from '@/lib/queries/sales'
import SalesTable        from '@/components/panel/sales/SalesTable'
import { ORDER_STATUS_LABELS } from '@/lib/schemas/sale.schema'

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const orders = await getSales({ channel: 'ONLINE', status: 'PENDING' })

  const totalToday = orders
    .filter(s => new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + Number(s.total), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Pedidos pendientes</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {orders.length} pedidos · {totalToday.toFixed(2)} € hoy
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#1f100a] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-zinc-400">No hay pedidos pendientes</p>
        </div>
      ) : (
        <SalesTable sales={orders} locale={locale} />
      )}
    </div>
  )
}
