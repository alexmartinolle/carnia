import Image from 'next/image'
import Link  from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/queries/products'
import ProductActions from '@/components/web/ProductActions'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const name        = locale === 'ca' ? product.name_ca        : product.name_es
  const description = locale === 'ca' ? product.description_ca : product.description_es
  const priceUnit   = product.product_type === 'WEIGHT' ? 'kg' : 'ud'
  const price       = product.is_on_offer && product.offer_price
    ? product.offer_price
    : product.price

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8"
        style={{ color: 'var(--color-text-muted)' }}>
        <Link href={`/${locale}`} className="hover:underline">Inicio</Link>
        <span>/</span>
        <Link href={`/${locale}/productos`} className="hover:underline">Productos</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main)' }}>{name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Columna izquierda: Imagen */}
        <div className="space-y-6">
          <div className="relative rounded-xl overflow-hidden bg-orange-50"
            style={{ aspectRatio: '1/1' }}>
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize: '8rem', opacity: 0.2 }}>🥩</span>
              </div>
            )}
            {product.is_on_offer && (
              <span className="absolute top-4 left-4 text-sm px-3 py-1.5 rounded font-medium text-white"
                style={{ background: 'var(--color-brand)' }}>
                Oferta
              </span>
            )}
          </div>

          {/* Consejos de preparación - desktop (debajo de imagen) */}
          {(() => {
            const tips = locale === 'ca'
              ? product.preparation_tips_ca
              : product.preparation_tips_es
            return tips ? (
              <div className="hidden md:block rounded-xl p-5"
                style={{ background: 'var(--color-warm-bg)', border: '0.5px solid var(--color-warm-border)' }}>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: 'var(--color-text-main)' }}>
                  👨‍🍳 Consejos de preparación
                </p>
                <p className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {tips}
                </p>
              </div>
            ) : null
          })()}
        </div>

        {/* Columna derecha: Info */}
        <div className="flex flex-col">
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {product.categories?.name_es}
          </p>
          <h1 className="text-4xl font-bold mb-4"
            style={{ color: 'var(--color-text-main)' }}>
            {name}
          </h1>

          {/* Descripción */}
          {description && (
            <div className="mb-6 pb-6 border-b" style={{ borderColor: '#f0e8e0' }}>
              <p className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}>
                {description}
              </p>
            </div>
          )}

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-bold"
              style={{ color: 'var(--color-celeste)' }}>
              {Number(price).toFixed(2)} €
            </span>
            <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              por {priceUnit}
            </span>
            {product.is_on_offer && product.offer_price && (
              <span className="text-xl line-through"
                style={{ color: 'var(--color-text-muted)' }}>
                {Number(product.price).toFixed(2)} €
              </span>
            )}
          </div>

          <ProductActions
            productId={product.id}
            productType={product.product_type}
            productName={name}
            price={Number(price)}
            priceUnit={priceUnit}
            imageUrl={product.image_url}
          />

          <Link href={`/${locale}/productos`}
            className="block text-center text-base hover:underline mt-4"
            style={{ color: 'var(--color-text-muted)' }}>
            ← Volver al catálogo
          </Link>
        </div>
      </div>

      {/* Consejos de preparación - móvil (abajo del todo) */}
      {(() => {
        const tips = locale === 'ca'
          ? product.preparation_tips_ca
          : product.preparation_tips_es
        return tips ? (
          <div className="md:hidden mt-8 rounded-xl p-5"
            style={{ background: 'var(--color-warm-bg)', border: '0.5px solid var(--color-warm-border)' }}>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-text-main)' }}>
              👨‍🍳 Consejos de preparación
            </p>
            <p className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}>
              {tips}
            </p>
          </div>
        ) : null
      })()}
    </div>
  )
}
