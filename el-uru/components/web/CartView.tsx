'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart, cartSubtotal, cartHasEstimated, cartItemTotal, type CartItem } from '@/lib/cart/store'

export default function CartView({ locale }: { locale: string }) {
  const items      = useCart((s) => s.items)
  const updateItem = useCart((s) => s.updateItem)
  const removeItem = useCart((s) => s.removeItem)
  const clear      = useCart((s) => s.clear)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <p style={{ color: 'var(--color-text-muted)' }}>Cargando…</p>
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Tu carrito está vacío.
        </p>
        <Link href={`/${locale}/productos`}
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold hover:bg-gray-800 transition-colors"
          style={{ background: '#1a1a1a' }}>
          Ver productos
        </Link>
      </div>
    )
  }

  const subtotal   = cartSubtotal(items)
  const hasEstim   = cartHasEstimated(items)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Lista de líneas */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((it) => (
          <CartLine key={it.lineId} item={it}
            onChange={(patch) => updateItem(it.lineId, patch)}
            onRemove={() => removeItem(it.lineId)} />
        ))}

        <button onClick={clear}
          className="text-sm hover:underline"
          style={{ color: 'var(--color-text-muted)' }}>
          Vaciar carrito
        </button>
      </div>

      {/* Resumen */}
      <aside className="bg-white border rounded-2xl p-6 h-fit space-y-4"
        style={{ borderColor: '#e5e7eb' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
          Resumen
        </h2>

        <div className="flex justify-between text-base"
          style={{ color: 'var(--color-text-main)' }}>
          <span>Subtotal</span>
          <span className="font-semibold">{subtotal.toFixed(2)} €</span>
        </div>


        <Link href={`/${locale}/checkout`}
          className="block w-full text-center py-3 rounded-xl text-white font-semibold
            hover:bg-gray-800 transition-colors"
          style={{ background: '#1a1a1a' }}>
          Tramitar pedido
        </Link>

        <Link href={`/${locale}/productos`}
          className="block w-full text-center py-2 rounded-xl border text-base
            hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}>
          Seguir comprando
        </Link>
      </aside>
    </div>
  )
}

type LineProps = {
  item:     CartItem
  onChange: (patch: { quantity?: number; notes?: string }) => void
  onRemove: () => void
}

function CartLine({ item, onChange, onRemove }: LineProps) {
  const isWeight = item.productType === 'WEIGHT'
  const unitLabel = isWeight ? '€/kg' : '€/ud'
  const qtyLabel  = isWeight ? 'kg'   : 'ud'

  return (
    <div className="flex gap-4 bg-white border rounded-2xl p-4"
      style={{ borderColor: '#e5e7eb' }}>
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-orange-50 shrink-0
        flex items-center justify-center">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
          : <span className="text-2xl opacity-30">🥩</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium" style={{ color: 'var(--color-text-main)' }}>
            {item.productName}
          </p>
          <button onClick={onRemove}
            className="text-sm hover:underline shrink-0"
            style={{ color: 'var(--color-brand)' }}>
            Quitar
          </button>
        </div>

        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {item.unitPrice.toFixed(2)} {unitLabel}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={isWeight ? 0.1 : 1}
            step={isWeight ? 0.1 : 1}
            value={item.quantity}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v) && v > 0) onChange({ quantity: v })
            }}
            className="w-24 border rounded-lg px-3 py-1.5 text-base
              focus:outline-none focus:ring-2"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {qtyLabel}
          </span>
          <span className="ml-auto font-semibold"
            style={{ color: 'var(--color-text-main)' }}>
            {cartItemTotal(item).toFixed(2)} €
          </span>
        </div>

        <input
          type="text"
          value={item.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Notas (ej: en filetes, sin hueso…)"
          maxLength={300}
          className="mt-2 w-full border rounded-lg px-3 py-1.5 text-sm
            focus:outline-none focus:ring-2"
          style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
        />
      </div>
    </div>
  )
}
