'use client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useCart } from '@/lib/cart/store'
import { useState } from 'react'
import { MapPin, Truck } from 'lucide-react'

export default function DeliveryAddressPage() {
  const router = useRouter()
  const locale = useLocale()
  const setDeliveryAddress = useCart((s) => s.setDeliveryAddress)
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [province, setProvince] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!address.trim() || !city.trim() || !postalCode.trim() || !province.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }

    setDeliveryAddress({
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      province: province.trim(),
    })

    router.push(`/${locale}/pago`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>
          Dirección de envío
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Indica dónde quieres recibir tu pedido
        </p>
      </div>

      <div className="rounded-2xl p-6 bg-white border" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>
              Envío a domicilio
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Coste de envío: 5,00 €
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-main)' }}>
              Dirección *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, piso..."
              className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-main)' }}>
              Ciudad *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ciudad"
              className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-main)' }}>
                Código postal *
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="08001"
                className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-main)' }}>
                Provincia *
              </label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Barcelona"
                className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', color: 'var(--color-text-main)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold hover:bg-gray-800 transition-colors"
            style={{ background: '#1a1a1a' }}
          >
            Continuar al pago
          </button>
        </form>
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
