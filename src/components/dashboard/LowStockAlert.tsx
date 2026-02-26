'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { LowStockProduct } from '@/server/types/entities'

interface LowStockAlertProps {
  products: LowStockProduct[]
}

const urgencyConfig = {
  critical: {
    label: 'Crítico',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  high: {
    label: 'Alto',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  medium: {
    label: 'Medio',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  low: {
    label: 'Bajo',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            ✅ Todo el inventario está en niveles óptimos
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Stock Bajo ({products.length})
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/inventario">
            Ver todo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{product.name}</p>
                    <Badge
                      variant="secondary"
                      className={urgencyConfig[product.urgencyLevel].className}
                    >
                      {urgencyConfig[product.urgencyLevel].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      Stock: <span className="font-medium text-red-600">{product.stock_quantity}</span> / {product.stock_minimum}
                    </span>
                    <span className="text-primary">
                      Pedir: {product.suggestedOrderQty} unidades
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}