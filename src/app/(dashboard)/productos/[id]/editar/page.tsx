'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProductForm } from '@/components/products/ProductForm'
import { LoadingPage } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { useProduct } from '@/hooks/use-products'
import { useProducts } from '@/hooks/use-products'

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { product, isLoading: isLoadingProduct } = useProduct(id)
  const { categories, updateProduct, isUpdating } = useProducts()

  const handleSubmit = async (data: any) => {
    await updateProduct({ id, data })
    router.push(`/dashboard/productos/${id}`)
  }

  if (isLoadingProduct) {
    return <LoadingPage />
  }

  if (!product) {
    return <ErrorState title="Producto no encontrado" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Producto"
        description={`Modificando: ${product.name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Productos', href: '/dashboard/productos' },
          { label: product.name, href: `/dashboard/productos/${id}` },
          { label: 'Editar' },
        ]}
      />

      <ProductForm
        categories={categories}
        product={product}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
      />
    </div>
  )
}