import Image from 'next/image'
import Link from 'next/link'
import type { Pack } from '@/types/pack'
import AddToCartButton from './AddToCartButton'

type Props = {
  pack: Pack
  locale: string
}

export default function PackCard({ pack, locale }: Props) {
  const name = locale === 'ca' ? pack.name_ca : pack.name_es
  const price = pack.is_on_offer && pack.offer_price ? pack.offer_price : pack.price
  const productCount = pack.pack_products?.length ?? 0

  return (
    <Link
      href={`/${locale}/packs/${pack.slug}`}
      className="group rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 block"
    >
      <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: '14rem' }}>
        {pack.image_url ? (
          <Image
            src={pack.image_url}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <span style={{ fontSize: '5rem', opacity: 0.2 }}>📦</span>
        )}
        {pack.is_on_offer && (
          <span className="absolute top-3 left-3 text-xs px-3 py-1.5 rounded font-semibold text-white" style={{ background: 'var(--color-celeste)' }}>
            Oferta
          </span>
        )}
      </div>

      <div className="p-6 text-center">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 leading-snug">{name}</h3>
        <p className="text-xs text-gray-400 mb-3">{productCount} producto{productCount !== 1 ? 's' : ''}</p>
        <div className="flex flex-col gap-3 items-center">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {Number(price).toFixed(2)} €
            </span>
            {pack.is_on_offer && pack.offer_price && (
              <span className="block text-sm line-through text-gray-400">
                {Number(pack.price).toFixed(2)} €
              </span>
            )}
          </div>
          <AddToCartButton
            productId={pack.id}
            productName={name}
            price={Number(price)}
            productType="UNIT"
            imageUrl={pack.image_url}
          />
        </div>
      </div>
    </Link>
  )
}
