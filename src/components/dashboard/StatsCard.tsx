import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  trend,
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return Minus
    return trend === 'up' ? ArrowUp : ArrowDown
  }

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-muted-foreground'
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const TrendIcon = getTrendIcon()

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                <TrendIcon className={cn('h-3 w-3', getTrendColor())} />
                <span className={getTrendColor()}>
                  {change > 0 ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}