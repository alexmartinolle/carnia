'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  ShoppingCart,
  Package,
  Users,
  FileText,
} from 'lucide-react'

const actions = [
  {
    title: 'Nueva Venta',
    description: 'Registrar venta rápida',
    icon: ShoppingCart,
    href: '/dashboard/ventas/nueva',
    variant: 'default' as const,
  },
  {
    title: 'Nuevo Pedido',
    description: 'Crear pedido de cliente',
    icon: FileText,
    href: '/dashboard/pedidos/nuevo',
    variant: 'outline' as const,
  },
  {
    title: 'Añadir Producto',
    description: 'Agregar producto al catálogo',
    icon: Package,
    href: '/dashboard/productos/nuevo',
    variant: 'outline' as const,
  },
  {
    title: 'Nuevo Cliente',
    description: 'Registrar nuevo cliente',
    icon: Users,
    href: '/dashboard/clientes/nuevo',
    variant: 'outline' as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant={action.variant}
              className="h-auto flex-col items-start gap-2 p-4"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-5 w-5" />
                <div className="space-y-1 text-left">
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}