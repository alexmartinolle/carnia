'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart/store'

type Props = {
  productId:    string
  productType:  'UNIT' | 'WEIGHT'
  productName:  string
  price:        number
  priceUnit:    string
  imageUrl?:    string | null
}

const WEIGHT_OPTIONS = [
  { label: '250g',  value: 0.25 },
  { label: '500g',  value: 0.50 },
  { label: '750g',  value: 0.75 },
  { label: '1kg',   value: 1.00 },
  { label: '1.5kg', value: 1.50 },
  { label: '2kg',   value: 2.00 },
]

export default function ProductActions({ productId, productType, productName, price, priceUnit, imageUrl = null }: Props) {
  const addItem = useCart((s) => s.addItem)
  const [weight,   setWeight]   = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes,    setNotes]    = useState('')
  const [error,    setError]    = useState('')
  const [added,    setAdded]    = useState(false)

  // Precio total calculado
  const total = productType === 'WEIGHT'
    ? weight ? (price * weight).toFixed(2) : null
    : (price * quantity).toFixed(2)

  function handleAddToCart() {
    if (productType === 'WEIGHT' && !weight) {
      setError('Selecciona el peso antes de añadir al carrito')
      return
    }
    setError('')
    addItem({
      productId,
      productName,
      productType,
      imageUrl,
      unitPrice: price,
      quantity:  productType === 'WEIGHT' ? Number(weight) : quantity,
      notes,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-6">

      {/* Selector de peso — productos WEIGHT */}
      {productType === 'WEIGHT' && (
        <div>
          <label className="block text-base font-medium mb-3"
            style={{ color: 'var(--color-text-main)' }}>
            Selecciona el peso
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WEIGHT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => { setWeight(option.value); setError('') }}
                className="py-3 px-4 rounded-lg text-base font-medium border-2 transition-all"
                style={weight === option.value
                  ? { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' }
                  : { background: '#fff', color: '#1a1a1a', borderColor: '#e5e7eb' }
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          {/* Peso personalizado */}
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm shrink-0"
              style={{ color: 'var(--color-text-muted)' }}>
              Otro peso (kg):
            </label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              placeholder="Ej: 1.2"
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val > 0) {
                  setWeight(val)
                  setError('')
                }
              }}
              className="w-28 border rounded-lg px-3 py-2 text-base
                focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>
          {error && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-brand)' }}>
              ⚠️ {error}
            </p>
          )}
        </div>
      )}

      {/* Selector de cantidad — productos UNIT */}
      {productType === 'UNIT' && (
        <div>
          <label className="block text-base font-medium mb-3"
            style={{ color: 'var(--color-text-main)' }}>
            Cantidad
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-11 h-11 rounded-full border-2 text-xl font-bold
                flex items-center justify-center transition-colors
                hover:border-red-600"
              style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
            >
              −
            </button>
            <span className="text-2xl font-semibold w-8 text-center"
              style={{ color: 'var(--color-text-main)' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-11 h-11 rounded-full border-2 text-xl font-bold
                flex items-center justify-center transition-colors
                hover:border-red-600"
              style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Precio total dinámico */}
      {total && (
        <div className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: 'var(--color-celeste)', border: '1px solid var(--color-celeste)' }}>
          <div>
            <p className="text-sm text-white">
              {productType === 'WEIGHT'
                ? `${weight! >= 1 ? `${weight}kg` : `${weight! * 1000}g`} × ${price.toFixed(2)} €/kg`
                : `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} × ${price.toFixed(2)} €/ud`
              }
            </p>
            <p className="text-sm font-medium mt-0.5 text-white">
              Total estimado
            </p>
          </div>
          <span className="text-3xl font-bold text-white">
            {total} €
          </span>
        </div>
      )}

      {/* Cuadro de notas */}
      <div>
        <label className="block text-base font-medium mb-2"
          style={{ color: 'var(--color-text-main)' }}>
          Detalles del pedido
          <span className="text-sm font-normal ml-2"
            style={{ color: 'var(--color-text-muted)' }}>
            (opcional)
          </span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: cortar en filetes, sin hueso, mariposa..."
          rows={3}
          maxLength={300}
          className="w-full border rounded-xl px-4 py-3 text-base
            resize-none focus:outline-none focus:ring-2"
          style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
        />
        <p className="text-xs mt-1 text-right"
          style={{ color: 'var(--color-text-muted)' }}>
          {notes.length}/300
        </p>
      </div>

      {/* Botón añadir */}
      <button
        onClick={handleAddToCart}
        className="w-full py-4 rounded-xl text-white text-lg font-semibold
          hover:bg-gray-800 transition-colors"
        style={{ background: added ? '#16a34a' : '#1a1a1a' }}
      >
        {added ? '✓ Añadido al carrito' : 'Añadir al carrito'}
        {productType === 'WEIGHT' && weight && (
          <span className="ml-2 text-base font-normal opacity-90">
            · {weight >= 1 ? `${weight}kg` : `${weight * 1000}g`}
          </span>
        )}
        {productType === 'UNIT' && (
          <span className="ml-2 text-base font-normal opacity-90">
            · {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
          </span>
        )}
      </button>

    </div>
  )
}
