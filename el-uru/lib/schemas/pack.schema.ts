import { z } from 'zod'

export const PackProductSchema = z.object({
  product_id: z.string().uuid('Selecciona un producto'),
  weight: z.number().positive('El peso debe ser mayor que 0'),
  unit_price: z.number().positive().optional(),
  total: z.number().positive().optional(),
})

export const PackFormSchema = z.object({
  name_es: z.string().min(2, 'Mínimo 2 caracteres'),
  name_ca: z.string().min(2, 'Mínimo 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description_es: z.string(),
  description_ca: z.string(),
  price: z.number({ message: 'Introduce un precio válido' }).positive('El precio debe ser mayor que 0'),
  image_url: z.string(),
  is_visible: z.boolean(),
  is_on_offer: z.boolean(),
  offer_price: z.number().positive().nullable(),
  offer_ends_at: z.string(),
  products: z.array(PackProductSchema).min(1, 'Añade al menos un producto'),
})

export type PackFormInput = z.infer<typeof PackFormSchema>
