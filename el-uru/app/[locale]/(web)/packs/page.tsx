import PackCard from '@/components/web/PackCard'
import PacksHero from '@/components/web/PacksHero'
import { getPacks } from '@/lib/queries/products'

export const revalidate = 3600

type Props = {
  params: Promise<{ locale: string }>
}

export default async function PacksPage({ params }: Props) {
  const { locale } = await params
  const packs = await getPacks()

  return (
    <>
      <PacksHero title="Packs" />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-base mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Combina tus cortes favoritos
        </p>
        {packs.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-lg">No hay packs disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
