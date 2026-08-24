import { createClient } from '@/utils/supabase/server'
import ProductForm      from '@/components/panel/products/ProductForm'

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase   = await createClient()

  const [{ data: categories }, { data: rawMaterials }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('raw_materials').select('*').order('name'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo producto</h1>
      <ProductForm
        categories={categories ?? []}
        rawMaterials={rawMaterials ?? []}
        locale={locale}
      />
    </div>
  )
}
