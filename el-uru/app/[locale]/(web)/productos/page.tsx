import Link from 'next/link'
import ProductCard    from '@/components/web/ProductCard'
import ProductsHero   from '@/components/web/ProductsHero'
import { getProducts, getCategories } from '@/lib/queries/products'

export const revalidate = 3600

type Props = {
  params:      Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string }>
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale }     = await params
  const { cat }        = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(cat),
    getCategories(),
  ])

  const title = cat
    ? categories.find(c => c.slug === cat)?.name_es ?? 'Productos'
    : 'Todos los productos'

  return (
    <>
      <ProductsHero title={title} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-base mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Los mejores cortes Argentinos y Uruguayos
        </p>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link href={`/${locale}/productos`}
          className="px-5 py-2.5 rounded text-sm font-medium transition-all hover:bg-gray-200"
          style={!cat
            ? { background: '#1a1a1a', color: '#fff' }
            : { background: '#f5f5f5', color: '#1a1a1a' }}>
          Todos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${locale}/productos?cat=${category.slug}`}
            className="px-5 py-2.5 rounded text-sm font-medium transition-all hover:bg-gray-200"
            style={cat === category.slug
              ? { background: '#1a1a1a', color: '#fff' }
              : { background: '#f5f5f5', color: '#1a1a1a' }}>
            {locale === 'ca' ? category.name_ca : category.name_es}
          </Link>
        ))}
      </div>

      {/* Grid productos */}
      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-6xl mb-4">🥩</p>
          <p className="text-lg">No hay productos en esta categoría</p>
          <Link href={`/${locale}/productos`}
            className="inline-block mt-4 text-base hover:underline"
            style={{ color: 'var(--color-brand)' }}>
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
    </>
  )
}
