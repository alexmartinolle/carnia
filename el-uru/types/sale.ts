export type SaleItem = {
  id:                  string
  order_id:            string
  product_id:          string
  product_name:        string
  quantity:            number | null
  estimated_quantity:  number | null
  unit_price:          number
  total:               number
  notes:               string | null
  created_at:          string
  updated_at:          string
}

export type Sale = {
  id:             string
  user_id:        string | null
  guest_name:     string | null
  guest_phone:    string | null
  guest_email:    string | null
  address_id:     string | null
  sale_channel:   'TIENDA' | 'ONLINE'
  delivery_type:  string
  payment_method: string
  payment_status: string
  order_status:   string
  subtotal:       number
  shipping_cost:  number
  discount:       number
  total:          number
  ticket_number:  number | null
  pickup_date:    string | null
  pickup_time:    string | null
  notes:          string | null
  created_at:     string
  updated_at:     string
}

export type SaleWithItems = Sale & {
  order_items: SaleItem[]
}

export type SaleListItem = {
  id: string
  created_at: string
  sale_channel: 'TIENDA' | 'ONLINE'
  order_status: string
  payment_status: string
  guest_name: string | null
  total: number
  ticket_number: number | null
  order_items: { id: string }[]
}
