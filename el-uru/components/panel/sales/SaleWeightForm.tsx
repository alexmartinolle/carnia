'use client'
import { useState } from 'react'
import { updateOrderWeights } from '@/lib/actions/orders.actions'

type Props = {
  orderId: string
  items: Array<{
    id: string
    product_name: string
    quantity: number | null
    estimated_quantity: number | null
    unit_price: number
    total: number
    notes: string | null
  }>
  currentTotal: number
}

export default function SaleWeightForm({ orderId, items, currentTotal }: Props) {
  const [weights, setWeights] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    items.forEach((it) => {
      if (it.quantity != null) init[it.id] = String(it.quantity)
      else if (it.estimated_quantity != null) init[it.id] = String(it.estimated_quantity)
    })
    return init
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const weightItems = items.filter((it) => it.estimated_quantity != null && it.quantity == null)

  if (weightItems.length === 0) return null

  function handleChange(id: string, value: string) {
    setWeights((w) => ({ ...w, [id]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const updates = weightItems.map((it) => ({
      id: it.id,
      quantity: parseFloat(weights[it.id] || '0'),
    }))

    const res = await updateOrderWeights(orderId, updates, currentTotal)
    if (!res.success) {
      setError(res.error || 'Error al actualizar pesos')
      setLoading(false)
      return
    }
    window.location.reload()
  }

  return (
    <div className="bg-[#1f100a] border border-white/5 rounded-xl p-5 mb-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Peso real (kg)</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {weightItems.map((it) => (
          <div key={it.id} className="flex items-center gap-3">
            <span className="text-sm text-zinc-200 min-w-0 truncate">{it.product_name}</span>
            <span className="text-xs text-zinc-500 shrink-0">
              (aprox. {Number(it.estimated_quantity).toFixed(2)} kg)
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={weights[it.id]}
              onChange={(e) => handleChange(it.id, e.target.value)}
              className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm
                text-zinc-100 focus:outline-none focus:border-[#E57368]"
            />
            <span className="text-xs text-zinc-500 shrink-0">kg</span>
          </div>
        ))}

        {error && (
          <p className="text-sm text-rose-400">⚠️ {error}</p>
        )}

        <button type="submit" disabled={loading}
          className="px-4 py-2 rounded-lg bg-[#E57368] text-white text-sm font-medium
            hover:bg-[#d65f55] transition-colors disabled:opacity-50">
          {loading ? 'Guardando…' : 'Confirmar pesos y actualizar total'}
        </button>
      </form>
    </div>
  )
}
