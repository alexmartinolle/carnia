'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '@/lib/cart/store'

type Props = {
  open:         boolean
  onClose:      () => void
  productId:    string
  productName:  string
  productType:  'UNIT' | 'WEIGHT'
  price:        number
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

export default function AddToCartModal({
  open, onClose, productId, productName, productType, price, imageUrl = null,
}: Props) {
  const addItem = useCart((s) => s.addItem)
  const [weight,   setWeight]   = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes,    setNotes]    = useState('')
  const [error,    setError]    = useState('')
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) {
      setWeight(null)
      setQuantity(1)
      setNotes('')
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !mounted) return null

  const isWeight = productType === 'WEIGHT'
  const priceUnit = isWeight ? 'kg' : 'ud'
  const total = isWeight
    ? (weight ? (price * weight).toFixed(2) : null)
    : (price * quantity).toFixed(2)

  function handleAdd() {
    if (isWeight && !weight) {
      setError('Selecciona el peso')
      return
    }
    addItem({
      productId,
      productName,
      productType,
      imageUrl,
      unitPrice: price,
      quantity:  isWeight ? Number(weight) : quantity,
      notes,
    })
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 space-y-5
          max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-orange-50 shrink-0
            flex items-center justify-center">
            {imageUrl
              ? <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
              : <span className="text-2xl opacity-30">🥩</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg leading-tight"
              style={{ color: 'var(--color-text-main)' }}>
              {productName}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {price.toFixed(2)} €/{priceUnit}
            </p>
          </div>
          <button onClick={onClose}
            className="text-2xl leading-none w-8 h-8 rounded-full hover:bg-gray-100"
            aria-label="Cerrar">
            ×
          </button>
        </div>

        {/* Selector peso */}
        {isWeight && (
          <div>
            <label className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-main)' }}>
              Peso aproximado <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setWeight(opt.value); setError('') }}
                  className="py-2 rounded-lg text-sm font-medium border-2 transition-all"
                  style={weight === opt.value
                    ? { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' }
                    : { background: '#fff', color: '#1a1a1a', borderColor: '#e5e7eb' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs shrink-0"
                style={{ color: 'var(--color-text-muted)' }}>
                Otro (kg):
              </label>
              <input
                type="number" min="0.1" max="10" step="0.1"
                placeholder="Ej: 1.2"
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v) && v > 0) { setWeight(v); setError('') }
                }}
                className="w-24 border rounded-lg px-2 py-1.5 text-sm
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

        {/* Selector cantidad */}
        {!isWeight && (
          <div>
            <label className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-main)' }}>
              Cantidad
            </label>
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border-2 text-xl font-bold
                  flex items-center justify-center"
                style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}>
                −
              </button>
              <span className="text-xl font-semibold w-8 text-center"
                style={{ color: 'var(--color-text-main)' }}>
                {quantity}
              </span>
              <button type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-full border-2 text-xl font-bold
                  flex items-center justify-center"
                style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}>
                +
              </button>
            </div>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-main)' }}>
            Notas <span className="text-xs font-normal"
              style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: en filetes, sin hueso, mariposa…"
            rows={2}
            maxLength={300}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none
              focus:outline-none focus:ring-2"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
          />
        </div>

        {/* Total */}
        {total && (
          <div className="flex items-center justify-between rounded-xl p-3"
            style={{ background: 'var(--color-celeste)' }}>
            <span className="text-sm font-medium text-white">
              Total {isWeight && '(aprox.)'}
            </span>
            <span className="text-xl font-bold text-white">
              {total} €
            </span>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAdd}
          className="w-full py-3 rounded-xl text-white font-semibold
            hover:bg-gray-800 transition-colors"
          style={{ background: '#1a1a1a' }}
        >
          Añadir al carrito
        </button>
      </div>
    </div>,
    document.body
  )
}
