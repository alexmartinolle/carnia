import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import PacksTable from '@/components/panel/packs/PacksTable'

export default async function AdminPacksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: packs } = await supabase
    .from('packs')
    .select('*, pack_products(*, products(id, name_es, name_ca, slug))')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Packs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {packs?.length ?? 0} packs en total
          </p>
        </div>
        <Link
          href={`/${locale}/panel/packs/nuevo`}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium
            hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-brand)' }}
        >
          + Nuevo pack
        </Link>
      </div>

      <PacksTable
        packs={packs ?? []}
        locale={locale}
      />
    </div>
  )
}
