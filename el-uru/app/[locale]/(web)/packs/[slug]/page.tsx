import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPackBySlug } from '@/lib/queries/products'
import PackActions from '@/components/web/PackActions'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function PackPage({ params }: Props) {
  const { locale, slug } = await params
  const pack = await getPackBySlug(slug)
  if (!pack) notFound()

  const name = locale === 'ca' ? pack.name_ca : pack.name_es
  const description = locale === 'ca' ? pack.description_ca : pack.description_es
  const price = pack.is_on_offer && pack.offer_price ? pack.offer_price : pack.price

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
        <Link href={`/${locale}`} className="hover:underline">Inicio</Link>
        <span>/</span>
        <Link href={`/${locale}/packs`} className="hover:underline">Packs</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-main)' }}>{name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Columna izquierda: Imagen */}
        <div className="space-y-6">
          <div className="relative rounded-xl overflow-hidden bg-orange-50" style={{ aspectRatio: '1/1' }}>
            {pack.image_url ? (
              <Image
                src={pack.image_url}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize: '8rem', opacity: 0.2 }}>📦</span>
              </div>
            )}
            {pack.is_on_offer && (
              <span className="absolute top-4 left-4 text-sm px-3 py-1.5 rounded font-medium text-white" style={{ background: 'var(--color-brand)' }}>
                Oferta
              </span>
            )}
          </div>
        </div>

        {/* Columna derecha: Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
            {name}
          </h1>

          {/* Descripción */}
          {description && (
            <div className="mb-6 pb-6 border-b" style={{ borderColor: '#f0e8e0' }}>
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {description}
              </p>
            </div>
          )}

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-bold" style={{ color: 'var(--color-celeste)' }}>
              {Number(price).toFixed(2)} €
            </span>
            {pack.is_on_offer && pack.offer_price && (
              <span className="text-xl line-through" style={{ color: 'var(--color-text-muted)' }}>
                {Number(pack.price).toFixed(2)} €
              </span>
            )}
          </div>

          {/* Productos del pack */}
          {pack.pack_products && pack.pack_products.length > 0 && (
            <div className="mb-8 pb-8 border-b" style={{ borderColor: '#f0e8e0' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
                Incluye {pack.pack_products.length} producto{pack.pack_products.length !== 1 ? 's' : ''}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {pack.pack_products.map((pp: any) => {
                  const productName = locale === 'ca' ? pp.products.name_ca : pp.products.name_es
                  return (
                    <Link
                      key={pp.id}
                      href={`/${locale}/productos/${pp.products.slug}`}
                      className="group rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 block"
                    >
                      <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: '8rem' }}>
                        {pp.products.image_url ? (
                          <Image
                            src={pp.products.image_url}
                            alt={productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <span style={{ fontSize: '3rem', opacity: 0.2 }}>🥩</span>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wide leading-snug">{productName}</p>
                        <p className="text-xs text-gray-400 mt-1">{pp.weight} kg</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          <PackActions
            packId={pack.id}
            packName={name}
            price={Number(price)}
            imageUrl={pack.image_url}
          />

          <Link href={`/${locale}/packs`} className="block text-center text-base hover:underline mt-4" style={{ color: 'var(--color-text-muted)' }}>
            ← Volver a packs
          </Link>
        </div>
      </div>
    </div>
  )
}
