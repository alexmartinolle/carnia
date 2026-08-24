import { z } from 'zod'

export const RawMaterialSchema = z.object({
  name:  z.string().min(2, 'Mínimo 2 caracteres'),
  notes: z.string().nullable(),
})

export const RawBatchSchema = z.object({
  raw_material_id:    z.string().uuid('Selecciona una materia prima'),
  label:              z.string().nullable(),
  supplier:           z.string().nullable(),
  purchase_weight_kg: z.number({ message: 'Introduce un peso válido' }).positive('El peso comprado debe ser mayor que 0'),
  sellable_weight_kg: z.number({ message: 'Introduce un peso válido' }).positive('El peso vendible debe ser mayor que 0'),
  purchase_cost:      z.number({ message: 'Introduce un coste válido' }).nonnegative('El coste no puede ser negativo'),
  received_at:        z.string(),
  notes:              z.string().nullable(),
}).refine((d) => d.sellable_weight_kg <= d.purchase_weight_kg, {
  message: 'El peso vendible no puede superar el comprado',
  path:    ['sellable_weight_kg'],
})

export type RawMaterialInput = z.infer<typeof RawMaterialSchema>
export type RawBatchInput    = z.infer<typeof RawBatchSchema>
