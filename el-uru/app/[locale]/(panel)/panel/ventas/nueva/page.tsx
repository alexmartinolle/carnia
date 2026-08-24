import { createClient } from '@/utils/supabase/server'
import SaleForm         from '@/components/panel/sales/SaleForm'
import type { Product } from '@/types/product'

export default async function NewSalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase   = await createClient()

  // Solo columnas que el formulario necesita (evita join con categories y campos no usados).
  const { data: products } = await supabase
    .from('products')
    .select('id, name_es, name_ca, price, price_per_kg, product_type, stock_quantity, is_on_offer, offer_price, offer_ends_at')
    .eq('is_visible', true)
    .order('name_es', { ascending: true })

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-zinc-100">Nueva venta</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Tienda física · Se marca como pagada y completada automáticamente, y se descuenta del stock.
        </p>
      </div>

      <SaleForm products={(products ?? []) as Product[]} locale={locale} />
    </div>
  )
}
