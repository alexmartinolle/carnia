'use server'
import { createClient }      from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath }    from 'next/cache'
import { PackFormSchema }    from '@/lib/schemas/pack.schema'

type ActionResult = {
  success: boolean
  error?:  string
  data?:   unknown
}

async function requireStaff(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'STAFF'
}

export async function createPack(formData: unknown): Promise<ActionResult> {
  const isStaff = await requireStaff()
  if (!isStaff) {
    return { success: false, error: 'No autorizado' }
  }

  const result = PackFormSchema.safeParse(formData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { products, ...packData } = result.data
  const supabase = createAdminClient()

  const { data: pack, error: packError } = await supabase
    .from('packs')
    .insert({
      ...packData,
      image_url:     packData.image_url     || null,
      offer_price:   packData.offer_price   || null,
      offer_ends_at: packData.offer_ends_at || null,
    })
    .select()
    .single()

  if (packError) return { success: false, error: packError.message }

  const packProducts = products.map(p => ({
    pack_id: pack.id,
    product_id: p.product_id,
    weight: p.weight,
  }))

  const { error: productsError } = await supabase
    .from('pack_products')
    .insert(packProducts)

  if (productsError) return { success: false, error: productsError.message }

  revalidatePath('/panel/packs')
  revalidatePath('/es/packs')
  revalidatePath('/ca/packs')

  return { success: true }
}

export async function updatePack(id: string, formData: unknown): Promise<ActionResult> {
  if (!(await requireStaff())) {
    return { success: false, error: 'No autorizado' }
  }

  const result = PackFormSchema.safeParse(formData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { products, ...packData } = result.data
  const supabase = createAdminClient()

  const { error: packError } = await supabase
    .from('packs')
    .update({
      ...packData,
      image_url:     packData.image_url     || null,
      offer_price:   packData.offer_price   || null,
      offer_ends_at: packData.offer_ends_at || null,
    })
    .eq('id', id)

  if (packError) return { success: false, error: packError.message }

  await supabase
    .from('pack_products')
    .delete()
    .eq('pack_id', id)

  const packProducts = products.map(p => ({
    pack_id: id,
    product_id: p.product_id,
    weight: p.weight,
  }))

  const { error: productsError } = await supabase
    .from('pack_products')
    .insert(packProducts)

  if (productsError) return { success: false, error: productsError.message }

  revalidatePath('/panel/packs')
  revalidatePath('/es/packs')
  revalidatePath('/ca/packs')

  return { success: true }
}

export async function togglePackVisibility(
  id: string,
  isVisible: boolean
): Promise<ActionResult> {
  if (!(await requireStaff())) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('packs')
    .update({ is_visible: isVisible })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/packs')
  revalidatePath('/es/packs')
  revalidatePath('/ca/packs')

  return { success: true }
}

export async function deletePack(id: string): Promise<ActionResult> {
  if (!(await requireStaff())) {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('packs')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/packs')
  revalidatePath('/es/packs')
  revalidatePath('/ca/packs')

  return { success: true }
}
