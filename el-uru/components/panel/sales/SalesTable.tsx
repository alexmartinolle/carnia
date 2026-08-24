'use client'
import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/schemas/sale.schema'
import { completeSale, cancelSale, deleteSale } from '@/lib/actions/sales.actions'
import type { SaleListItem } from '@/types/sale'

type Props = {
  sales:  SaleListItem[]
  locale: string
}

const STATUS_BG: Record<string, string> = {
  PENDING:   'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  CONFIRMED: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  PREPARING: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  READY:     'bg-violet-500/15 text-violet-300 border border-violet-500/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  CANCELLED: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
}

export default function SalesTable({ sales, locale }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleComplete(id: string) {
    setLoadingId(id)
    await completeSale(id)
    setLoadingId(null)
    router.refresh()
  }
  async function handleCancel(id: string) {
    if (!confirm('¿Cancelar esta venta?')) return
    setLoadingId(id)
    await cancelSale(id)
    setLoadingId(null)
    router.refresh()
  }
  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar definitivamente esta venta? No se puede deshacer.')) return
    setLoadingId(id)
    await deleteSale(id)
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="bg-[#1f100a] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="text-left  px-4 py-3 font-medium text-zinc-400">Ticket</th>
              <th className="text-left  px-4 py-3 font-medium text-zinc-400">Fecha</th>
              <th className="text-left  px-4 py-3 font-medium text-zinc-400">Canal</th>
              <th className="text-left  px-4 py-3 font-medium text-zinc-400">Cliente</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">Items</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Total</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-400">Estado</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">Pago</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sales.map((sale) => {
              const isLoading = loadingId === sale.id
              const date      = new Date(sale.created_at)
              const dateFmt   = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
              const timeFmt   = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              const itemCount = sale.order_items?.length ?? 0

              return (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-zinc-200 font-mono font-bold">
                    #{sale.ticket_number ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">
                    <div className="font-medium">{dateFmt}</div>
                    <div className="text-xs text-zinc-500">{timeFmt}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                      sale.sale_channel === 'TIENDA'
                        ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}>
                      {sale.sale_channel === 'TIENDA' ? 'Tienda' : 'Online'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-200">
                    {sale.guest_name || <span className="text-zinc-500 italic">{sale.id}</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 hidden md:table-cell">
                    {itemCount}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#E57368]">
                    {Number(sale.total).toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BG[sale.order_status] ?? 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'}`}>
                      {ORDER_STATUS_LABELS[sale.order_status as keyof typeof ORDER_STATUS_LABELS] ?? sale.order_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-zinc-400 hidden md:table-cell">
                    {PAYMENT_STATUS_LABELS[sale.payment_status as keyof typeof PAYMENT_STATUS_LABELS] ?? sale.payment_status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {sale.order_status !== 'DELIVERED' && sale.order_status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleComplete(sale.id)}
                          disabled={isLoading}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                        >
                          Completar
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/${locale}/panel/ventas/${sale.id}`)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-zinc-200 hover:bg-white/5 transition-colors font-medium"
                      >
                        Ver
                      </button>
                      {sale.order_status !== 'CANCELLED' && sale.order_status !== 'DELIVERED' && (
                        <button
                          onClick={() => handleCancel(sale.id)}
                          disabled={isLoading}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors font-medium disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(sale.id)}
                        disabled={isLoading}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors font-medium disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sales.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-base">No hay ventas registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
