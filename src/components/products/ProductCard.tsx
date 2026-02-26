import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StockBadge } from '@/components/shared/StatusBadge'
import { formatPrice } from '@/lib/utils'
import type { ProductWithCategory } from '@/server/types/entities'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

interface ProductCardProps {
  product: ProductWithCategory
  onDelete?: (id: string) => void
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        {!product.is_active && (
          <Badge variant="secondary" className="absolute right-2 top-2">
            Inactivo
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {product.category.name}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(product.price_per_unit)}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.is_per_kg ? 'por kg' : 'por unidad'}
              </p>
            </div>
            <StockBadge
              quantity={product.stock_quantity}
              minimum={product.stock_minimum}
            />
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/productos/${product.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Ver
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/productos/${product.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/productos/${product.id}`}>
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/productos/${product.id}/editar`}>
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onDelete && (
              <ConfirmDialog
                title="¿Eliminar producto?"
                description={`¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={() => onDelete(product.id)}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  Eliminar
                </DropdownMenuItem>
              </ConfirmDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}