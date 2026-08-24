import Link             from 'next/link'
import { createClient } from '@/utils/supabase/server'
import CategoriesTable  from '@/components/panel/categories/CategoriesTable'

export default async function AdminCategoriasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase   = await createClient()

  // Categorías con conteo de productos
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name_es,
      name_ca,
      slug,
      sort_order,
      products(count)
    `)
    .order('sort_order', { ascending: true })

  const categoriesWithCount = categories?.map(cat => ({
    ...cat,
    product_count: (cat.products as unknown as { count: number }[])?.[0]?.count ?? 0,
  })) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            {categoriesWithCount.length} categorías en total
          </p>
        </div>
        <Link
          href={`/${locale}/panel/categorias/nueva`}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium
            hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-brand)' }}
        >
          + Nueva categoría
        </Link>
      </div>

      <CategoriesTable
        categories={categoriesWithCount}
        locale={locale}
      />
    </div>
  )
}
