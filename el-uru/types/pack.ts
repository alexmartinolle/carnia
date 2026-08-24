export type PackProduct = {
  id: string
  pack_id: string
  product_id: string
  weight: number
  created_at: string
  products: {
    id: string
    name_es: string
    name_ca: string
    slug: string
  }
}

export type Pack = {
  id: string
  name_es: string
  name_ca: string
  slug: string
  description_es: string | null
  description_ca: string | null
  price: number
  image_url: string | null
  is_visible: boolean
  is_on_offer: boolean
  offer_price: number | null
  offer_ends_at: string | null
  created_at: string
  updated_at: string
  pack_products: PackProduct[]
}

export type PackWithProducts = Pack & {
  pack_products: PackProduct[]
}
