import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusBadgeProps {
  status: Status
  label: string
  className?: string
}

const statusStyles: Record<Status, string> = {
  success: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200',
  default: '',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(statusStyles[status], className)} variant="secondary">
      {label}
    </Badge>
  )
}

// Badges específicos para stock
export function StockBadge({ quantity, minimum }: { quantity: number; minimum: number }) {
  const status = quantity === 0 ? 'error' : quantity < minimum ? 'warning' : 'success'
  const label = quantity === 0 ? 'Sin stock' : quantity < minimum ? 'Stock bajo' : 'Disponible'

  return <StatusBadge status={status} label={label} />
}

// Badges para estados de pedidos
export function OrderStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { status: Status; label: string }> = {
    new: { status: 'info', label: 'Nuevo' },
    confirmed: { status: 'warning', label: 'Confirmado' },
    ready: { status: 'success', label: 'Listo' },
    completed: { status: 'success', label: 'Completado' },
    cancelled: { status: 'error', label: 'Cancelado' },
  }

  const config = statusMap[status] || { status: 'default', label: status }

  return <StatusBadge status={config.status} label={config.label} />
}

// Badges para segmentos de clientes
export function SegmentBadge({ segment }: { segment: string }) {
  const segmentMap: Record<string, { status: Status; label: string }> = {
    vip: { status: 'success', label: 'VIP' },
    regular: { status: 'info', label: 'Regular' },
    new: { status: 'warning', label: 'Nuevo' },
    inactive: { status: 'error', label: 'Inactivo' },
  }

  const config = segmentMap[segment] || { status: 'default', label: segment }

  return <StatusBadge status={config.status} label={config.label} />
}