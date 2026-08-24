import type { Product } from '@/types/product'

/**
 * Precio unitario efectivo:
 * - WEIGHT → offer_price si is_on_offer === true, si no price_per_kg
 * - UNIT   → offer_price si is_on_offer === true, si no price
 */
export function effectiveUnitPrice(p: Partial<Product>): number {
  if (p.product_type === 'WEIGHT') {
    if (p.is_on_offer === true && p.offer_price != null) {
      return Number(p.offer_price)
    }
    return Number(p.price_per_kg ?? p.price ?? 0)
  }
  if (p.is_on_offer === true && p.offer_price != null) {
    return Number(p.offer_price)
  }
  return Number(p.price ?? 0)
}
