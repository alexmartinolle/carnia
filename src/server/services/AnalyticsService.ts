import { SaleRepository } from '../repositories/SaleRepository'
import { OrderRepository } from '../repositories/OrderRepository'
import { ProductRepository } from '../repositories/ProductRepository'
import { InventoryRepository } from '../repositories/InventoryRepository'
import type { DashboardStats, SalesMetrics } from '../types/entities'
import { logger } from '../utils/logger'
import { calculatePercentageChange } from '../utils/helpers'

export class AnalyticsService {
  constructor(
    private saleRepo: SaleRepository,
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
    private inventoryRepo: InventoryRepository
  ) {}

  /**
   * Obtiene estadísticas del dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Ventas de hoy
      const todaySales = await this.saleRepo.getSalesByDateRange(
        today,
        tomorrow
      )
      const todayRevenue = todaySales.reduce(
        (sum, s) => sum + s.total_amount,
        0
      )
      const todayTransactions = todaySales.length
      const todayAvgTicket =
        todayTransactions > 0 ? todayRevenue / todayTransactions : 0

      // Ventas de ayer (para comparación)
      const yesterdaySales = await this.saleRepo.getSalesByDateRange(
        yesterday,
        today
      )
      const yesterdayRevenue = yesterdaySales.reduce(
        (sum, s) => sum + s.total_amount,
        0
      )
      const yesterdayTransactions = yesterdaySales.length

      // Calcular cambios porcentuales
      const revenueChange = calculatePercentageChange(
        todayRevenue,
        yesterdayRevenue
      )
      const salesChange = calculatePercentageChange(
        todayTransactions,
        yesterdayTransactions
      )

      // Pedidos del día
      const todayOrders = await this.orderRepo.getTodayOrders()

      // Pedidos de ayer
      const yesterdayOrders = await this.orderRepo.findAll({
        dateFrom: yesterday,
        dateTo: today,
      })

      const ordersChange = calculatePercentageChange(
        todayOrders.length,
        yesterdayOrders.length
      )

      // Alertas
      const lowStockProducts = await this.inventoryRepo.getLowStockProducts()
      const outOfStockProducts =
        await this.inventoryRepo.getOutOfStockProducts()
      const pendingOrders = await this.orderRepo.findPending()
      const urgentOrders = await this.orderRepo.getUrgentOrders()

      logger.info('Dashboard stats generadas', 'AnalyticsService')

      return {
        today: {
          sales: todayTransactions,
          revenue: todayRevenue,
          orders: todayOrders.length,
          averageTicket: todayAvgTicket,
        },
        comparison: {
          salesChange,
          revenueChange,
          ordersChange,
        },
        alerts: {
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          pendingOrdersCount: pendingOrders.length,
          urgentOrdersCount: urgentOrders.length,
        },
      }
    } catch (error) {
      logger.error(
        'Error al obtener stats del dashboard',
        'AnalyticsService',
        error
      )
      throw error
    }
  }

  /**
   * Obtiene métricas de ventas
   */
  async getSalesMetrics(dateRange: {
    from: Date
    to: Date
  }): Promise<SalesMetrics> {
    try {
      const sales = await this.saleRepo.getSalesByDateRange(
        dateRange.from,
        dateRange.to
      )

      const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0)
      const transactions = sales.length
      const averageTicket = transactions > 0 ? totalRevenue / transactions : 0

      // Agrupar por método de pago
      const paymentMethodStats = sales.reduce(
        (acc, sale) => {
          const method = sale.payment_method
          if (!acc[method]) {
            acc[method] = { count: 0, total: 0 }
          }
          acc[method].count++
          acc[method].total += sale.total_amount
          return acc
        },
        {} as Record<string, { count: number; total: number }>
      )

      const byPaymentMethod = Object.entries(paymentMethodStats).map(
        ([method, stats]) => ({
          method: method as any,
          count: stats.count,
          total: stats.total,
          percentage: (stats.total / totalRevenue) * 100 || 0,
        })
      )

      // Agrupar por día
      const dailyStats = sales.reduce(
        (acc, sale) => {
          const date = new Date(sale.created_at!).toISOString().split('T')[0]
          if (!acc[date]) {
            acc[date] = { revenue: 0, transactions: 0 }
          }
          acc[date].revenue += sale.total_amount
          acc[date].transactions++
          return acc
        },
        {} as Record<string, { revenue: number; transactions: number }>
      )

      const byDay = Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        transactions: stats.transactions,
      }))

      logger.info('Métricas de ventas generadas', 'AnalyticsService', {
        from: dateRange.from,
        to: dateRange.to,
      })

      return {
        period: dateRange,
        totals: {
          revenue: totalRevenue,
          transactions,
          averageTicket,
          itemsSold: 0, // Se calcularía desde sales_items
        },
        breakdown: {
          byCategory: [], // Se implementaría con JOIN
          byPaymentMethod,
          byDay,
        },
      }
    } catch (error) {
      logger.error(
        'Error al obtener métricas de ventas',
        'AnalyticsService',
        error
      )
      throw error
    }
  }

  /**
   * Obtiene comparativa de períodos
   */
  async getComparison(
    currentPeriod: { from: Date; to: Date },
    previousPeriod: { from: Date; to: Date }
  ): Promise<{
    current: { revenue: number; transactions: number }
    previous: { revenue: number; transactions: number }
    change: { revenue: number; transactions: number }
  }> {
    try {
      const currentRevenue = await this.saleRepo.getTotalRevenue(
        currentPeriod.from,
        currentPeriod.to
      )
      const currentTransactions = await this.saleRepo.getTransactionCount(
        currentPeriod.from,
        currentPeriod.to
      )

      const previousRevenue = await this.saleRepo.getTotalRevenue(
        previousPeriod.from,
        previousPeriod.to
      )
      const previousTransactions = await this.saleRepo.getTransactionCount(
        previousPeriod.from,
        previousPeriod.to
      )

      return {
        current: {
          revenue: currentRevenue,
          transactions: currentTransactions,
        },
        previous: {
          revenue: previousRevenue,
          transactions: previousTransactions,
        },
        change: {
          revenue: calculatePercentageChange(currentRevenue, previousRevenue),
          transactions: calculatePercentageChange(
            currentTransactions,
            previousTransactions
          ),
        },
      }
    } catch (error) {
      logger.error('Error al obtener comparativa', 'AnalyticsService', error)
      throw error
    }
  }
}