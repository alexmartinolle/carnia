'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  lineId:       string
  productId:    string
  productName:  string
  productType:  'UNIT' | 'WEIGHT'
  imageUrl:     string | null
  unitPrice:    number
  quantity:     number
  notes:        string
}

type CartState = {
  items:      CartItem[]
  customerData: {
    name: string
    phone: string
    email: string
    notes: string
  } | null
  isDelivery: boolean
  deliveryAddress: {
    address: string
    city: string
    postalCode: string
    province: string
  } | null
  addItem:    (item: Omit<CartItem, 'lineId'>) => void
  updateItem: (lineId: string, patch: Partial<Pick<CartItem, 'quantity' | 'notes'>>) => void
  removeItem: (lineId: string) => void
  setCustomerData: (data: { name: string; phone: string; email: string; notes: string }) => void
  setDelivery: (isDelivery: boolean) => void
  setDeliveryAddress: (address: { address: string; city: string; postalCode: string; province: string }) => void
  clear:      () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      customerData: null,
      isDelivery: false,
      deliveryAddress: null,
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { ...item, lineId: crypto.randomUUID() }],
        })),
      updateItem: (lineId, patch) =>
        set((state) => ({
          items: state.items.map((it) =>
            it.lineId === lineId ? { ...it, ...patch } : it
          ),
        })),
      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((it) => it.lineId !== lineId) })),
      setCustomerData: (data) => set({ customerData: data }),
      setDelivery: (isDelivery) => set({ isDelivery }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      clear: () => set({ items: [], customerData: null, isDelivery: false, deliveryAddress: null }),
    }),
    { name: 'eluru-cart' }
  )
)

export function cartItemTotal(item: CartItem): number {
  return Number(item.unitPrice) * Number(item.quantity)
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((s, it) => s + cartItemTotal(it), 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.length
}

export function cartHasEstimated(items: CartItem[]): boolean {
  return items.some((it) => it.productType === 'WEIGHT')
}
