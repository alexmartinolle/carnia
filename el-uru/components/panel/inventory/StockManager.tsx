'use client'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, DollarSign, AlertTriangle, CircleSlash, CheckCircle2, XCircle } from 'lucide-react'
import { toggleProductAvailability } from '@/lib/actions/inventory.actions'

export type StockRow = {
  id: string
  name_es: string
  product_type: 'UNIT' | 'WEIGHT'
  price: number
  stock_quantity: number
  stock_threshold: number
  is_available: boolean
  unit_cost: number | null
  category_name: string | null
  material_name: string | null
  material_cost_per_kg: number | null
}

type Props = { products: StockRow[] }

const card = 'bg-[#1f100a] border border-white/5 rounded-xl'

function costOf(p: StockRow): number {
  return p.product_type === 'WEIGHT'
    ? Number(p.material_cost_per_kg ?? 0)
    : Number(p.unit_cost ?? 0)
}

export default function StockManager({ products }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [availability, setAvailability] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL')

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => p.category_name && set.add(p.category_name))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [products])

  const inventoryValue = useMemo(
    () => products.reduce((s, p) => s + Number(p.stock_quantity) * costOf(p), 0),
    [products],
  )
  const lowStock  = products.filter((p) => Number(p.stock_quantity) <= Number(p.stock_threshold))
  const noCost    = products.filter((p) => costOf(p) <= 0)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (q && !p.name_es.toLowerCase().includes(q)) return false
      if (category !== 'ALL' && p.category_name !== category) return false
      if (availability === 'AVAILABLE' && !p.is_available) return false
      if (availability === 'UNAVAILABLE' && p.is_available) return false
      return true
    })
  }, [products, search, category, availability])

  function toggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleProductAvailability(id, !current)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Stock</h1>
          <p className="text-sm text-zinc-400 mt-1">Disponibilidad, coste y margen por producto</p>
        </div>
        <div className="relative flex-1 lg:flex-none lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 py-2.5 rounded-lg bg-[#1f100a] border border-white/10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#E57368]"
          />
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100 mb-2">
            <DollarSign className="size-4 text-emerald-400" /> Valor del inventario (coste)
          </div>
          <p className="text-3xl font-bold text-zinc-50">
            {inventoryValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-zinc-500 mt-1">Stock estimado × coste</p>
        </div>
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100 mb-2">
            <AlertTriangle className="size-4 text-amber-400" /> Stock bajo
          </div>
          <p className="text-3xl font-bold text-zinc-50">{lowStock.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Por debajo del umbral</p>
        </div>
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100 mb-2">
            <CircleSlash className="size-4 text-rose-400" /> Sin coste asignado
          </div>
          <p className="text-3xl font-bold text-zinc-50">{noCost.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Sin materia prima o coste unitario</p>
        </div>
      </div>

      {/* Tabla */}
      <div className={`${card} overflow-hidden`}>
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">Control de stock</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="ALL">Todas las categorías</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as typeof availability)}
              className="bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="ALL">Todas</option>
              <option value="AVAILABLE">Disponibles</option>
              <option value="UNAVAILABLE">Agotados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Materia prima</th>
                <th className="px-4 py-3 font-medium text-right">Coste</th>
                <th className="px-4 py-3 font-medium text-right">Venta</th>
                <th className="px-4 py-3 font-medium text-right">Margen</th>
                <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 font-medium text-center">Disponible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.map((p) => {
                const unit = p.product_type === 'WEIGHT' ? '/kg' : '/ud'
                const cost = costOf(p)
                const sale = Number(p.price)
                const hasCost = cost > 0 && sale > 0
                const marginV = sale - cost
                const marginP = sale > 0 ? (marginV / sale) * 100 : 0
                const low = Number(p.stock_quantity) <= Number(p.stock_threshold)
                return (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-zinc-100">{p.name_es}</span>
                      <span className="block text-xs text-zinc-500">
                        {p.category_name ?? '—'} · {p.product_type === 'WEIGHT' ? 'Por kg' : 'Por ud'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{p.material_name ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      {hasCost ? `${cost.toFixed(2)} €${unit}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">{sale.toFixed(2)} €{unit}</td>
                    <td className="px-4 py-3 text-right">
                      {hasCost ? (
                        <span className={marginV >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                          {marginV.toFixed(2)} € · {marginP.toFixed(0)}%
                        </span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className={low ? 'text-rose-400 font-medium' : 'text-zinc-300'}>
                        {Number(p.stock_quantity)}{p.product_type === 'WEIGHT' ? ' kg' : ' ud'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        disabled={pending}
                        onClick={() => toggle(p.id, p.is_available)}
                        className="inline-flex items-center gap-1.5 disabled:opacity-50"
                        title={p.is_available ? 'Marcar agotado' : 'Marcar disponible'}
                      >
                        {p.is_available
                          ? <CheckCircle2 className="size-5 text-emerald-400" />
                          : <XCircle className="size-5 text-zinc-500" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-4xl mb-3">🥩</p>
              <p>Ningún producto coincide con los filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
