'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Warehouse,
  TrendingUp,
  Settings,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navigation = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Productos',
        href: '/dashboard/productos',
        icon: Package,
      },
      {
        title: 'Categorías',
        href: '/dashboard/categorias',
        icon: Tag,
      },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      {
        title: 'Ventas',
        href: '/dashboard/ventas',
        icon: ShoppingCart,
      },
      {
        title: 'Pedidos',
        href: '/dashboard/pedidos',
        icon: FileText,
      },
      {
        title: 'Clientes',
        href: '/dashboard/clientes',
        icon: Users,
      },
    ],
  },
  {
    title: 'Gestión',
    items: [
      {
        title: 'Inventario',
        href: '/dashboard/inventario',
        icon: Warehouse,
      },
      {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: TrendingUp,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* Logo Mobile */}
      <div className="flex h-16 items-center border-b px-6 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">CS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">Carnia</h1>
            <p className="text-xs text-muted-foreground">Gestión</p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-4">
          {navigation.map((section, idx) => (
            <div key={section.title}>
              {idx > 0 && <Separator className="my-4" />}
              <div className="px-3 pb-2">
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start',
                          isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                        )}
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/dashboard/configuracion">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Link>
        </Button>
      </div>
    </div>
  )
}