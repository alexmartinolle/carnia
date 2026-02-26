'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { LowStockAlert } from '@/components/dashboard/LowStockAlert'
import { PendingOrders } from '@/components/dashboard/PendingOrders'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { LoadingPage } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { useDashboard } from '@/hooks/use-dashboard'
import {
  ShoppingCart,
  Euro,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function DashboardPage() {
  const { stats, lowStock, pendingOrders, todaySales, isLoading } = useDashboard()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!stats) {
    return <ErrorState title="Error al cargar dashboard" />
  }

  const getTrend = (change: number): 'up' | 'down' | 'neutral' => {
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'neutral'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general de tu carnicería"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ventas del Día"
          value={stats.today.sales}
          icon={ShoppingCart}
          change={stats.comparison.salesChange}
          changeLabel="vs ayer"
          trend={getTrend(stats.comparison.salesChange)}
        />
        <StatsCard
          title="Revenue del Día"
          value={formatPrice(stats.today.revenue)}
          icon={Euro}
          change={stats.comparison.revenueChange}
          changeLabel="vs ayer"
          trend={getTrend(stats.comparison.revenueChange)}
        />
        <StatsCard
          title="Pedidos"
          value={stats.today.orders}
          icon={FileText}
          change={stats.comparison.ordersChange}
          changeLabel="vs ayer"
          trend={getTrend(stats.comparison.ordersChange)}
        />
        <StatsCard
          title="Ticket Medio"
          value={formatPrice(stats.today.averageTicket)}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Grid 2 columnas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alertas de Stock */}
        <LowStockAlert products={lowStock} />

        {/* Pedidos Pendientes */}
        <PendingOrders orders={pendingOrders} />
      </div>

      {/* Ventas Recientes */}
      <RecentSales sales={todaySales} />
    </div>
  )
}