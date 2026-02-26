import { ProductRepository } from '../repositories/ProductRepository'
import { InventoryRepository } from '../repositories/InventoryRepository'
import type {
  Product,
  ProductWithCategory,
  ProductInsert,
  ProductUpdate,
  ProductFilters,
  LowStockProduct,
  StockStatus,
  UrgencyLevel,
} from '../types/entities'
import { NotFoundError, ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'
import { BUSINESS_RULES } from '../config/constants'

export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private inventoryRepo: InventoryRepository
  ) {}

  /**
   * Obtiene todos los productos
   */
  async getAll(filters?: ProductFilters): Promise<ProductWithCategory[]> {
    try {
      const products = await this.productRepo.findAll(filters)

      logger.info('Productos obtenidos', 'ProductService', {
        count: products.length,
        filters,
      })

      return products
    } catch (error) {
      logger.error('Error al obtener productos', 'ProductService', error)
      throw error
    }
  }

  /**
   * Obtiene un producto por ID
   */
  async getById(id: string): Promise<ProductWithCategory> {
    try {
      const product = await this.productRepo.findById(id)

      if (!product) {
        throw new NotFoundError('Producto', id)
      }

      return product
    } catch (error) {
      logger.error('Error al obtener producto', 'ProductService', error)
      throw error
    }
  }

  /**
   * Crea un nuevo producto
   */
  async create(data: ProductInsert): Promise<Product> {
    try {
      // Validaciones de negocio
      this.validateProductData(data)

      const product = await this.productRepo.create(data)

      // Log de advertencia si el stock está bajo
      if (product.stock_quantity < product.stock_minimum) {
        logger.warn('Producto creado con stock bajo', 'ProductService', {
          productId: product.id,
          stock: product.stock_quantity,
          minimum: product.stock_minimum,
        })
      }

      logger.info('Producto creado', 'ProductService', {
        productId: product.id,
        name: product.name,
      })

      return product
    } catch (error) {
      logger.error('Error al crear producto', 'ProductService', error)
      throw error
    }
  }

  /**
   * Actualiza un producto
   */
  async update(id: string, data: ProductUpdate): Promise<Product> {
    try {
      // Verificar que existe
      await this.getById(id)

      // Validar datos
      if (Object.keys(data).length > 0) {
        this.validateProductData(data as ProductInsert)
      }

      // Log si cambia el precio
      if (data.price_per_unit !== undefined) {
        logger.info('Cambio de precio detectado', 'ProductService', {
          productId: id,
          newPrice: data.price_per_unit,
        })
      }

      const updated = await this.productRepo.update(id, data)

      logger.info('Producto actualizado', 'ProductService', {
        productId: id,
      })

      return updated
    } catch (error) {
      logger.error('Error al actualizar producto', 'ProductService', error)
      throw error
    }
  }

  /**
   * Elimina un producto (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await this.productRepo.softDelete(id)

      logger.info('Producto eliminado', 'ProductService', { productId: id })
    } catch (error) {
      logger.error('Error al eliminar producto', 'ProductService', error)
      throw error
    }
  }

  /**
   * Obtiene productos con stock bajo
   */
  async getLowStock(): Promise<LowStockProduct[]> {
    try {
      const products = await this.productRepo.findLowStock()

      // Enriquecer con información adicional
      const enriched: LowStockProduct[] = products.map((product) => ({
        ...product,
        urgencyLevel: this.calculateUrgency(
          product.stock_quantity,
          product.stock_minimum
        ),
        suggestedOrderQty: this.calculateSuggestedReorderQty(product),
        stockDeficit: product.stock_minimum - product.stock_quantity,
      }))

      // Ordenar por urgencia
      enriched.sort((a, b) => {
        const urgencyOrder: Record<UrgencyLevel, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        }
        return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]
      })

      return enriched
    } catch (error) {
      logger.error('Error al obtener productos con stock bajo', 'ProductService', error)
      throw error
    }
  }

  /**
   * Ajusta el stock de un producto manualmente
   */
  async adjustStock(
    productId: string,
    newStock: number,
    reason: 'purchase' | 'waste' | 'correction' | 'other',
    notes?: string,
    userId?: string
  ): Promise<Product> {
    try {
      if (newStock < 0) {
        throw new ValidationError('El stock no puede ser negativo')
      }

      // Obtener stock actual
      const currentStock = await this.productRepo.getStock(productId)

      // Determinar tipo de movimiento
      let type: 'in' | 'out' | 'adjustment' = 'adjustment'
      if (newStock > currentStock) {
        type = 'in'
      } else if (newStock < currentStock) {
        type = 'out'
      }

      // Registrar movimiento en inventario
      await this.inventoryRepo.registerMovement({
        product_id: productId,
        type,
        quantity: Math.abs(newStock - currentStock),
        reason,
        notes,
        created_by: userId,
      })

      logger.info('Stock ajustado', 'ProductService', {
        productId,
        oldStock: currentStock,
        newStock,
        reason,
      })

      // Obtener producto actualizado
      const updated = await this.productRepo.findById(productId)
      return updated as Product
    } catch (error) {
      logger.error('Error al ajustar stock', 'ProductService', error)
      throw error
    }
  }

  /**
   * Busca productos
   */
  async search(query: string, limit = 20): Promise<ProductWithCategory[]> {
    try {
      return await this.productRepo.search(query, limit)
    } catch (error) {
      logger.error('Error al buscar productos', 'ProductService', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de un producto
   */
  async getProductStats(productId: string): Promise<{
    totalSold: number
    timesOrdered: number
    lastSaleDate: string | null
  }> {
    try {
      return await this.productRepo.getProductStats(productId)
    } catch (error) {
      logger.error('Error al obtener estadísticas', 'ProductService', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private validateProductData(data: ProductInsert | ProductUpdate): void {
    if (data.name) {
      if (data.name.trim().length < BUSINESS_RULES.VALIDATION.MIN_NAME_LENGTH) {
        throw new ValidationError(
          `El nombre debe tener al menos ${BUSINESS_RULES.VALIDATION.MIN_NAME_LENGTH} caracteres`
        )
      }
    }

    if (data.price_per_unit !== undefined && data.price_per_unit <= 0) {
      throw new ValidationError('El precio debe ser mayor a 0')
    }

    if (data.stock_quantity !== undefined && data.stock_quantity < 0) {
      throw new ValidationError('El stock no puede ser negativo')
    }

    if (data.profit_margin !== undefined) {
      if (data.profit_margin! < 0 || data.profit_margin! > 100) {
        throw new ValidationError('El margen debe estar entre 0 y 100%')
      }
    }
  }

  private calculateStockStatus(
    current: number,
    minimum: number
  ): StockStatus {
    if (current === 0) return 'out'
    if (current < minimum * BUSINESS_RULES.STOCK.CRITICAL_STOCK_MULTIPLIER)
      return 'critical'
    if (current < minimum * BUSINESS_RULES.STOCK.LOW_STOCK_MULTIPLIER)
      return 'low'
    return 'ok'
  }

  private calculateSuggestedReorderQty(product: Product): number {
    if (product.stock_quantity === 0) {
      return product.stock_minimum * 2
    }
    return Math.max(
      Math.ceil(
        product.stock_minimum * BUSINESS_RULES.STOCK.SUGGESTED_REORDER_MULTIPLIER -
          product.stock_quantity
      ),
      0
    )
  }

  private calculateUrgency(
    current: number,
    minimum: number
  ): UrgencyLevel {
    if (current === 0) return 'critical'
    if (current < minimum * 0.5) return 'high'
    if (current < minimum * 0.75) return 'medium'
    return 'low'
  }
}