import { z } from 'zod'

export const ProductFormSchema = z.object({
  name_es:             z.string().min(2, 'Mínimo 2 caracteres'),
  name_ca:             z.string().min(2, 'Mínimo 2 caracteres'),
  slug:                z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description_es:      z.string(),
  description_ca:      z.string(),
  preparation_tips_es: z.string(),
  preparation_tips_ca: z.string(),
  price:               z.number({ message: 'Introduce un precio válido' }).positive('El precio debe ser mayor que 0'),
  price_per_kg:        z.number().positive().nullable(),
  product_type:        z.enum(['UNIT', 'WEIGHT']),
  category_id:         z.string().uuid('Selecciona una categoría'),
  image_url:           z.string(),
  is_visible:          z.boolean(),
  is_on_offer:         z.boolean(),
  offer_price:         z.number().positive().nullable(),
  offer_ends_at:       z.string(),
  stock_quantity:      z.number().min(0, 'El stock no puede ser negativo'),
  stock_threshold:     z.number().min(0),
  expiry_alert_days:   z.number().int().min(1),
  raw_material_id:     z.string().uuid().nullable().optional(),
  is_available:        z.boolean().optional(),
  unit_cost:           z.number().nonnegative().nullable().optional(),
})

export type ProductFormInput = z.infer<typeof ProductFormSchema>
