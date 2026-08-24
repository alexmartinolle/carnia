'use server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath }    from 'next/cache'
import { z }                 from 'zod'

const CategorySchema = z.object({
  name_es:    z.string().min(2, 'Mínimo 2 caracteres'),
  name_ca:    z.string().min(2, 'Mínimo 2 caracteres'),
  slug:       z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  sort_order: z.number().int().min(0).default(0),
})

type ActionResult = {
  success: boolean
  error?:  string
}

export async function createCategory(formData: unknown): Promise<ActionResult> {
  const result = CategorySchema.safeParse(formData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('categories')
    .insert(result.data)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/categorias')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}

export async function updateCategory(
  id: string,
  formData: unknown
): Promise<ActionResult> {
  const result = CategorySchema.safeParse(formData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('categories')
    .update(result.data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/categorias')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  // Verificar que no tiene productos asociados
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    return {
      success: false,
      error:   `No se puede eliminar: tiene ${count} producto${count > 1 ? 's' : ''} asociado${count > 1 ? 's' : ''}`,
    }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/categorias')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}

export async function updateCategoryOrder(
  items: { id: string; sort_order: number }[]
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const updates = items.map(({ id, sort_order }) =>
    supabase
      .from('categories')
      .update({ sort_order })
      .eq('id', id)
  )

  await Promise.all(updates)

  revalidatePath('/panel/categorias')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}
