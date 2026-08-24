import { createClient } from '@/utils/supabase/server'
import PackForm from '@/components/panel/packs/PackForm'

export default async function NewPackPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .order('name_es')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo pack</h1>
      <PackForm
        products={products ?? []}
        locale={locale}
      />
    </div>
  )
}
