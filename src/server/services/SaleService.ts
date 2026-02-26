import { SaleRepository } from '../repositories/SaleRepository'
import { ProductRepository } from '../repositories/ProductRepository'
import { CustomerRepository } from '../repositories/CustomerRepository'
import type {
  Sale,
  SaleWithDetails,
  SaleInsert,
  SaleItemInsert,
  SaleFilters,
  PaymentMethod,
} from '../types/entities'
import {
  ValidationError,
  InsufficientStockError,
  NotFoundError,
} from '../utils/errors'
import { logger } from '../utils/logger'
import { BUSINESS_RULES } from '../config/constants'

export class SaleService {
  constructor(
    private saleRepo: SaleRepository,
    private productRepo: ProductRepository,
    private customerRepo: CustomerRepository
  ) {}

  /**
   * Obtiene todas las ventas
   */
  async getAll(filters?: SaleFilters): Promise<Sale[]> {
    try {
      const sales = await this.saleRepo.findAll(filters)

      logger.info('Ventas obtenidas', 'SaleService', {
        count: sales.length,
        filters,
      })

      return sales
    } catch (error) {
      logger.error('Error al obtener ventas', 'SaleService', error)
      throw error
    }
  }

  /**
   * Obtiene una venta por ID
   */
  async getById(id: string): Promise<SaleWithDetails> {
    try {
      const sale = await this.saleRepo.findById(id)

      if (!sale) {
        throw new NotFoundError('Venta', id)
      }

      return sale
    } catch (error) {
      logger.error('Error al obtener venta', 'SaleService', error)
      throw error
    }
  }

  /**
   * Registra una nueva venta
   */
  async recordSale(input: {
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
    }>
    payment_method: PaymentMethod
    customer_id?: string
    notes?: string
  }): Promise<Sale> {
    try {
      // Validar entrada
      this.validateCreateSaleInput(input)

      // Verificar cliente si se especifica
      if (input.customer_id) {
        const customer = await this.customerRepo.findById(input.customer_id)
        if (!customer) {
          throw new NotFoundError('Cliente', input.customer_id)
        }
      }

      // Validar stock de todos los productos
      for (const item of input.items) {
        const product = await this.productRepo.findById(item.product_id)

        if (!product) {
          throw new NotFoundError('Producto', item.product_id)
        }

        if (!product.is_active) {
          throw new ValidationError(
            `El producto "${product.name}" está inactivo`
          )
        }

        if (product.stock_quantity < item.quantity) {
          throw new InsufficientStockError(
            product.name,
            product.stock_quantity,
            item.quantity
          )
        }
      }

      // Calcular el monto total
      const total_amount = input.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price),
        0
      )

      // Crear la venta
      const saleData: SaleInsert = {
        payment_method: input.payment_method,
        customer_id: input.customer_id,
        total_amount,
      }

      // Preparar los items con subtotal (sale_id se agregará en el repositorio)
      const items: Omit<SaleItemInsert, 'sale_id'>[] = input.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      }))

      const sale = await this.saleRepo.create(saleData, items as SaleItemInsert[])

      logger.info('Venta registrada', 'SaleService', {
        saleId: sale.id,
        totalAmount: sale.total_amount,
        itemCount: items.length,
      })

      return sale
    } catch (error) {
      logger.error('Error al registrar venta', 'SaleService', error)
      throw error
    }
  }

  /**
   * Obtiene ventas del día
   */
  async getTodaySales(): Promise<Sale[]> {
    try {
      return await this.saleRepo.getTodaySales()
    } catch (error) {
      logger.error('Error al obtener ventas del día', 'SaleService', error)
      throw error
    }
  }

  /**
   * Obtiene resumen del día
   */
  async getDailySummary(date?: Date): Promise<{
    totalRevenue: number
    transactionCount: number
    averageTicket: number
    byPaymentMethod: Record<PaymentMethod, { count: number; total: number }>
  }> {
    try {
      const targetDate = date || new Date()
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      const sales = await this.saleRepo.getSalesByDateRange(
        startOfDay,
        endOfDay
      )

      const totalRevenue = sales.reduce(
        (sum, sale) => sum + sale.total_amount,
        0
      )
      const transactionCount = sales.length
      const averageTicket =
        transactionCount > 0 ? totalRevenue / transactionCount : 0

      // Agrupar por método de pago
      const byPaymentMethod = sales.reduce(
        (acc, sale) => {
          const method = sale.payment_method as PaymentMethod
          if (!acc[method]) {
            acc[method] = { count: 0, total: 0 }
          }
          acc[method].count++
          acc[method].total += sale.total_amount
          return acc
        },
        {} as Record<PaymentMethod, { count: number; total: number }>
      )

      return {
        totalRevenue,
        transactionCount,
        averageTicket,
        byPaymentMethod,
      }
    } catch (error) {
      logger.error('Error al obtener resumen diario', 'SaleService', error)
      throw error
    }
  }

  /**
   * Obtiene ventas por rango de fechas
   */
  async getSalesByDateRange(from: Date, to: Date): Promise<Sale[]> {
    try {
      return await this.saleRepo.getSalesByDateRange(from, to)
    } catch (error) {
      logger.error('Error al obtener ventas por rango', 'SaleService', error)
      throw error
    }
  }

  /**
   * Obtiene total de revenue en un período
   */
  async getTotalRevenue(from: Date, to: Date): Promise<number> {
    try {
      return await this.saleRepo.getTotalRevenue(from, to)
    } catch (error) {
      logger.error('Error al obtener revenue total', 'SaleService', error)
      throw error
    }
  }

  /**
   * Obtiene ventas de un cliente
   */
  async getCustomerSales(customerId: string): Promise<Sale[]> {
    try {
      return await this.saleRepo.getSalesByCustomer(customerId)
    } catch (error) {
      logger.error('Error al obtener ventas del cliente', 'SaleService', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private validateCreateSaleInput(input: {
    items: Array<{ product_id: string; quantity: number; unit_price: number }>
  }): void {
    if (input.items.length === 0) {
      throw new ValidationError('La venta debe tener al menos un producto')
    }

    if (input.items.length > BUSINESS_RULES.SALE.MAX_ITEMS) {
      throw new ValidationError(
        `La venta no puede tener más de ${BUSINESS_RULES.SALE.MAX_ITEMS} productos`
      )
    }

    // Validar cantidades y precios
    input.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        throw new ValidationError(
          `La cantidad del item ${index + 1} debe ser mayor a 0`
        )
      }

      if (item.unit_price <= 0) {
        throw new ValidationError(
          `El precio del item ${index + 1} debe ser mayor a 0`
        )
      }
    })
  }
}