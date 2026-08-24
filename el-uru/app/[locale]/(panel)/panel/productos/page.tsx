import Link             from 'next/link'
import { createClient } from '@/utils/supabase/server'
import ProductsTable    from '@/components/panel/products/ProductsTable'

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase   = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(id, name_es, name_ca, slug, sort_order)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products?.length ?? 0} productos en total
          </p>
        </div>
        <Link
          href={`/${locale}/panel/productos/nuevo`}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium
            hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-brand)' }}
        >
          + Nuevo producto
        </Link>
      </div>

      <ProductsTable
        products={products ?? []}
        locale={locale}
      />
    </div>
  )
}
