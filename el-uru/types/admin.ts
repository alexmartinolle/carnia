export type ProductFormData = {
  name_es:              string
  name_ca:              string
  slug:                 string
  description_es:       string
  description_ca:       string
  preparation_tips_es:  string
  preparation_tips_ca:  string
  price:                number
  price_per_kg:         number | null
  product_type:         'UNIT' | 'WEIGHT'
  category_id:          string
  image_url:            string
  is_visible:           boolean
  is_on_offer:          boolean
  offer_price:          number | null
  offer_ends_at:        string
  stock_quantity:       number
  stock_threshold:      number
  expiry_alert_days:    number
}
