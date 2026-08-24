'use server'
import { createClient }      from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath }    from 'next/cache'
import { ProductFormSchema } from '@/lib/schemas/product.schema'

type ActionResult = {
  success: boolean
  error?:  string
  data?:   unknown
}

// Verificar que el usuario es STAFF
async function requireStaff(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'STAFF'
}

// Crear producto
export async function createProduct(formData: unknown): Promise<ActionResult> {
  console.log('=== createProduct START ===')
  
  const isStaff = await requireStaff()
  console.log('isStaff:', isStaff)
  if (!isStaff) {
    return { success: false, error: 'No autorizado' }
  }

  const result = ProductFormSchema.safeParse(formData)
  console.log('Zod validation:', result.success)
  if (!result.success) {
    console.log('Zod errors:', result.error.issues)
    return { success: false, error: result.error.issues[0].message }
  }

  console.log('Data to insert:', JSON.stringify(result.data, null, 2))

  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...result.data,
      image_url:     result.data.image_url     || null,
      offer_price:   result.data.offer_price   || null,
      offer_ends_at: result.data.offer_ends_at || null,
      price_per_kg:  result.data.price_per_kg  || null,
    })
    .select()

  console.log('Supabase insert error:', error)
  console.log('Supabase insert data:', data)
  console.log('=== createProduct END ===')

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/productos')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}

// Actualizar producto
export async function updateProduct(id: string, formData: unknown): Promise<ActionResult> {
  if (!(await requireStaff())) {
    return { success: false, error: 'No autorizado' }
  }

  const result = ProductFormSchema.safeParse(formData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .update({
      ...data,
      image_url:     data.image_url     || null,
      offer_price:   data.offer_price   || null,
      offer_ends_at: data.offer_ends_at || null,
      price_per_kg:  data.price_per_kg  || null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/productos')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}

// Cambiar visibilidad
export async function toggleProductVisibility(
  id: string,
  isVisible: boolean
): Promise<ActionResult> {
  if (!(await requireStaff())) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ is_visible: isVisible })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/productos')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}

// Eliminar producto
export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await requireStaff())) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/productos')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')

  return { success: true }
}
