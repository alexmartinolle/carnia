'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart, cartSubtotal, cartHasEstimated, cartItemTotal } from '@/lib/cart/store'
import { createOnlineOrder } from '@/lib/actions/orders.actions'

export default function CheckoutForm({ locale }: { locale: string }) {
  const router    = useRouter()
  const items     = useCart((s) => s.items)
  const setCustomerData = useCart((s) => s.setCustomerData)
  const setDelivery = useCart((s) => s.setDelivery)
  const isDelivery = useCart((s) => s.isDelivery)
  const clearCart = useCart((s) => s.clear)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [notes,   setNotes]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

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
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold"
          style={{ background: 'var(--color-brand)' }}>
          Ver productos
        </Link>
      </div>
    )
  }

  const subtotal = cartSubtotal(items)
  const hasEstim = cartHasEstimated(items)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    setCustomerData({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
    })

    if (isDelivery) {
      router.push(`/${locale}/envio`)
    } else {
      router.push(`/${locale}/pago`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Datos cliente */}
      <div className="lg:col-span-2 space-y-5 bg-white border rounded-2xl p-6"
        style={{ borderColor: '#e5e7eb' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
          Tus datos
        </h2>

        <Field label="Nombre y apellidos *">
          <input type="text" required minLength={2} maxLength={120}
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-base
              focus:outline-none focus:ring-2"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }} />
        </Field>

        <Field label="Teléfono *">
          <input type="tel" required minLength={6} maxLength={30}
            value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-base
              focus:outline-none focus:ring-2"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }} />
        </Field>

        <Field label="Email *">
          <input type="email" required maxLength={120}
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-base
              focus:outline-none focus:ring-2"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }} />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDelivery}
            onChange={(e) => setDelivery(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#E57368] focus:ring-[#E57368]"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
            Envío a domicilio (+5,00 €)
          </span>
        </label>

        <Field label="Notas (opcional)">
          <textarea rows={3} maxLength={500}
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Alergias, preferencias, etc."
            className="w-full border rounded-lg px-3 py-2 text-base resize-none
              focus:outline-none focus:ring-2"
            style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }} />
        </Field>

        <div className="rounded-xl p-4 text-sm space-y-1"
          style={{ background: '#fff7ed', color: '#7c2d12' }}>
          <p className="font-semibold">Recogida y pago en tienda</p>
          <p>Recoges tu pedido en Carnicería El Uru. El pago se realiza al recoger.</p>
        </div>
      </div>

      {/* Resumen */}
      <aside className="bg-white border rounded-2xl p-6 h-fit space-y-4"
        style={{ borderColor: '#e5e7eb' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
          Resumen
        </h2>

        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-main)' }}>
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

        <div className="border-t pt-3 flex justify-between font-semibold"
          style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}>
          <span>Total</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>


        {error && (
          <p className="text-sm" style={{ color: 'var(--color-brand)' }}>
            ⚠️ {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="block w-full text-center py-3 rounded-xl text-white font-semibold
            hover:bg-gray-800 transition-colors disabled:opacity-50"
          style={{ background: '#1a1a1a' }}>
          {loading ? 'Enviando…' : 'Confirmar pedido'}
        </button>

        <Link href={`/${locale}/carrito`}
          className="block w-full text-center py-2 text-sm hover:underline"
          style={{ color: 'var(--color-text-muted)' }}>
          ← Volver al carrito
        </Link>
      </aside>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5"
        style={{ color: 'var(--color-text-main)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}
