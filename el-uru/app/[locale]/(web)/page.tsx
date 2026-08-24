import Link from 'next/link'
import HeroSlider      from '@/components/web/HeroSlider'
import InfoBar         from '@/components/web/InfoBar'
import ProductCard     from '@/components/web/ProductCard'
import QualitySection  from '@/components/web/QualitySection'
import FindUsSection   from '@/components/web/FindUsSection'
import InstagramSection from '@/components/web/InstagramSection'
import { getFeaturedProducts } from '@/lib/queries/products'

export const revalidate = 3600 // Revalidar cada hora

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale }  = await params
  const products    = await getFeaturedProducts()

  return (
    <>
      <HeroSlider />
      <InfoBar />

      <div className="bg-white">

        {/* Productos destacados */}
        <section className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-3xl font-semibold"
              style={{ color: 'var(--color-text-main)' }}>
              Productos destacados
            </h2>
            <Link href={`/${locale}/productos`}
              className="text-base hover:underline"
              style={{ color: 'var(--color-brand)' }}>
              Ver todos →
            </Link>
          </div>
          <p className="text-base mb-8"
            style={{ color: 'var(--color-text-muted)' }}>
            Selección del día
          </p>

          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🥩</p>
              <p>Productos disponibles próximamente</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </section>

        <QualitySection />

        <FindUsSection />

        <InstagramSection />

      </div>
    </>
  )
}
