import { createClient } from '@/utils/supabase/server'
import CategoryForm     from '@/components/panel/categories/CategoryForm'
import { notFound }     from 'next/navigation'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const supabase       = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!category) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar categoría</h1>
      <CategoryForm
        category={category}
        locale={locale}
        nextOrder={category.sort_order}
      />
    </div>
  )
}
