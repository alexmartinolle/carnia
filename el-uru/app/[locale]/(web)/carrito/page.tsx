import CartView from '@/components/web/CartView'

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Tu carrito
      </h1>
      <CartView locale={locale} />
    </div>
  )
}
