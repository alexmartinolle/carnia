import Image    from 'next/image'
import Link     from 'next/link'
import type { Product } from '@/types/product'
import AddToCartButton  from './AddToCartButton'

type Props = {
  product: Product
  locale:  string
}

export default function ProductCard({ product, locale }: Props) {
  const name      = locale === 'ca' ? product.name_ca : product.name_es
  const priceUnit = product.product_type === 'WEIGHT' ? 'kg' : 'ud'
  const price     = product.is_on_offer && product.offer_price
    ? product.offer_price
    : product.price

  return (
    <Link
      href={`/${locale}/productos/${product.slug}`}
      className="group rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 block"
    >
      {/* Imagen */}
      <div className="relative bg-gray-50 flex items-center justify-center"
        style={{ height: '14rem' }}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <span style={{ fontSize: '5rem', opacity: 0.2 }}>🥩</span>
        )}
        {product.is_on_offer && (
          <span className="absolute top-3 left-3 text-xs px-3 py-1.5
            rounded font-semibold text-white"
            style={{ background: 'var(--color-celeste)' }}>
            Oferta
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-6 text-center">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 leading-snug">
          {name}
        </h3>
        <div className="flex flex-col gap-3 items-center">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {Number(price).toFixed(2)} €
            </span>
            {product.is_on_offer && product.offer_price && (
              <span className="block text-sm line-through text-gray-400">
                {Number(product.price).toFixed(2)} €
              </span>
            )}
          </div>
          <AddToCartButton
            productId={product.id}
            productName={name}
            price={Number(price)}
            productType={product.product_type}
            imageUrl={product.image_url}
          />
        </div>
      </div>
    </Link>
  )
}
