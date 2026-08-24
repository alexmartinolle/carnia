import { createClient } from '@/utils/supabase/server'
import ProductForm      from '@/components/panel/products/ProductForm'
import { notFound }     from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const supabase       = await createClient()

  const [{ data: product }, { data: categories }, { data: rawMaterials }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(id, name_es, name_ca, slug, sort_order)')
      .eq('id', id)
      .single(),
    supabase
      .from('categories')
      .select('*')
      .order('sort_order'),
    supabase
      .from('raw_materials')
      .select('*')
      .order('name'),
  ])

  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>
      <ProductForm
        categories={categories ?? []}
        rawMaterials={rawMaterials ?? []}
        product={product}
        locale={locale}
      />
    </div>
  )
}
