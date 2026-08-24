'use client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useCart, cartSubtotal, cartHasEstimated, cartItemTotal } from '@/lib/cart/store'
import { createOnlineOrder, createOnlineOrderPayNow } from '@/lib/actions/orders.actions'
import { useState } from 'react'
import { CreditCard, Store, Lock } from 'lucide-react'

export default function PaymentPage() {
  const router = useRouter()
  const locale = useLocale()
  const items = useCart((s) => s.items)
  const customerData = useCart((s) => s.customerData)
  const isDelivery = useCart((s) => s.isDelivery)
  const deliveryAddress = useCart((s) => s.deliveryAddress)
  const clearCart = useCart((s) => s.clear)
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')

  const subtotal = cartSubtotal(items)
  const shippingCost = isDelivery ? 5 : 0
  const total = subtotal + shippingCost

  async function handlePayInStore() {
    if (!customerData) {
      router.push(`/${locale}/checkout`)
      return
    }
    if (isDelivery) {
      setError('El envío a domicilio requiere pago online con tarjeta')
      return
    }
    setLoading('store')
    setError('')
    const res = await createOnlineOrder({
      guest_name: customerData.name,
      guest_phone: customerData.phone,
      guest_email: customerData.email,
      notes: customerData.notes || null,
      is_delivery: false,
      delivery_address: null,
      items: items.map((it) => ({
        product_id: it.productId,
        quantity: it.quantity,
        notes: it.notes || null,
      })),
    })
    if (!res.success || !res.data) {
      setError(res.error || 'Error al crear el pedido')
      setLoading('')
      return
    }
    clearCart()
    router.push(`/${locale}/pedido/${res.data.id}`)
  }

  async function handlePayNow() {
    if (!customerData) {
      router.push(`/${locale}/checkout`)
      return
    }
    if (isDelivery && !deliveryAddress) {
      router.push(`/${locale}/envio`)
      return
    }
    setLoading('now')
    setError('')
    const res = await createOnlineOrderPayNow({
      guest_name: customerData.name,
      guest_phone: customerData.phone,
      guest_email: customerData.email,
      notes: customerData.notes || null,
      is_delivery: isDelivery,
      delivery_address: isDelivery && deliveryAddress ? {
        address: deliveryAddress.address,
        city: deliveryAddress.city,
        postal_code: deliveryAddress.postalCode,
        province: deliveryAddress.province,
      } : null,
      items: items.map((it) => ({
        product_id: it.productId,
        quantity: it.quantity,
        notes: it.notes || null,
      })),
    })
    if (!res.success || !res.data) {
      setError(res.error || 'Error al crear el pedido')
      setLoading('')
      return
    }
    clearCart()
    router.push(`/${locale}/pedido/${res.data.id}`)
  }

  if (items.length === 0) {
    router.push(`/${locale}/carrito`)
    return null
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>
          Método de pago
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Selecciona cómo quieres pagar tu pedido
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Opciones de pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pagar en tienda - solo si no es envío */}
        {!isDelivery && (
          <button
            onClick={handlePayInStore}
            disabled={loading !== ''}
            className="bg-white border rounded-2xl p-6 text-left hover:shadow-lg transition-all disabled:opacity-50"
            style={{ borderColor: '#e5e7eb' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Store className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>
                  Pagar en tienda
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Al recoger el pedido
                </p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Paga en efectivo o con tarjeta cuando vengas a recoger tu pedido a Carnicería El Uru.
            </p>
            {loading === 'store' && (
              <p className="text-sm mt-3 font-medium" style={{ color: 'var(--color-brand)' }}>
                Procesando...
              </p>
            )}
          </button>
        )}

        {/* Pagar ahora */}
        <button
          onClick={handlePayNow}
          disabled={loading !== ''}
          className="bg-white border rounded-2xl p-6 text-left hover:shadow-lg transition-all disabled:opacity-50"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>
                Pagar ahora
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Tarjeta online
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {isDelivery
              ? 'El envío a domicilio requiere pago online con tarjeta. Tu pedido será entregado en la dirección indicada.'
              : 'Paga de forma segura con tarjeta. Tu pedido quedará confirmado y listo para recoger.'}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Lock className="w-3 h-3" />
            Pago seguro con Redsys
          </div>
          {loading === 'now' && (
            <p className="text-sm mt-3 font-medium" style={{ color: 'var(--color-brand)' }}>
              Procesando...
            </p>
          )}
        </button>
      </div>

      {/* Resumen */}
      <div className="bg-white border rounded-2xl p-6" style={{ borderColor: '#e5e7eb' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
          Resumen del pedido
        </h2>
        <ul className="space-y-2 text-sm mb-4" style={{ color: 'var(--color-text-main)' }}>
          {items.map((it) => (
            <li key={it.lineId} className="flex justify-between gap-2">
              <span className="truncate">
                {it.productName}
                <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                  × {it.quantity}{it.productType === 'WEIGHT' ? 'kg' : 'ud'}
                </span>
              </span>
              <span className="shrink-0">{cartItemTotal(it).toFixed(2)} €</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-3 flex justify-between font-bold text-lg"
          style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}>
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
        {isDelivery && (
          <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
        )}
        {isDelivery && (
          <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span>Envío</span>
            <span>{shippingCost.toFixed(2)} €</span>
          </div>
        )}
      </div>

      <button
        onClick={() => router.back()}
        className="block text-center text-base hover:underline w-full"
        style={{ color: 'var(--color-text-muted)' }}
      >
        ← Volver
      </button>
    </div>
  )
}
