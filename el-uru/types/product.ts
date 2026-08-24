export type Category = {
  id:         string
  name_es:    string
  name_ca:    string
  slug:       string
  sort_order: number
}

export type Product = {
  id:               string
  name_es:          string
  name_ca:          string
  slug:             string
  description_es:     string | null
  description_ca:     string | null
  preparation_tips_es: string | null
  preparation_tips_ca: string | null
  price:              number
  price_per_kg:     number | null
  product_type:     'UNIT' | 'WEIGHT'
  category_id:      string
  image_url:        string | null
  is_visible:       boolean
  is_on_offer:      boolean
  offer_price:      number | null
  offer_ends_at:    string | null
  stock_quantity:   number
  stock_threshold:  number
  expiry_alert_days: number | null
  expires_at:       string | null
  raw_material_id:  string | null
  is_available:     boolean
  unit_cost:        number | null
  created_at:       string
  updated_at:       string
  categories:       Category | null
}

export type ProductWithCategory = Product & {
  categories: Category
}
