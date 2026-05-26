'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/shared/SearchInput'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { LoadingPage } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { useProducts } from '@/hooks/use-products'
import { Plus, Grid, List } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProductFilters as Filters } from '@/server/types/entities'

export default function ProductsPage() {
  const router = useRouter()
  const [view, setView] = useState<'grid' | 'table'>('table')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>({})

  const { products, categories, isLoading, deleteProduct } = useProducts({
    ...filters,
    search: search || undefined,
  })

  const handleDeleteProduct = (id: string) => {
    deleteProduct({ id })
  }

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de productos de tu carnicería"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Productos' },
        ]}
        actions={
          <Button onClick={() => router.push('/dashboard/productos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        }
      />

      {/* Búsqueda y filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Buscar productos..."
          onSearch={setSearch}
          className="sm:w-[300px]"
        />

        <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'table')}>
          <TabsList>
            <TabsTrigger value="table">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ProductFilters categories={categories} onFilterChange={setFilters} />

      {/* Lista de productos */}
      {view === 'table' ? (
        <ProductTable products={products} onDelete={handleDeleteProduct} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      {products.length === 0 && !isLoading && (
        <ErrorState
          title="No se encontraron productos"
          message="Intenta ajustar los filtros o agregar un nuevo producto"
        />
      )}
    </div>
  )
}