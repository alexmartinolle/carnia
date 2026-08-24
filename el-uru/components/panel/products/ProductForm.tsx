'use client'
import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import { useForm }           from 'react-hook-form'
import { zodResolver }       from '@hookform/resolvers/zod'
import { ProductFormSchema, type ProductFormInput } from '@/lib/schemas/product.schema'
import { createProduct, updateProduct }             from '@/lib/actions/products.actions'
import type { Category } from '@/types/product'
import type { Product }  from '@/types/product'
import type { RawMaterial } from '@/types/inventory'

type Props = {
  categories:   Category[]
  rawMaterials: RawMaterial[]
  product?:     Product
  locale:       string
}

export default function ProductForm({ categories, rawMaterials, product, locale }: Props) {
  const router  = useRouter()
  const [saving, setSaving]   = useState(false)
  const [error,  setError]    = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<ProductFormInput>({
      resolver: zodResolver(ProductFormSchema),
      defaultValues: product ? {
        name_es:             product.name_es,
        name_ca:             product.name_ca,
        slug:                product.slug,
        description_es:      product.description_es || '',
        description_ca:      product.description_ca || '',
        preparation_tips_es: product.preparation_tips_es || '',
        preparation_tips_ca: product.preparation_tips_ca || '',
        price:               Number(product.price),
        price_per_kg:        product.price_per_kg ? Number(product.price_per_kg) : null,
        product_type:        product.product_type,
        category_id:         product.category_id,
        image_url:           product.image_url || '',
        is_visible:          product.is_visible,
        is_on_offer:         product.is_on_offer,
        offer_price:         product.offer_price ? Number(product.offer_price) : null,
        // <input type="date"> requiere YYYY-MM-DD. Recortamos cualquier timestamp.
        offer_ends_at:       product.offer_ends_at ? String(product.offer_ends_at).slice(0, 10) : '',
        stock_quantity:      Number(product.stock_quantity),
        stock_threshold:     Number(product.stock_threshold),
        expiry_alert_days:   product.expiry_alert_days || 3,
        raw_material_id:     product.raw_material_id || null,
        is_available:        product.is_available ?? true,
        unit_cost:           product.unit_cost != null ? Number(product.unit_cost) : null,
      } : {
        name_es: '',
        name_ca: '',
        slug: '',
        description_es: '',
        description_ca: '',
        preparation_tips_es: '',
        preparation_tips_ca: '',
        price: 0,
        price_per_kg: null,
        product_type: 'WEIGHT',
        category_id: '',
        image_url: '',
        is_visible: true,
        is_on_offer: false,
        offer_price: null,
        offer_ends_at: '',
        stock_quantity: 0,
        stock_threshold: 1,
        expiry_alert_days: 3,
        raw_material_id: null,
        is_available: true,
        unit_cost: null,
      },
    })

  const isOnOffer     = watch('is_on_offer')
  const imageUrl      = watch('image_url')
  const productType   = watch('product_type')
  const rawMaterialId = watch('raw_material_id')
  const salePrice     = Number(watch('price') || 0)
  const unitCost      = Number(watch('unit_cost') || 0)

  // Margen en vivo (el campo "Precio" es €/kg en WEIGHT y €/ud en UNIT):
  // - WEIGHT: coste = coste medio por kg de la materia prima
  // - UNIT  : coste = unit_cost (elaborado)
  const selectedMaterial = rawMaterials.find((m) => m.id === rawMaterialId)
  const isWeight   = productType === 'WEIGHT'
  const costPerUnit = isWeight ? Number(selectedMaterial?.avg_cost_per_kg || 0) : unitCost
  const marginValue = salePrice - costPerUnit
  const marginPct   = salePrice > 0 ? (marginValue / salePrice) * 100 : 0
  const hasCost     = costPerUnit > 0 && salePrice > 0

  // Autogenerar slug desde name_es
  function handleNameChange(value: string) {
    if (!product) {
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

  async function onSubmit(data: ProductFormInput) {
    setSaving(true)
    setError('')

    const result = product
      ? await updateProduct(product.id, data)
      : await createProduct(data)

    if (!result.success) {
      setError(result.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    router.push(`/${locale}/panel/productos`)
    router.refresh()
  }

  const inputClass = "w-full bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]"
  const labelClass = "block text-sm font-medium mb-1.5 text-zinc-300"
  const errorClass = "text-xs mt-1 text-rose-400"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Nombres */}
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
          <p className="text-xs text-zinc-500 mt-1">
            Se genera automáticamente. Ej: chuleton-ternera
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Categoría *</label>
            <select {...register('category_id')} className={inputClass}>
              <option value="">Seleccionar...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name_es}</option>
              ))}
            </select>
            {errors.category_id && <p className={errorClass}>{errors.category_id.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Tipo de producto *</label>
            <select {...register('product_type')} className={inputClass}>
              <option value="WEIGHT">Por peso (kg)</option>
              <option value="UNIT">Por unidad</option>
            </select>
          </div>
        </div>
      </section>

      {/* Descripciones */}
      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base text-zinc-100">Descripción y consejos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Descripción (ES)</label>
            <textarea {...register('description_es')}
              className={inputClass} rows={3} />
          </div>
          <div>
            <label className={labelClass}>Descripció (CA)</label>
            <textarea {...register('description_ca')}
              className={inputClass} rows={3} />
          </div>
          <div>
            <label className={labelClass}>Consejos de preparación (ES)</label>
            <textarea {...register('preparation_tips_es')}
              className={inputClass} rows={3} />
          </div>
          <div>
            <label className={labelClass}>Consells de preparació (CA)</label>
            <textarea {...register('preparation_tips_ca')}
              className={inputClass} rows={3} />
          </div>
        </div>
      </section>

      {/* Precio y stock */}
      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base text-zinc-100">Precio y stock</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Precio (€) *</label>
            <input {...register('price', { valueAsNumber: true })}
              type="number" step="0.01" className={inputClass} />
            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Stock actual</label>
            <input {...register('stock_quantity', { valueAsNumber: true })}
              type="number" step="0.001" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Alerta stock bajo</label>
            <input {...register('stock_threshold', { valueAsNumber: true })}
              type="number" step="0.001" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Días alerta caducidad</label>
            <input {...register('expiry_alert_days', { valueAsNumber: true })}
              type="number" min="1" className={inputClass} />
          </div>
        </div>

        {/* Oferta */}
        <div className="flex items-center gap-3 pt-2">
          <input {...register('is_on_offer')} type="checkbox" id="is_on_offer"
            className="w-4 h-4 accent-[#C0392B]" />
          <label htmlFor="is_on_offer" className="text-sm font-medium text-zinc-200">
            Producto en oferta
          </label>
        </div>
        {isOnOffer && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Precio de oferta (€)</label>
              <input {...register('offer_price', { valueAsNumber: true })}
                type="number" step="0.01" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Oferta válida hasta</label>
              <input {...register('offer_ends_at')}
                type="date" className={inputClass} />
            </div>
          </div>
        )}
      </section>

      {/* Coste y disponibilidad */}
      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base text-zinc-100">Coste y disponibilidad</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Materia prima</label>
            <select
              {...register('raw_material_id', { setValueAs: (v) => (v === '' || v == null ? null : v) })}
              className={inputClass}
            >
              <option value="">Sin materia prima</option>
              {rawMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {Number(m.avg_cost_per_kg).toFixed(2)} €/kg
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              {isWeight
                ? 'El coste por kg se toma del coste medio de la materia prima.'
                : 'Para elaborados por unidad, usa el coste unitario de abajo.'}
            </p>
          </div>

          {!isWeight && (
            <div>
              <label className={labelClass}>Coste unitario (€)</label>
              <input
                {...register('unit_cost', { setValueAs: (v) => (v === '' || v == null ? null : Number(v)) })}
                type="number" step="0.01" min="0" placeholder="0.00"
                className={inputClass}
              />
              {errors.unit_cost && <p className={errorClass}>{errors.unit_cost.message}</p>}
              <p className="text-xs text-zinc-500 mt-1">Coste de producción por unidad (hamburguesa, chorizo...).</p>
            </div>
          )}
        </div>

        {/* Margen en vivo */}
        <div className="rounded-lg border border-white/10 bg-[#2a1610] p-4">
          {hasCost ? (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div>
                <p className="text-xs text-zinc-500">Coste</p>
                <p className="text-sm font-medium text-zinc-200">
                  {costPerUnit.toFixed(2)} €{isWeight ? '/kg' : '/ud'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Venta</p>
                <p className="text-sm font-medium text-zinc-200">
                  {salePrice.toFixed(2)} €{isWeight ? '/kg' : '/ud'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Margen</p>
                <p className={`text-sm font-semibold ${marginValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {marginValue.toFixed(2)} € · {marginPct.toFixed(1)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              Asigna {isWeight ? 'una materia prima con coste' : 'un coste unitario'} y un precio para ver el margen.
            </p>
          )}
        </div>

        {/* Disponibilidad */}
        <div className="flex items-center gap-3 pt-1">
          <input {...register('is_available')} type="checkbox" id="is_available"
            className="w-4 h-4 accent-[#C0392B]" />
          <div>
            <label htmlFor="is_available" className="text-sm font-medium text-zinc-200">
              Disponible
            </label>
            <p className="text-xs text-zinc-500">
              Si está desmarcado se muestra como agotado en la web (sin ocultar el producto).
            </p>
          </div>
        </div>
      </section>

      {/* Imagen */}
      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base text-zinc-100">Imagen</h2>
        <div>
          <label className={labelClass}>URL de la imagen</label>
          <input {...register('image_url')}
            type="url"
            placeholder="https://..."
            className={inputClass} />
          {errors.image_url && <p className={errorClass}>{errors.image_url.message}</p>}
        </div>
        {imageUrl && (
          <div className="mt-3 w-40 h-40 rounded-lg overflow-hidden border border-white/10 relative">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </section>

      {/* Visibilidad */}
      <section className="bg-[#1f100a] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <input {...register('is_visible')} type="checkbox" id="is_visible"
            className="w-4 h-4 accent-[#C0392B]" />
          <div>
            <label htmlFor="is_visible" className="text-sm font-medium text-zinc-200">
              Visible en la tienda
            </label>
            <p className="text-xs text-zinc-500">
              Si está desmarcado el producto no aparecerá en la web
            </p>
          </div>
        </div>
      </section>

      {/* Botones */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-lg bg-[#C0392B] hover:bg-[#a93226] text-white font-semibold
            transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 rounded-lg border border-white/10 font-medium text-zinc-300
            hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
      </div>

    </form>
  )
}
