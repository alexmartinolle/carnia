import { createClient } from '@/utils/supabase/server'
import CategoryForm     from '@/components/panel/categories/CategoryForm'

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase   = await createClient()

  const { count } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nueva categoría</h1>
      <CategoryForm
        locale={locale}
        nextOrder={(count ?? 0) + 1}
      />
    </div>
  )
}
