'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StockBadge } from '@/components/shared/StatusBadge'
import { LoadingPage } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useProduct } from '@/hooks/use-products'
import { useProducts } from '@/hooks/use-products'
import { Edit, Trash2, Package, TrendingUp, Calendar } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { product, stats, isLoading } = useProduct(id)
  const { deleteProduct } = useProducts()

  const handleDelete = async () => {
    await deleteProduct({ id })
    router.push('/dashboard/productos')
  }

  if (isLoading) {
    return <LoadingPage />
  }

  if (!product) {
    return <ErrorState title="Producto no encontrado" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={product.category.name}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Productos', href: '/dashboard/productos' },
          { label: product.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/productos/${id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <ConfirmDialog
              title="¿Eliminar producto?"
              description={`¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`}
              confirmText="Eliminar"
              variant="destructive"
              onConfirm={handleDelete}
            >
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </ConfirmDialog>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-5xl font-bold text-muted-foreground">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="text-lg font-semibold">{product.name}</p>
                  </div>

                  {product.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Descripción</p>
                      <p className="text-sm">{product.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      {product.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>

                    {product.supplier && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Proveedor
                        </p>
                        <p className="text-sm font-medium">{product.supplier}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Precio y stock */}
          <Card>
            <CardHeader>
              <CardTitle>Precio e Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(product.price_per_unit)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.is_per_kg ? 'por kilogramo' : 'por unidad'}
                    </p>
                  </div>

                  {product.profit_margin && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Margen de beneficio
                      </p>
                      <p className="text-xl font-semibold">
                        {product.profit_margin}%
                      </p>
                    </div>
                  )}
                </div>

                <Separator orientation="vertical" className="hidden sm:block" />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock actual</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold">
                        {product.stock_quantity}
                      </p>
                      <StockBadge
                        quantity={product.stock_quantity}
                        minimum={product.stock_minimum}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stock mínimo
                    </p>
                    <p className="text-xl font-semibold">
                      {product.stock_minimum}
                    </p>
                  </div>

                  {product.stock_quantity < product.stock_minimum && (
                    <div className="rounded-lg bg-yellow-50 p-3">
                      <p className="text-sm font-medium text-yellow-800">
                        ⚠️ Stock por debajo del mínimo
                      </p>
                      <p className="text-xs text-yellow-700">
                        Considera reabastecer este producto
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral - Estadísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total vendido
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {stats?.totalSold || 0}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Veces vendido
                  </span>
                  <span className="text-2xl font-bold">
                    {stats?.timesOrdered || 0}
                  </span>
                </div>
              </div>

              <Separator />

              {stats?.lastSaleDate && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Última venta</span>
                  </div>
                  <p className="mt-1 font-medium">
                    {formatDate(new Date(stats.lastSaleDate), {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/inventario/ajustar?product=${id}`}>
                  Ajustar Stock
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/ventas/nueva?product=${id}`}>
                  Registrar Venta
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}