import { InventoryRepository } from '../repositories/InventoryRepository'
import { ProductRepository } from '../repositories/ProductRepository'
import type {
  InventoryMovement,
  Product,
  InventoryFilters,
  MovementType,
  MovementReason,
  InventoryReport,
  LowStockProduct,
} from '../types/entities'
import { ValidationError, NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'

export class InventoryService {
  constructor(
    private inventoryRepo: InventoryRepository,
    private productRepo: ProductRepository
  ) {}

  /**
   * Obtiene movimientos de inventario
   */
  async getMovements(filters?: InventoryFilters): Promise<InventoryMovement[]> {
    try {
      const movements = await this.inventoryRepo.getMovements(filters)

      logger.info('Movimientos obtenidos', 'InventoryService', {
        count: movements.length,
        filters,
      })

      return movements
    } catch (error) {
      logger.error('Error al obtener movimientos', 'InventoryService', error)
      throw error
    }
  }

  /**
   * Obtiene movimientos de un producto
   */
  async getProductMovements(
    productId: string,
    limit = 50
  ): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryRepo.getMovementsByProduct(productId, limit)
    } catch (error) {
      logger.error('Error al obtener movimientos del producto', 'InventoryService', error)
      throw error
    }
  }

  /**
   * Registra un movimiento manual de inventario
   */
  async registerManualMovement(
    productId: string,
    type: MovementType,
    quantity: number,
    reason: MovementReason,
    notes?: string,
    userId?: string
  ): Promise<InventoryMovement> {
    try {
      // Validar datos
      if (quantity <= 0) {
        throw new ValidationError('La cantidad debe ser mayor a 0')
      }

      // Verificar que el producto existe
      const product = await this.productRepo.findById(productId)
      if (!product) {
        throw new NotFoundError('Producto', productId)
      }

      // Si es salida, verificar stock
      if (type === 'out') {
        if (product.stock_quantity < quantity) {
          throw new ValidationError(
            `Stock insuficiente. Disponible: ${product.stock_quantity}, Solicitado: ${quantity}`
          )
        }
      }

      const movement = await this.inventoryRepo.registerMovement({
        product_id: productId,
        type,
        quantity,
        reason,
        notes,
        created_by: userId,
      })

      logger.info('Movimiento registrado', 'InventoryService', {
        movementId: movement.id,
        productId,
        type,
        quantity,
      })

      return movement
    } catch (error) {
      logger.error('Error al registrar movimiento', 'InventoryService', error)
      throw error
    }
  }

  /**
   * Obtiene alertas de inventario
   */
  async getAlerts(): Promise<{
    lowStock: Product[]
    outOfStock: Product[]
    critical: Product[]
  }> {
    try {
      const lowStockProducts = await this.inventoryRepo.getLowStockProducts()
      const outOfStockProducts =
        await this.inventoryRepo.getOutOfStockProducts()

      const outOfStock = lowStockProducts.filter((p) => p.stock_quantity === 0)
      const critical = lowStockProducts.filter(
        (p) => p.stock_quantity > 0 && p.stock_quantity < p.stock_minimum * 0.5
      )
      const lowStock = lowStockProducts.filter(
        (p) =>
          p.stock_quantity >= p.stock_minimum * 0.5 &&
          p.stock_quantity < p.stock_minimum
      )

      return {
        lowStock,
        outOfStock,
        critical,
      }
    } catch (error) {
      logger.error('Error al obtener alertas', 'InventoryService', error)
      throw error
    }
  }

  /**
   * Genera reporte de inventario
   */
  async getInventoryReport(): Promise<InventoryReport> {
    try {
      const stockValue = await this.inventoryRepo.getStockValue()
      const lowStockProducts = await this.inventoryRepo.getLowStockProducts()
      const outOfStockProducts =
        await this.inventoryRepo.getOutOfStockProducts()

      // Obtener todos los productos activos
      const allProducts = await this.productRepo.findAll({ isActive: true })

      const totalProducts = allProducts.length

      // Enriquecer productos con stock bajo
      const lowStock: LowStockProduct[] = lowStockProducts.map((product) => ({
        ...product,
        urgencyLevel: this.calculateUrgency(
          product.stock_quantity,
          product.stock_minimum
        ),
        suggestedOrderQty: this.calculateSuggestedReorderQty(product),
        stockDeficit: product.stock_minimum - product.stock_quantity,
      }))

      // Agrupar por categoría
      const byCategory = allProducts.reduce(
        (acc, product) => {
          const categoryId = product.category_id
          const categoryName = product.category?.name || 'Sin categoría'

          if (!acc[categoryId]) {
            acc[categoryId] = {
              categoryId,
              categoryName,
              productCount: 0,
              totalValue: 0,
            }
          }

          acc[categoryId].productCount++
          acc[categoryId].totalValue +=
            product.stock_quantity * product.price_per_unit

          return acc
        },
        {} as Record <
          string,
          {
            categoryId: string
            categoryName: string
            productCount: number
            totalValue: number
          }
        >
      )

      return {
        summary: {
          totalValue: stockValue,
          totalProducts,
          lowStockProducts: lowStockProducts.length,
          outOfStockProducts: outOfStockProducts.length,
        },
        byCategory: Object.values(byCategory),
        lowStock,
        outOfStock: outOfStockProducts,
      }
    } catch (error) {
      logger.error('Error al generar reporte', 'InventoryService', error)
      throw error
    }
  }

  /**
   * Obtiene valor total del inventario
   */
  async getStockValue(): Promise<number> {
    try {
      return await this.inventoryRepo.getStockValue()
    } catch (error) {
      logger.error('Error al obtener valor de stock', 'InventoryService', error)
      throw error
    }
  }

  /**
   * Obtiene historial de stock de un producto
   */
  async getStockHistory(productId: string, days = 30): Promise <
    Array<{
      date: string
      stock_after: number
      movement_type: string
      quantity: number
    }>
  > {
    try {
      return await this.inventoryRepo.getStockHistory(productId, days)
    } catch (error) {
      logger.error('Error al obtener historial de stock', 'InventoryService', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private calculateUrgency(
    current: number,
    minimum: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (current === 0) return 'critical'
    if (current < minimum * 0.5) return 'high'
    if (current < minimum * 0.75) return 'medium'
    return 'low'
  }

  private calculateSuggestedReorderQty(product: Product): number {
    if (product.stock_quantity === 0) {
      return product.stock_minimum * 2
    }
    return Math.max(
      Math.ceil(product.stock_minimum * 1.5 - product.stock_quantity),
      0
    )
  }
}