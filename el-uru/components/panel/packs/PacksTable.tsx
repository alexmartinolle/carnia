'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { togglePackVisibility, deletePack } from '@/lib/actions/packs.actions'
import type { Pack } from '@/types/pack'

type Props = {
  packs: Pack[]
  locale: string
}

type SortKey = 'name' | 'price' | 'created'
type SortDir = 'asc' | 'desc'

export default function PacksTable({ packs, locale }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [onlyOffer, setOnlyOffer] = useState(false)
  const [onlyHidden, setOnlyHidden] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = packs.filter(p => {
      if (q && !p.name_es.toLowerCase().includes(q) && !p.name_ca.toLowerCase().includes(q)) return false
      if (onlyOffer && !p.is_on_offer) return false
      if (onlyHidden && p.is_visible) return false
      return true
    })

    const dir = sortDir === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'name': return a.name_es.localeCompare(b.name_es, 'es') * dir
        case 'price': return (Number(a.price) - Number(b.price)) * dir
        case 'created': return (new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()) * dir
      }
    })
    return filtered
  }, [packs, search, onlyOffer, onlyHidden, sortKey, sortDir])

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
    await togglePackVisibility(id, !current)
    setLoadingId(null)
    router.refresh()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setLoadingId(id)
    await deletePack(id)
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="bg-[#1f100a] border border-white/5 rounded-xl p-3 flex flex-wrap items-center gap-2 text-sm">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 min-w-[180px] bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]"
        />
        <ToggleChip active={onlyOffer} onClick={() => setOnlyOffer(v => !v)}>En oferta</ToggleChip>
        <ToggleChip active={onlyHidden} onClick={() => setOnlyHidden(v => !v)}>Ocultos</ToggleChip>
        <span className="text-xs text-zinc-500 ml-auto">{visible.length} de {packs.length}</span>
      </div>

      <div className="bg-[#1f100a] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="text-left px-4 py-3 font-medium text-zinc-400">
                  <button type="button" onClick={() => toggleSort('name')} className="hover:text-zinc-200 transition-colors">
                    Pack{sortIcon('name')}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">Productos</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-400">
                  <button type="button" onClick={() => toggleSort('price')} className="hover:text-zinc-200 transition-colors">
                    Precio{sortIcon('price')}
                  </button>
                </th>
                <th className="text-center px-4 py-3 font-medium text-zinc-400">Visible</th>
                <th className="text-center px-4 py-3 font-medium text-zinc-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.map((pack) => {
                const name = pack.name_es
                const isLoading = loadingId === pack.id
                const productCount = pack.pack_products?.length ?? 0

                return (
                  <tr key={pack.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#2a1610] flex items-center justify-center shrink-0">
                          {pack.image_url ? (
                            <img src={pack.image_url} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <span className="font-medium text-zinc-100">{name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                      {productCount} producto{productCount !== 1 ? 's' : ''}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-[#E57368]">
                      {Number(pack.price).toFixed(2)} €
                      {pack.is_on_offer && (
                        <span className="block text-xs text-emerald-400">En oferta</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleVisibility(pack.id, pack.is_visible)}
                        disabled={isLoading}
                        className="text-xl transition-opacity disabled:opacity-50"
                        title={pack.is_visible ? 'Ocultar' : 'Mostrar'}
                      >
                        {pack.is_visible ? '👁️' : '🙈'}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/${locale}/panel/packs/${pack.id}/editar`)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-zinc-200 hover:bg-white/5 transition-colors font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pack.id, name)}
                          disabled={isLoading}
                          className="text-xs px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors font-medium disabled:opacity-50"
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
              <p className="text-4xl mb-3">📦</p>
              <p className="text-base">
                {packs.length === 0 ? 'No hay packs todavía' : 'Ningún pack coincide con los filtros'}
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
