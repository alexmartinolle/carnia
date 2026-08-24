'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter }               from 'next/navigation'
import { useForm, useFieldArray }  from 'react-hook-form'
import { zodResolver }             from '@hookform/resolvers/zod'
import { SaleSchema, type SaleInput } from '@/lib/schemas/sale.schema'
import { createSale, updateSale }     from '@/lib/actions/sales.actions'
import ProductPicker             from '@/components/panel/products/ProductPicker'
import { effectiveUnitPrice } from '@/lib/pricing'
import type { Product }       from '@/types/product'
import type { SaleWithItems } from '@/types/sale'

type Props = {
  products: Product[]
  sale?:    SaleWithItems
  locale:   string
}

// `defaultUnitPrice` se ha movido a `lib/pricing.ts` como `effectiveUnitPrice`
// para compartirlo entre ProductPicker, SaleForm y cualquier otro consumidor.

const EMPTY_LINE = {
  product_id:   '',
  product_name: '',
  quantity:     0,
  unit_price:   0,
  total:        0,
  notes:        '',
}

export default function SaleForm({ products, sale, locale }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const productMap = useMemo(() => {
    const m = new Map<string, Product>()
    products.forEach(p => m.set(p.id, p))
    return m
  }, [products])

  const { register, handleSubmit, control, watch, setValue, getValues, reset, formState: { errors } } =
    useForm<SaleInput>({
      resolver: zodResolver(SaleSchema),
      defaultValues: sale ? {
        sale_channel:   sale.sale_channel,
        delivery_type:  (sale.delivery_type  as SaleInput['delivery_type'])  ?? 'PICKUP',
        payment_method: (sale.payment_method as SaleInput['payment_method']) ?? 'CASH',
        payment_status: (sale.payment_status as SaleInput['payment_status']) ?? 'PAID',
        order_status:   (sale.order_status   as SaleInput['order_status'])   ?? 'DELIVERED',
        guest_name:     sale.guest_name  ?? '',
        guest_phone:    sale.guest_phone ?? '',
        guest_email:    sale.guest_email ?? '',
        notes:          sale.notes ?? '',
        discount:       Number(sale.discount ?? 0),
        shipping_cost:  Number(sale.shipping_cost ?? 0),
        items: sale.order_items.map(it => ({
          product_id:   it.product_id,
          product_name: it.product_name,
          quantity:     Number(it.quantity),
          unit_price:   Number(it.unit_price),
          total:        Number(it.total),
          notes:        it.notes ?? '',
        })),
      } : {
        sale_channel:   'TIENDA',
        delivery_type:  'PICKUP',
        payment_method: 'CASH',
        payment_status: 'PAID',
        order_status:   'DELIVERED',
        guest_name:     '',
        guest_phone:    '',
        guest_email:    '',
        notes:          '',
        discount:       0,
        shipping_cost:  0,
        items:          [{ ...EMPTY_LINE }],
      },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const items         = watch('items')
  const discount      = watch('discount') || 0
  const paymentMethod = watch('payment_method')
  const deliveryType  = watch('delivery_type')

  const subtotal = (items ?? []).reduce((sum, it) => sum + (Number(it?.total) || 0), 0)
  const shippingCost = deliveryType === 'SHIPPING' ? 5 : 0
  const total    = Math.max(0, subtotal + shippingCost - Number(discount))

  // Refs para autofocus de la última línea añadida
  const focusIndexRef = useRef<number | null>(null)
  const productRefs   = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (focusIndexRef.current != null) {
      productRefs.current[focusIndexRef.current]?.focus()
      productRefs.current[focusIndexRef.current]?.select()
      focusIndexRef.current = null
    }
  }, [fields.length])

  // Actualizar shipping_cost automáticamente cuando cambia delivery_type
  useEffect(() => {
    if (deliveryType) {
      const cost = deliveryType === 'SHIPPING' ? 5 : 0
      setValue('shipping_cost', cost, { shouldDirty: true })
    }
  }, [deliveryType, setValue])

  function recalcLineTotal(index: number) {
    const qty   = Number(getValues(`items.${index}.quantity`)   || 0)
    const price = Number(getValues(`items.${index}.unit_price`) || 0)
    setValue(`items.${index}.total`, Number((qty * price).toFixed(2)), { shouldDirty: true })
  }

  function applyProduct(index: number, p: Product) {
    setValue(`items.${index}.product_id`,   p.id,                    { shouldDirty: true })
    setValue(`items.${index}.product_name`, p.name_es,               { shouldDirty: true })
    setValue(`items.${index}.unit_price`,   effectiveUnitPrice(p),   { shouldDirty: true })
    if (!Number(getValues(`items.${index}.quantity`))) {
      setValue(`items.${index}.quantity`, 1, { shouldDirty: true })
    }
    recalcLineTotal(index)
  }

  function addLine() {
    focusIndexRef.current = fields.length
    append({ ...EMPTY_LINE })
  }

  async function onSubmit(data: SaleInput, andNew = false) {
    // Limpia líneas vacías sin producto
    data.items = data.items.filter(it => it.product_id && Number(it.quantity) > 0)
    if (data.items.length === 0) {
      setError('Añade al menos un producto')
      return
    }

    setSaving(true); setError('')
    const result = sale
      ? await updateSale(sale.id, data)
      : await createSale(data)

    if (!result.success) {
      setError(result.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    setSaving(false)

    if (andNew) {
      reset({
        sale_channel:   'TIENDA',
        delivery_type:  'PICKUP',
        payment_method: 'CASH',
        payment_status: 'PAID',
        order_status:   'DELIVERED',
        guest_name: '', guest_phone: '', guest_email: '',
        notes: '', discount: 0, shipping_cost: 0,
        items: [{ ...EMPTY_LINE }],
      })
      focusIndexRef.current = 0
      router.refresh()
      return
    }

    router.push(`/${locale}/panel/ventas`)
    router.refresh()
  }

  const inputClass = "w-full bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]"
  const labelClass = "block text-xs font-medium text-zinc-400 mb-1"
  const errorClass = "text-xs mt-1 text-rose-400"

  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit(d, false))}
      className="space-y-5 max-w-5xl"
    >
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Líneas */}
      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base text-zinc-100">Productos</h2>
          <button
            type="button"
            onClick={addLine}
            className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-zinc-200 hover:bg-white/5 transition-colors font-medium"
          >
            + Añadir producto
          </button>
        </div>

        {/* Encabezado de columnas (solo desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          <div className="col-span-5">Producto</div>
          <div className="col-span-2">Peso / Cant.</div>
          <div className="col-span-2">€ / unidad</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1" />
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => {
            const productId  = watch(`items.${index}.product_id`)
            const product    = productId ? productMap.get(productId) : undefined
            const unitLabel  = product?.product_type === 'WEIGHT' ? 'kg' : 'ud'
            const step       = product?.product_type === 'WEIGHT' ? '0.001' : '1'
            const qty        = Number(watch(`items.${index}.quantity`)   || 0)
            const lineUnit   = Number(watch(`items.${index}.unit_price`) || 0)
            const lineTotal  = Number(watch(`items.${index}.total`)      || 0)
            const stockQty   = product ? Number(product.stock_quantity) : 0
            const overStock  = !!product && qty > stockQty

            return (
              <div key={field.id} className="border border-white/5 rounded-lg p-3 bg-white/2">
                <div className="grid grid-cols-12 gap-3 items-start">
                  {/* Producto (combobox) */}
                  <div className="col-span-12 md:col-span-5">
                    <ProductPicker
                      products={products}
                      initialName={watch(`items.${index}.product_name`) || ''}
                      onSelect={(p) => applyProduct(index, p)}
                      setInputRef={(el) => { productRefs.current[index] = el }}
                    />
                    <input type="hidden" {...register(`items.${index}.product_id`)} />
                    <input type="hidden" {...register(`items.${index}.product_name`)} />
                    {product && (
                      <p className={`text-[11px] mt-2 truncate ${
                        overStock ? 'text-rose-400 font-medium' : 'text-zinc-500'
                      }`}>
                        {product.product_type === 'WEIGHT' ? 'Por peso (kg)' : 'Por unidad'} · Stock: {stockQty} {unitLabel}
                        {product.is_on_offer && product.offer_price != null && (
                          <span className="ml-2 text-emerald-400 font-medium">
                            🏷️ Oferta: {Number(product.offer_price).toFixed(2)} € (antes {Number(product.price).toFixed(2)} €)
                          </span>
                        )}
                        {overStock && (
                          <span className="ml-2">⚠ Supera el stock disponible</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-4 md:col-span-2">
                    <div className="relative">
                      <input
                        type="number"
                        step={step}
                        min="0"
                        inputMode="decimal"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          onChange: () => recalcLineTotal(index),
                        })}
                        className={`${inputClass} pr-9 ${overStock ? 'ring-2 ring-rose-500/60 border-rose-500/50' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">
                        {unitLabel}
                      </span>
                    </div>
                  </div>

                  {/* Precio unitario (autocalculado, no editable) */}
                  <div className="col-span-4 md:col-span-2">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        tabIndex={-1}
                        value={lineUnit.toFixed(2)}
                        className={`${inputClass} pr-7 bg-white/2 text-zinc-300 cursor-not-allowed`}
                      />
                      <input type="hidden" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">€</span>
                    </div>
                  </div>

                  {/* Total línea (autocalculado, no editable) */}
                  <div className="col-span-3 md:col-span-2">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        tabIndex={-1}
                        value={lineTotal.toFixed(2)}
                        className={`${inputClass} pr-7 bg-white/2 font-semibold text-right text-[#E57368] cursor-not-allowed`}
                      />
                      <input type="hidden" {...register(`items.${index}.total`, { valueAsNumber: true })} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">€</span>
                    </div>
                  </div>

                  {/* Borrar */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="h-9 w-9 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center"
                      title="Quitar línea"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {errors.items?.[index] && (
                  <p className={errorClass}>
                    {(errors.items[index]?.product_id?.message ||
                      errors.items[index]?.quantity?.message  ||
                      errors.items[index]?.unit_price?.message) as string}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {errors.items && typeof errors.items.message === 'string' && (
          <p className={errorClass}>{errors.items.message}</p>
        )}
      </section>

      {/* Totales */}
      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className={labelClass}>Tipo de entrega</label>
              <div className="inline-flex rounded-lg border border-white/10 overflow-hidden">
                {([
                  { value: 'PICKUP', label: '📦 Recogida' },
                  { value: 'SHIPPING', label: '🚚 Envío' },
                ] as const).map((opt) => {
                  const active = deliveryType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('delivery_type', opt.value, { shouldValidate: true })}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#C0392B] text-white'
                          : 'bg-[#2a1610] text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" {...register('delivery_type')} />
            </div>

            <div>
              <label className={labelClass}>Método de pago</label>
              <div className="inline-flex rounded-lg border border-white/10 overflow-hidden">
                {([
                  { value: 'CASH', label: '💵 Efectivo' },
                  { value: 'CARD', label: '💳 Tarjeta' },
                ] as const).map((opt) => {
                  const active = paymentMethod === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('payment_method', opt.value, { shouldValidate: true })}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#C0392B] text-white'
                          : 'bg-[#2a1610] text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" {...register('payment_method')} />
            </div>

            <div>
              <label className={labelClass}>Descuento (€)</label>
              <input
                type="number" step="0.01" min="0" inputMode="decimal"
                {...register('discount', { valueAsNumber: true })}
                className={`${inputClass} w-32`}
              />
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500">Subtotal: {subtotal.toFixed(2)} €</p>
            {shippingCost > 0 && (
              <p className="text-xs text-zinc-500">Envío: + {shippingCost.toFixed(2)} €</p>
            )}
            {Number(discount) > 0 && (
              <p className="text-xs text-zinc-500">Descuento: − {Number(discount).toFixed(2)} €</p>
            )}
            <p className="text-3xl font-bold mt-1 text-[#E57368]">
              {total.toFixed(2)} €
            </p>
          </div>
        </div>
      </section>

      {/* Botones */}
      <div className="flex items-center gap-3 pb-8 flex-wrap">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-lg bg-[#C0392B] hover:bg-[#a93226] text-white font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : sale ? 'Guardar cambios' : 'Guardar venta'}
        </button>

        {!sale && (
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit((d) => onSubmit(d, true))}
            className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Guardar y nueva
          </button>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-lg border border-white/10 font-medium text-zinc-300 hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
