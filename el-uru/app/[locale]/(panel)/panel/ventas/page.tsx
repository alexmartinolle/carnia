import Link             from 'next/link'
import { getSales }      from '@/lib/queries/sales'
import SalesTable        from '@/components/panel/sales/SalesTable'
import { ORDER_STATUSES, SALE_CHANNELS, ORDER_STATUS_LABELS } from '@/lib/schemas/sale.schema'

type SP = { channel?: string; status?: string }

export default async function AdminSalesPage({
  params,
  searchParams,
}: {
  params:       Promise<{ locale: string }>
  searchParams: Promise<SP>
}) {
  const { locale } = await params
  const sp         = await searchParams

  const channel = SALE_CHANNELS.includes(sp.channel as never) ? sp.channel : undefined
  const status  = ORDER_STATUSES.includes(sp.status as never)  ? sp.status  : undefined

  const sales = await getSales({ channel, status })

  const totalToday = sales
    .filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()
              && s.order_status !== 'CANCELLED')
    .reduce((sum, s) => sum + Number(s.total), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Ventas</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {sales.length} ventas · {totalToday.toFixed(2)} € hoy
          </p>
        </div>
        <Link
          href={`/${locale}/panel/ventas/nueva`}
          className="px-5 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#a93226] text-white text-sm font-semibold transition-colors"
        >
          + Nueva venta
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4 flex-wrap text-sm">
        <span className="text-zinc-400 mr-1">Canal:</span>
        <FilterPill href={`/${locale}/panel/ventas`}                          label="Todos"  active={!channel} />
        <FilterPill href={`/${locale}/panel/ventas?channel=TIENDA`}           label="Tienda" active={channel === 'TIENDA'} />
        <FilterPill href={`/${locale}/panel/ventas?channel=ONLINE`}           label="Online" active={channel === 'ONLINE'} />

        <span className="text-zinc-400 ml-4 mr-1">Estado:</span>
        <FilterPill href={`/${locale}/panel/ventas${channel ? `?channel=${channel}` : ''}`} label="Todos" active={!status} />
        {ORDER_STATUSES.map(st => (
          <FilterPill
            key={st}
            href={`/${locale}/panel/ventas?status=${st}${channel ? `&channel=${channel}` : ''}`}
            label={ORDER_STATUS_LABELS[st]}
            active={status === st}
          />
        ))}
      </div>

      <SalesTable sales={sales} locale={locale} />
    </div>
  )
}

function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-[#C0392B] text-white border-[#C0392B]'
          : 'bg-[#1f100a] text-zinc-300 border-white/10 hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  )
}
