'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StockBadge } from '@/components/shared/StatusBadge'
import { MoreHorizontal, Edit, Eye, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice } from '@/lib/utils'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import Link from 'next/link'
import type { ProductWithCategory } from '@/server/types/entities'

interface ProductTableProps {
  products: ProductWithCategory[]
  onDelete?: (id: string) => void
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const columns: ColumnDef<ProductWithCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Producto',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
              <span className="font-semibold text-muted-foreground">
                {product.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.category.name}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'price_per_unit',
      header: 'Precio',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div>
            <p className="font-semibold">{formatPrice(product.price_per_unit)}</p>
            <p className="text-xs text-muted-foreground">
              {product.is_per_kg ? 'por kg' : 'por unidad'}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="space-y-1">
            <p className="font-medium">
              {product.stock_quantity} / {product.stock_minimum}
            </p>
            <StockBadge
              quantity={product.stock_quantity}
              minimum={product.stock_minimum}
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'profit_margin',
      header: 'Margen',
      cell: ({ row }) => {
        return <span>{row.original.profit_margin}%</span>
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => {
        return row.original.is_active ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Activo
          </Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/productos/${product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/productos/${product.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onDelete && (
                <ConfirmDialog
                  title="¿Eliminar producto?"
                  description={`¿Estás seguro de que deseas eliminar "${product.name}"?`}
                  confirmText="Eliminar"
                  variant="destructive"
                  onConfirm={() => onDelete(product.id)}
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </ConfirmDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={products}
      emptyState={{
        title: 'No hay productos',
        description: 'Comienza agregando tu primer producto',
        action: {
          label: 'Agregar producto',
          onClick: () => (window.location.href = '/dashboard/productos/nuevo'),
        },
      }}
    />
  )
}