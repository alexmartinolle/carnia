import { createClient } from '@/utils/supabase/server'
import PackForm from '@/components/panel/packs/PackForm'
import { notFound } from 'next/navigation'

export default async function EditPackPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const supabase = await createClient()

  const [{ data: pack }, { data: products }] = await Promise.all([
    supabase
      .from('packs')
      .select('*, pack_products(*, products(id, name_es, name_ca, slug))')
      .eq('id', id)
      .single(),
    supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .order('name_es'),
  ])

  if (!pack) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar pack</h1>
      <PackForm
        products={products ?? []}
        pack={pack}
        locale={locale}
      />
    </div>
  )
}
