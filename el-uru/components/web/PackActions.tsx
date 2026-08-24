'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart/store'

type Props = {
  packId: string
  packName: string
  price: number
  imageUrl?: string | null
}

export default function PackActions({ packId, packName, price, imageUrl = null }: Props) {
  const addItem = useCart((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)

  const total = (price * quantity).toFixed(2)

  function handleAddToCart() {
    addItem({
      productId: packId,
      productName: packName,
      productType: 'UNIT',
      imageUrl,
      unitPrice: price,
      quantity,
      notes,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Selector de cantidad */}
      <div>
        <label className="block text-base font-medium mb-3" style={{ color: 'var(--color-text-main)' }}>
          Cantidad
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-11 h-11 rounded-full border-2 text-xl font-bold flex items-center justify-center transition-colors hover:border-red-600"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
          >
            −
          </button>
          <span className="text-2xl font-semibold w-8 text-center" style={{ color: 'var(--color-text-main)' }}>
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-11 h-11 rounded-full border-2 text-xl font-bold flex items-center justify-center transition-colors hover:border-red-600"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
          >
            +
          </button>
        </div>
      </div>

      {/* Precio total */}
      <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--color-celeste)', border: '1px solid var(--color-celeste)' }}>
        <div>
          <p className="text-sm text-white">
            {quantity} {quantity === 1 ? 'pack' : 'packs'} × {price.toFixed(2)} €
          </p>
          <p className="text-sm font-medium mt-0.5 text-white">
            Total
          </p>
        </div>
        <span className="text-3xl font-bold text-white">
          {total} €
        </span>
      </div>

      {/* Cuadro de notas */}
      <div>
        <label className="block text-base font-medium mb-2" style={{ color: 'var(--color-text-main)' }}>
          Detalles del pedido
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-muted)' }}>
            (opcional)
          </span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: cortar en filetes, sin hueso..."
          rows={3}
          maxLength={300}
          className="w-full border rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2"
          style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
        />
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-text-muted)' }}>
          {notes.length}/300
        </p>
      </div>

      {/* Botón añadir */}
      <button
        onClick={handleAddToCart}
        className="w-full py-4 rounded-xl text-white text-lg font-semibold hover:bg-gray-800 transition-colors"
        style={{ background: added ? '#16a34a' : '#1a1a1a' }}
      >
        {added ? '✓ Añadido al carrito' : 'Añadir al carrito'}
        <span className="ml-2 text-base font-normal opacity-90">
          · {quantity} {quantity === 1 ? 'pack' : 'packs'}
        </span>
      </button>
    </div>
  )
}
