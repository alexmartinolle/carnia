'use client'
import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import { deleteCategory } from '@/lib/actions/categories.actions'

type Category = {
  id:         string
  name_es:    string
  name_ca:    string
  slug:       string
  sort_order: number
  product_count?: number
}

type Props = {
  categories: Category[]
  locale:     string
}

export default function CategoriesTable({ categories, locale }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error,     setError]     = useState('')

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return
    setLoadingId(id)
    setError('')

    const result = await deleteCategory(id)
    if (!result.success) {
      setError(result.error ?? 'Error al eliminar')
    }

    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300
          px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#1f100a] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Orden</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Nombre ES</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">Nombre CA</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400 hidden md:table-cell">Slug</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Productos</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                  {cat.sort_order}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-100">
                  {cat.name_es}
                </td>
                <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                  {cat.name_ca}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-zinc-300 font-mono">
                    {cat.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-zinc-300">
                  {cat.product_count ?? 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => router.push(`/${locale}/panel/categorias/${cat.id}/editar`)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10
                        text-zinc-200 hover:bg-white/5 transition-colors font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name_es)}
                      disabled={loadingId === cat.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-rose-500/30
                        text-rose-400 hover:bg-rose-500/10 transition-colors font-medium
                        disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-3xl mb-2">📋</p>
            <p>No hay categorías todavía</p>
          </div>
        )}
      </div>
    </div>
  )
}
