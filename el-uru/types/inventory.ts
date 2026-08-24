export type RawMaterial = {
  id:              string
  name:            string
  notes:           string | null
  avg_cost_per_kg: number
  created_at:      string
  updated_at:      string
}

export type BatchStatus = 'active' | 'depleted'

export type RawBatch = {
  id:                 string
  raw_material_id:    string
  label:              string | null
  supplier:           string | null
  purchase_weight_kg: number
  sellable_weight_kg: number
  purchase_cost:      number
  status:             BatchStatus
  received_at:        string
  notes:              string | null
  created_at:         string
  updated_at:         string
  raw_materials?:     RawMaterial | null
}
