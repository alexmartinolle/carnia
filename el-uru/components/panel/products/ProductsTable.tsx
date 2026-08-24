'use client'
import { useMemo, useState }     from 'react'
import { useRouter }             from 'next/navigation'
import { toggleProductVisibility, deleteProduct } from '@/lib/actions/products.actions'
import type { Product }          from '@/types/product'

type Props = {
  products: Product[]
  locale:   string
}

type SortKey = 'name' | 'price' | 'stock' | 'created'
type SortDir = 'asc' | 'desc'
type TypeFilter = 'ALL' | 'WEIGHT' | 'UNIT'

export default function ProductsTable({ products, locale }: Props) {
  const router  = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [search,      setSearch]      = useState('')
  const [categoryId,  setCategoryId]  = useState<string>('ALL')
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('ALL')
  const [onlyOffer,   setOnlyOffer]   = useState(false)
  const [onlyHidden,  setOnlyHidden]  = useState(false)
  const [onlyLowStock, setOnlyLowStock] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Categorías únicas derivadas de los productos.
  const categories = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of products) {
      if (p.categories?.id) map.set(p.categories.id, p.categories.name_es)
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = products.filter(p => {
      if (q && !p.name_es.toLowerCase().includes(q) && !p.name_ca.toLowerCase().includes(q)) return false
      if (categoryId !== 'ALL' && p.categories?.id !== categoryId) return false
      if (typeFilter !== 'ALL' && p.product_type !== typeFilter) return false
      if (onlyOffer && !p.is_on_offer) return false
      if (onlyHidden && p.is_visible) return false
      if (onlyLowStock && Number(p.stock_quantity) > Number(p.stock_threshold)) return false
      return true
    })

    const dir = sortDir === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'name':    return a.name_es.localeCompare(b.name_es, 'es') * dir
        case 'price':   return (Number(a.price) - Number(b.price)) * dir
        case 'stock':   return (Number(a.stock_quantity) - Number(b.stock_quantity)) * dir
        case 'created': return (new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()) * dir
      }
    })
    return filtered
  }, [products, search, categoryId, typeFilter, onlyOffer, onlyHidden, onlyLowStock, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const sortIcon = (key: SortKey) => sortKey !== key ? '' : sortDir === 'asc' ? ' ↑' : ' ↓'

  async function handleToggleVisibility(id: string, current: boolean) {
    setLoadingId(id)
    await toggleProductVisibility(id, !current)
    setLoadingId(null)
    router.refresh()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setLoadingId(id)
    await deleteProduct(id)
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {/* Barra de filtros */}
      <div className="bg-[#1f100a] border border-white/5 rounded-xl p-3 flex flex-wrap items-center gap-2 text-sm">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 min-w-[180px] bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]"
        />
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
        >
          <option value="ALL">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as TypeFilter)}
          className="bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#C0392B]"
        >
          <option value="ALL">Todos los tipos</option>
          <option value="WEIGHT">Por kg</option>
          <option value="UNIT">Por unidad</option>
        </select>
        <ToggleChip active={onlyOffer}    onClick={() => setOnlyOffer(v => !v)}>En oferta</ToggleChip>
        <ToggleChip active={onlyLowStock} onClick={() => setOnlyLowStock(v => !v)}>Stock bajo</ToggleChip>
        <ToggleChip active={onlyHidden}   onClick={() => setOnlyHidden(v => !v)}>Ocultos</ToggleChip>
        <span className="text-xs text-zinc-500 ml-auto">{visible.length} de {products.length}</span>
      </div>

      <div className="bg-[#1f100a] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="text-left px-4 py-3 font-medium text-zinc-400">
                <button type="button" onClick={() => toggleSort('name')} className="hover:text-zinc-200 transition-colors">
                  Producto{sortIcon('name')}
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">Categoría</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">Tipo</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">
                <button type="button" onClick={() => toggleSort('price')} className="hover:text-zinc-200 transition-colors">
                  Precio{sortIcon('price')}
                </button>
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">
                <button type="button" onClick={() => toggleSort('stock')} className="hover:text-zinc-200 transition-colors">
                  Stock{sortIcon('stock')}
                </button>
              </th>
              <th className="text-center px-4 py-3 font-medium text-zinc-400">Visible</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visible.map((product) => {
              const name = product.name_es
              const isLoading = loadingId === product.id

              return (
                <tr key={product.id}
                  className="hover:bg-white/5 transition-colors">

                  {/* Producto */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#2a1610]
                        flex items-center justify-center shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={name}
                            className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">🥩</span>
                        )}
                      </div>
                      <span className="font-medium text-zinc-100">{name}</span>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {product.categories?.name_es ?? '—'}
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-zinc-300">
                      {product.product_type === 'WEIGHT' ? 'Por kg' : 'Por ud'}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="px-4 py-3 text-right font-medium text-[#E57368]">
                    {Number(product.price).toFixed(2)} €
                    {product.is_on_offer && (
                      <span className="block text-xs text-emerald-400">En oferta</span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className={Number(product.stock_quantity) <= Number(product.stock_threshold)
                      ? 'text-rose-400 font-medium' : 'text-zinc-300'}>
                      {Number(product.stock_quantity)}
                      {product.product_type === 'WEIGHT' ? ' kg' : ' ud'}
                    </span>
                  </td>

                  {/* Visible toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleVisibility(product.id, product.is_visible)}
                      disabled={isLoading}
                      className="text-xl transition-opacity disabled:opacity-50"
                      title={product.is_visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {product.is_visible ? '👁️' : '🙈'}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => router.push(`/${locale}/panel/productos/${product.id}/editar`)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10
                          text-zinc-200 hover:bg-white/5 transition-colors font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, name)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-lg border border-rose-500/30
                          text-rose-400 hover:bg-rose-500/10 transition-colors font-medium
                          disabled:opacity-50"
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

        {visible.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-4xl mb-3">🥩</p>
            <p className="text-base">
              {products.length === 0 ? 'No hay productos todavía' : 'Ningún producto coincide con los filtros'}
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-[#C0392B] text-white border-[#C0392B]'
          : 'bg-[#2a1610] text-zinc-300 border-white/10 hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  )
}
