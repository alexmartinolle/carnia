'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProductForm } from '@/components/products/ProductForm'
import { LoadingPage } from '@/components/shared/LoadingSpinner'
import { useProducts } from '@/hooks/use-products'

export default function NewProductPage() {
  const router = useRouter()
  const { categories, createProduct, isCreating } = useProducts()

  const handleSubmit = async (data: any) => {
    await createProduct(data)
    router.push('/dashboard/productos')
  }

  if (!categories.length) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Producto"
        description="Agrega un nuevo producto a tu catálogo"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Productos', href: '/dashboard/productos' },
          { label: 'Nuevo' },
        ]}
      />

      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />
    </div>
  )
}