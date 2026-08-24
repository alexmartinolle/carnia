'use server'
import { createClient }      from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath }    from 'next/cache'
import { RawMaterialSchema, RawBatchSchema } from '@/lib/schemas/inventory.schema'

type ActionResult<T = unknown> = {
  success: boolean
  error?:  string
  data?:   T
}

async function requireStaff(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role === 'STAFF'
}

function revalidateInventory() {
  revalidatePath('/panel/stock')
  revalidatePath('/panel/productos')
}

// ===== Materia prima ==================================================
export async function createRawMaterial(formData: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const result = RawMaterialSchema.safeParse(formData)
  if (!result.success) return { success: false, error: result.error.issues[0].message }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('raw_materials')
    .insert({ name: result.data.name, notes: result.data.notes || null })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidateInventory()
  return { success: true, data: { id: data.id } }
}

export async function updateRawMaterial(id: string, formData: unknown): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const result = RawMaterialSchema.safeParse(formData)
  if (!result.success) return { success: false, error: result.error.issues[0].message }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('raw_materials')
    .update({ name: result.data.name, notes: result.data.notes || null })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateInventory()
  return { success: true }
}

export async function deleteRawMaterial(id: string): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('raw_materials').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateInventory()
  return { success: true }
}

// ===== Lotes de compra ================================================
export async function createRawBatch(formData: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const result = RawBatchSchema.safeParse(formData)
  if (!result.success) return { success: false, error: result.error.issues[0].message }

  const d = result.data
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('raw_batches')
    .insert({
      raw_material_id:    d.raw_material_id,
      label:              d.label || null,
      supplier:           d.supplier || null,
      purchase_weight_kg: d.purchase_weight_kg,
      sellable_weight_kg: d.sellable_weight_kg,
      purchase_cost:      d.purchase_cost,
      received_at:        d.received_at || new Date().toISOString(),
      notes:              d.notes || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidateInventory()
  return { success: true, data: { id: data.id } }
}

export async function updateRawBatch(id: string, formData: unknown): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const result = RawBatchSchema.safeParse(formData)
  if (!result.success) return { success: false, error: result.error.issues[0].message }

  const d = result.data
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('raw_batches')
    .update({
      raw_material_id:    d.raw_material_id,
      label:              d.label || null,
      supplier:           d.supplier || null,
      purchase_weight_kg: d.purchase_weight_kg,
      sellable_weight_kg: d.sellable_weight_kg,
      purchase_cost:      d.purchase_cost,
      received_at:        d.received_at || undefined,
      notes:              d.notes || null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateInventory()
  return { success: true }
}

export async function setBatchStatus(id: string, status: 'active' | 'depleted'): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('raw_batches').update({ status }).eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateInventory()
  return { success: true }
}

export async function deleteRawBatch(id: string): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('raw_batches').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidateInventory()
  return { success: true }
}

// ===== Disponibilidad de producto =====================================
export async function toggleProductAvailability(id: string, isAvailable: boolean): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/productos')
  revalidatePath('/panel/stock')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')
  return { success: true }
}

// Marca disponibles/no disponibles todos los cortes de una materia prima
// (ej. al agotar la pieza). Un solo UPDATE, sin trabajo por fila.
export async function setAvailabilityByRawMaterial(rawMaterialId: string, isAvailable: boolean): Promise<ActionResult> {
  if (!(await requireStaff())) return { success: false, error: 'No autorizado' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('raw_material_id', rawMaterialId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/productos')
  revalidatePath('/panel/stock')
  revalidatePath('/es/productos')
  revalidatePath('/ca/productos')
  return { success: true }
}
