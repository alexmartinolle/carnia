import { BaseRepository } from './base/BaseRepository'
import type {
  InventoryMovement,
  InventoryMovementInsert,
  InventoryFilters,
  Product,
} from '../types/entities'

export class InventoryRepository extends BaseRepository {
  /**
   * Obtiene movimientos con filtros
   */
  async getMovements(filters?: InventoryFilters): Promise<InventoryMovement[]> {
    try {
      let query = this.db.from('inventory_movements').select('*')

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId)
      }

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.reason) {
        query = query.eq('reason', filters.reason)
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString())
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString())
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.getMovements')
    }
  }

  /**
   * Obtiene movimientos de un producto
   */
  async getMovementsByProduct(
    productId: string,
    limit = 50
  ): Promise<InventoryMovement[]> {
    try {
      const { data, error } = await this.db
        .from('inventory_movements')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(
        error,
        'InventoryRepository.getMovementsByProduct'
      )
    }
  }

  /**
   * Registra un movimiento de inventario
   * Usa la función de base de datos register_inventory_movement
   */
  async registerMovement(
    data: Omit<InventoryMovementInsert, 'stock_before' | 'stock_after'>
  ): Promise<InventoryMovement> {
    try {
      this.assertPositive(data.quantity, 'Cantidad')

      // Llamar a la función de base de datos que maneja todo
      const { data: movementId, error } = await this.db.rpc(
        'register_inventory_movement',
        {
          p_product_id: data.product_id,
          p_movement_type: data.type,
          p_quantity: data.quantity,
          p_reason: data.reason,
          p_notes: data.notes || null || undefined,
          p_created_by: data.created_by || null || undefined,
        }
      )

      if (error) throw error

      // Obtener el movimiento creado
      const { data: movement, error: fetchError } = await this.db
        .from('inventory_movements')
        .select('*')
        .eq('id', movementId)
        .single()

      if (fetchError) throw fetchError

      return this.assertExists(movement, 'Movimiento registrado')
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.registerMovement')
    }
  }

  /**
   * Obtiene productos con stock bajo
   */
  async getLowStockProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)

      if (error) throw error

      // Filtrar en JavaScript
      const lowStock = (data || [])
        .filter((p) => p.stock_quantity < p.stock_minimum)
        .sort((a, b) => a.stock_quantity - b.stock_quantity)

      return lowStock
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.getLowStockProducts')
    }
  }

  /**
   * Obtiene productos sin stock
   */
  async getOutOfStockProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('*')
        .eq('stock_quantity', 0)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(
        error,
        'InventoryRepository.getOutOfStockProducts'
      )
    }
  }

  /**
   * Calcula el valor total del inventario
   */
  async getStockValue(): Promise<number> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('stock_quantity, price_per_unit')
        .eq('is_active', true)
        .is('deleted_at', null)

      if (error) throw error

      const total =
        data?.reduce(
          (sum, product) =>
            sum + product.stock_quantity * product.price_per_unit,
          0
        ) || 0

      return total
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.getStockValue')
    }
  }

  /**
   * Obtiene movimientos recientes (últimos N)
   */
  async getRecentMovements(limit = 20): Promise<InventoryMovement[]> {
    try {
      const { data, error } = await this.db
        .from('inventory_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.getRecentMovements')
    }
  }

  /**
   * Obtiene historial de stock de un producto
   */
  async getStockHistory(
    productId: string,
    days = 30
  ): Promise <
    Array<{
      date: string
      stock_after: number
      movement_type: string
      quantity: number
    }>
  > {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.db
        .from('inventory_movements')
        .select('created_at, stock_after, type, quantity')
        .eq('product_id', productId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      return (
        data?.map((row) => ({
          date: row.created_at as string,
          stock_after: row.stock_after,
          movement_type: row.type,
          quantity: row.quantity,
        })) || []
      )
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.getStockHistory')
    }
  }

  /**
   * Obtiene total de entradas en un período
   */
  async getTotalEntries(from: Date, to: Date): Promise<number> {
    try {
      const { data, error } = await this.db
        .from('inventory_movements')
        .select('quantity')
        .eq('type', 'in')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())

      if (error) throw error

      const total = data?.reduce((sum, m) => sum + m.quantity, 0) || 0

      return total
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.getTotalEntries')
    }
  }

  /**
   * Obtiene total de salidas en un período
   */
  async getTotalExits(from: Date, to: Date): Promise<number> {
    try {
      const { data, error } = await this.db
        .from('inventory_movements')
        .select('quantity')
        .eq('type', 'out')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())

      if (error) throw error

      const total =
        data?.reduce((sum, m) => sum + Math.abs(m.quantity), 0) || 0

      return total
    } catch (error) {
      return this.handleError(error, 'InventoryRepository.getTotalExits')
    }
  }
}