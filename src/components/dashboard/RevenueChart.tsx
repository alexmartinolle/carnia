'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

interface RevenueChartProps {
  data?: Array<{
    date: string
    revenue: number
  }>
}

// Datos de ejemplo (reemplazar con datos reales)
const mockData = [
  { date: 'Lun', revenue: 1200 },
  { date: 'Mar', revenue: 1900 },
  { date: 'Mié', revenue: 1600 },
  { date: 'Jue', revenue: 2100 },
  { date: 'Vie', revenue: 2400 },
  { date: 'Sáb', revenue: 2800 },
  { date: 'Dom', revenue: 1800 },
]

export function RevenueChart({ data = mockData }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue (Últimos 7 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 85%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 85%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium">
                          {payload[0].payload.date}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(payload[0].value as number)}
                        </span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(0, 85%, 45%)"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}