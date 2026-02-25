import { BaseRepository } from './base/BaseRepository'
import type {
  Sale,
  SaleWithDetails,
  SaleInsert,
  SaleItemInsert,
  SaleFilters,
  PaymentMethod,
} from '../types/entities'

export class SaleRepository extends BaseRepository {
  /**
   * Obtiene todas las ventas con filtros
   */
  async findAll(filters?: SaleFilters): Promise<Sale[]> {
    try {
      let query = this.db.from('sales').select('*')

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString())
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString())
      }

      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod)
      }

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      if (filters?.minAmount) {
        query = query.gte('total_amount', filters.minAmount)
      }

      if (filters?.maxAmount) {
        query = query.lte('total_amount', filters.maxAmount)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'SaleRepository.findAll')
    }
  }

  /**
   * Obtiene una venta con detalles
   */
  async findById(id: string): Promise<SaleWithDetails | null> {
    try {
      const { data, error } = await this.db
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          items:sales_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      return data as unknown as SaleWithDetails
    } catch (error) {
      return this.handleError(error, 'SaleRepository.findById')
    }
  }

  /**
   * Crea una venta con items
   * IMPORTANTE: El trigger process_stock_deduction descontará stock automáticamente
   */
  async create(saleData: SaleInsert, items: SaleItemInsert[]): Promise<Sale> {
    try {
      if (items.length === 0) {
        throw new Error('La venta debe tener al menos un producto')
      }

      // Verificar cliente si se especifica
      if (saleData.customer_id) {
        const customerExists = await this.exists(
          'customers',
          saleData.customer_id
        )
        if (!customerExists) {
          throw new Error('El cliente especificado no existe')
        }
      }

      // Validar stock de todos los productos ANTES de crear la venta
      for (const item of items) {
        const { data: product, error } = await this.db
          .from('products')
          .select('id, name, stock_quantity, is_active')
          .eq('id', item.product_id)
          .is('deleted_at', null)
          .maybeSingle()

        if (error || !product) {
          throw new Error(`Producto con ID ${item.product_id} no encontrado`)
        }

        if (!product.is_active) {
          throw new Error(`El producto "${product.name}" está inactivo`)
        }

        if (product.stock_quantity < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock_quantity}, Solicitado: ${item.quantity}`
          )
        }
      }

      // Crear la venta
      const { data: sale, error: saleError } = await this.db
        .from('sales')
        .insert({
          ...saleData,
          total_amount: 0, // Se actualizará al insertar items
        })
        .select()
        .single()

      if (saleError) throw saleError
      this.assertExists(sale, 'Venta creada')

      // Insertar items (el trigger descontará stock y calculará subtotales)
      const { error: itemsError } = await this.db
        .from('sales_items')
        .insert(
          items.map((item) => ({
            ...item,
            sale_id: sale.id,
          }))
        )

      if (itemsError) throw itemsError

      // Obtener venta actualizada con total calculado
      const { data: updatedSale } = await this.db
        .from('sales')
        .select('*')
        .eq('id', sale.id)
        .single()

      return updatedSale || sale
    } catch (error) {
      return this.handleError(error, 'SaleRepository.create')
    }
  }

  /**
   * Obtiene ventas del día
   */
  async getTodaySales(): Promise<Sale[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await this.db
        .from('sales')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'SaleRepository.getTodaySales')
    }
  }

  /**
   * Obtiene ventas por rango de fechas
   */
  async getSalesByDateRange(from: Date, to: Date): Promise<Sale[]> {
    try {
      const { data, error } = await this.db
        .from('sales')
        .select('*')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'SaleRepository.getSalesByDateRange')
    }
  }

  /**
   * Obtiene ventas por método de pago
   */
  async getSalesByPaymentMethod(
    method: PaymentMethod,
    dateRange?: { from: Date; to: Date }
  ): Promise<Sale[]> {
    try {
      let query = this.db
        .from('sales')
        .select('*')
        .eq('payment_method', method)

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'SaleRepository.getSalesByPaymentMethod')
    }
  }

  /**
   * Obtiene total de revenue en un período
   */
  async getTotalRevenue(from: Date, to: Date): Promise<number> {
    try {
      const { data, error } = await this.db
        .from('sales')
        .select('total_amount')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())

      if (error) throw error

      const total =
        data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0

      return total
    } catch (error) {
      return this.handleError(error, 'SaleRepository.getTotalRevenue')
    }
  }

  /**
   * Obtiene conteo de transacciones en un período
   */
  async getTransactionCount(from: Date, to: Date): Promise<number> {
    try {
      const { count, error } = await this.db
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())

      if (error) throw error

      return count || 0
    } catch (error) {
      return this.handleError(error, 'SaleRepository.getTransactionCount')
    }
  }

  /**
   * Obtiene ticket medio en un período
   */
  async getAverageTicket(from: Date, to: Date): Promise<number> {
    try {
      const totalRevenue = await this.getTotalRevenue(from, to)
      const transactionCount = await this.getTransactionCount(from, to)

      if (transactionCount === 0) return 0

      return totalRevenue / transactionCount
    } catch (error) {
      return this.handleError(error, 'SaleRepository.getAverageTicket')
    }
  }

  /**
   * Obtiene ventas de un cliente
   */
  async getSalesByCustomer(customerId: string): Promise<Sale[]> {
    try {
      const { data, error } = await this.db
        .from('sales')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'SaleRepository.getSalesByCustomer')
    }
  }
}