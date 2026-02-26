'use client'

import { trpc } from '@/lib/trpc/react'

export function useDashboard() {
  const { data: stats, isLoading: statsLoading } =
    trpc.analytics.getDashboardStats.useQuery(undefined, {
      refetchInterval: 30000, // Refetch cada 30 segundos
    })

  const { data: lowStock, isLoading: lowStockLoading } =
    trpc.product.getLowStock.useQuery()

  const { data: pendingOrders, isLoading: ordersLoading } =
    trpc.order.getPending.useQuery()

  const { data: todaySales, isLoading: salesLoading } =
    trpc.sale.getTodaySales.useQuery()

  return {
    stats,
    lowStock: lowStock?.slice(0, 5) || [],
    pendingOrders: pendingOrders?.slice(0, 5) || [],
    todaySales: todaySales?.slice(0, 5) || [],
    isLoading: statsLoading || lowStockLoading || ordersLoading || salesLoading,
  }
}