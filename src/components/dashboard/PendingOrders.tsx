'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/server/types/entities'

interface PendingOrdersProps {
  orders: Order[]
}

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  confirmed: 'Confirmado',
  ready: 'Listo',
}

export function PendingOrders({ orders }: PendingOrdersProps) {
  const getTimeUntilPickup = (pickupDate: string) => {
    const now = new Date()
    const pickup = new Date(pickupDate)
    const diffMs = pickup.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours < 0) return { text: 'Retrasado', urgent: true }
    if (diffHours === 0) return { text: `${diffMinutes}m`, urgent: true }
    if (diffHours < 2) return { text: `${diffHours}h ${diffMinutes}m`, urgent: true }
    return { text: `${diffHours}h`, urgent: false }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pedidos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No hay pedidos pendientes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pedidos Pendientes ({orders.length})
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/pedidos">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="space-y-3">
            {orders.map((order) => {
              const timeInfo = getTimeUntilPickup(order.pickup_datetime!)
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/pedidos/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{order.order_number}</p>
                      <Badge variant="secondary">
                        {statusLabels[order.status] || order.status}
                      </Badge>
                      {timeInfo.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatPrice(order.total_amount)}</span>
                      <span>•</span>
                      <span>
                        Recogida: {formatDate(new Date(order.pickup_datetime!), {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span className={timeInfo.urgent ? 'text-red-600 font-medium' : ''}>
                        {timeInfo.text}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}