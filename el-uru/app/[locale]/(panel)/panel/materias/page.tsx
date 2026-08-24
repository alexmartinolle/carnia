import { createClient }       from '@/utils/supabase/server'
import RawMaterialsManager    from '@/components/panel/inventory/RawMaterialsManager'
import type { RawMaterial, RawBatch } from '@/types/inventory'

export default async function RawMaterialsPage() {
  const supabase = await createClient()

  const { data: materials } = await supabase
    .from('raw_materials')
    .select('*, raw_batches(*)')
    .order('name')

  const list = (materials ?? []) as Array<RawMaterial & { raw_batches: RawBatch[] }>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Materias primas</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Piezas que compras y lotes de recepción. El coste medio por kg se calcula desde los lotes activos.
        </p>
      </div>

      <RawMaterialsManager materials={list} />
    </div>
  )
}
