import CheckoutForm from '@/components/web/CheckoutForm'

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Tramitar pedido
      </h1>
      <CheckoutForm locale={locale} />
    </div>
  )
}
