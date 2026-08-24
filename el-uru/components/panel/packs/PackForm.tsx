'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackFormSchema, type PackFormInput } from '@/lib/schemas/pack.schema'
import { createPack, updatePack } from '@/lib/actions/packs.actions'
import ProductPicker from '@/components/panel/products/ProductPicker'
import { effectiveUnitPrice } from '@/lib/pricing'
import type { Product } from '@/types/product'
import type { Pack } from '@/types/pack'

type Props = {
  products: Product[]
  pack?: Pack
  locale: string
}

const EMPTY_LINE = {
  product_id: '',
  weight: 0,
  unit_price: 0,
  total: 0,
}

export default function PackForm({ products, pack, locale }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const productMap = useMemo(() => {
    const m = new Map<string, Product>()
    products.forEach(p => m.set(p.id, p))
    return m
  }, [products])

  const { register, handleSubmit, control, watch, setValue, getValues, reset, formState: { errors } } =
    useForm<PackFormInput>({
      resolver: zodResolver(PackFormSchema),
      defaultValues: pack ? {
        name_es: pack.name_es,
        name_ca: pack.name_ca,
        slug: pack.slug,
        description_es: pack.description_es || '',
        description_ca: pack.description_ca || '',
        price: Number(pack.price),
        image_url: pack.image_url || '',
        is_visible: pack.is_visible,
        is_on_offer: pack.is_on_offer,
        offer_price: pack.offer_price ? Number(pack.offer_price) : null,
        offer_ends_at: pack.offer_ends_at ? String(pack.offer_ends_at).slice(0, 10) : '',
        products: pack.pack_products.map(pp => ({
          product_id: pp.product_id,
          weight: Number(pp.weight),
        })),
      } : {
        name_es: '',
        name_ca: '',
        slug: '',
        description_es: '',
        description_ca: '',
        price: 0,
        image_url: '',
        is_visible: true,
        is_on_offer: false,
        offer_price: null,
        offer_ends_at: '',
        products: [{ ...EMPTY_LINE }],
      },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'products' })

  const productsWatch = watch('products')
  const isOnOffer = watch('is_on_offer')
  const imageUrl = watch('image_url')

  const subtotal = (productsWatch ?? []).reduce((sum, it) => sum + (Number(it?.total) || 0), 0)

  const focusIndexRef = useRef<number | null>(null)
  const productRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (focusIndexRef.current != null) {
      productRefs.current[focusIndexRef.current]?.focus()
      productRefs.current[focusIndexRef.current]?.select()
      focusIndexRef.current = null
    }
  }, [fields.length])

  function recalcLineTotal(index: number) {
    const weight = Number(getValues(`products.${index}.weight`) || 0)
    const price = Number(getValues(`products.${index}.unit_price`) || 0)
    setValue(`products.${index}.total`, Number((weight * price).toFixed(2)), { shouldDirty: true })
  }

  function applyProduct(index: number, p: Product) {
    setValue(`products.${index}.product_id`, p.id, { shouldDirty: true })
    setValue(`products.${index}.unit_price`, effectiveUnitPrice(p), { shouldDirty: true })
    if (!Number(getValues(`products.${index}.weight`))) {
      setValue(`products.${index}.weight`, 0.5, { shouldDirty: true })
    }
    recalcLineTotal(index)
  }

  function addLine() {
    focusIndexRef.current = fields.length
    append({ ...EMPTY_LINE })
  }

  function handleNameChange(value: string) {
    if (!pack) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug)
    }
  }

  async function onSubmit(data: PackFormInput) {
    data.products = data.products.filter(it => it.product_id && Number(it.weight) > 0)
    if (data.products.length === 0) {
      setError('Añade al menos un producto')
      return
    }

    setSaving(true)
    setError('')

    const result = pack
      ? await updatePack(pack.id, data)
      : await createPack(data)

    if (!result.success) {
      setError(result.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    router.push(`/${locale}/panel/packs`)
    router.refresh()
  }

  const inputClass = "w-full bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]"
  const labelClass = "block text-xs font-medium text-zinc-400 mb-1"
  const errorClass = "text-xs mt-1 text-rose-400"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-5xl">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base text-zinc-100">Información básica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre (Español) *</label>
            <input {...register('name_es')}
              className={inputClass}
              onChange={(e) => { register('name_es').onChange(e); handleNameChange(e.target.value) }}
            />
            {errors.name_es && <p className={errorClass}>{errors.name_es.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nom (Català) *</label>
            <input {...register('name_ca')} className={inputClass} />
            {errors.name_ca && <p className={errorClass}>{errors.name_ca.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Slug (URL) *</label>
          <input {...register('slug')} className={inputClass} />
          {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Descripción (ES)</label>
            <textarea {...register('description_es')} className={inputClass} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Descripció (CA)</label>
            <textarea {...register('description_ca')} className={inputClass} rows={2} />
          </div>
        </div>
      </section>

      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base text-zinc-100">Productos del pack</h2>
          <button
            type="button"
            onClick={addLine}
            className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-zinc-200 hover:bg-white/5 transition-colors font-medium"
          >
            + Añadir producto
          </button>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-3 px-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          <div className="col-span-5">Producto</div>
          <div className="col-span-2">Peso (kg)</div>
          <div className="col-span-2">€ / kg</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1" />
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => {
            const productId = watch(`products.${index}.product_id`)
            const product = productId ? productMap.get(productId) : undefined
            const weight = Number(watch(`products.${index}.weight`) || 0)
            const lineUnit = Number(watch(`products.${index}.unit_price`) || 0)
            const lineTotal = Number(watch(`products.${index}.total`) || 0)

            return (
              <div key={field.id} className="border border-white/5 rounded-lg p-3 bg-white/2">
                <div className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-12 md:col-span-5">
                    <ProductPicker
                      products={products}
                      initialName={product?.name_es || ''}
                      onSelect={(p) => applyProduct(index, p)}
                      setInputRef={(el) => { productRefs.current[index] = el }}
                    />
                    <input type="hidden" {...register(`products.${index}.product_id`)} />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        inputMode="decimal"
                        {...register(`products.${index}.weight`, {
                          valueAsNumber: true,
                          onChange: () => recalcLineTotal(index),
                        })}
                        className={inputClass + ' pr-9'}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">kg</span>
                    </div>
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        tabIndex={-1}
                        value={lineUnit.toFixed(2)}
                        className={inputClass + ' pr-7 bg-white/2 text-zinc-300 cursor-not-allowed'}
                      />
                      <input type="hidden" {...register(`products.${index}.unit_price`, { valueAsNumber: true })} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">€</span>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-2">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        tabIndex={-1}
                        value={lineTotal.toFixed(2)}
                        className={inputClass + ' pr-7 bg-white/2 font-semibold text-right text-[#E57368] cursor-not-allowed'}
                      />
                      <input type="hidden" {...register(`products.${index}.total`, { valueAsNumber: true })} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">€</span>
                    </div>
                  </div>

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
              </div>
            )
          })}
        </div>

        {errors.products && <p className={errorClass}>{errors.products.message}</p>}
      </section>

      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className={labelClass}>Precio del pack (€) *</label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className={inputClass}
            />
            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
            <p className="text-xs text-zinc-500 mt-1">
              Precio fijado por el carnicero. Suma de productos: {subtotal.toFixed(2)} €
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500">Suma productos: {subtotal.toFixed(2)} €</p>
            <p className="text-3xl font-bold mt-1 text-[#E57368]">
              {subtotal.toFixed(2)} €
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base text-zinc-100">Oferta e imagen</h2>
        <div className="flex items-center gap-3">
          <input {...register('is_on_offer')} type="checkbox" id="is_on_offer" className="w-4 h-4 accent-[#C0392B]" />
          <label htmlFor="is_on_offer" className="text-sm font-medium text-zinc-200">Pack en oferta</label>
        </div>
        {isOnOffer && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Precio de oferta (€)</label>
              <input {...register('offer_price', { valueAsNumber: true })} type="number" step="0.01" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Oferta válida hasta</label>
              <input {...register('offer_ends_at')} type="date" className={inputClass} />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>URL de la imagen</label>
          <input {...register('image_url')} type="url" placeholder="https://..." className={inputClass} />
          {errors.image_url && <p className={errorClass}>{errors.image_url.message}</p>}
        </div>
        {imageUrl && (
          <div className="mt-3 w-40 h-40 rounded-lg overflow-hidden border border-white/10 relative">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </section>

      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <input {...register('is_visible')} type="checkbox" id="is_visible" className="w-4 h-4 accent-[#C0392B]" />
          <div>
            <label htmlFor="is_visible" className="text-sm font-medium text-zinc-200">Visible en la tienda</label>
            <p className="text-xs text-zinc-500">Si está desmarcado el pack no aparecerá en la web</p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 pb-8">
        <button type="submit" disabled={saving} className="px-6 py-3 rounded-lg bg-[#C0392B] hover:bg-[#a93226] text-white font-semibold transition-colors disabled:opacity-50">
          {saving ? 'Guardando...' : pack ? 'Guardar cambios' : 'Crear pack'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-5 py-3 rounded-lg border border-white/10 font-medium text-zinc-300 hover:bg-white/5 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
