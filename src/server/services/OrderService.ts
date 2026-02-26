import { OrderRepository } from '../repositories/OrderRepository'
import { CustomerRepository } from '../repositories/CustomerRepository'
import { ProductRepository } from '../repositories/ProductRepository'
import type {
  Order,
  OrderWithDetails,
  OrderInsert,
  OrderStatus,
  OrderFilters,
  OrderItemInsert,
  Product,
} from '../types/entities'
import {
  NotFoundError,
  ValidationError,
  InsufficientStockError,
  BusinessRuleError,
} from '../utils/errors'
import { logger } from '../utils/logger'
import { ORDER_STATUS_TRANSITIONS, BUSINESS_RULES } from '../config/constants'

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private customerRepo: CustomerRepository,
    private productRepo: ProductRepository
  ) {}

  /**
   * Obtiene todos los pedidos
   */
  async getAll(filters?: OrderFilters): Promise<Order[]> {
    try {
      const orders = await this.orderRepo.findAll(filters)

      logger.info('Pedidos obtenidos', 'OrderService', {
        count: orders.length,
        filters,
      })

      return orders
    } catch (error) {
      logger.error('Error al obtener pedidos', 'OrderService', error)
      throw error
    }
  }

  /**
   * Obtiene un pedido por ID
   */
  async getById(id: string): Promise<OrderWithDetails> {
    try {
      const order = await this.orderRepo.findById(id)

      if (!order) {
        throw new NotFoundError('Pedido', id)
      }

      return order
    } catch (error) {
      logger.error('Error al obtener pedido', 'OrderService', error)
      throw error
    }
  }

  /**
   * Obtiene pedidos pendientes
   */
  async getPending(): Promise<Order[]> {
    try {
      return await this.orderRepo.findPending()
    } catch (error) {
      logger.error('Error al obtener pedidos pendientes', 'OrderService', error)
      throw error
    }
  }

  /**
   * Obtiene pedidos urgentes (pickup en menos de 2 horas)
   */
  async getUrgent(): Promise<Order[]> {
    try {
      return await this.orderRepo.getUrgentOrders()
    } catch (error) {
      logger.error('Error al obtener pedidos urgentes', 'OrderService', error)
      throw error
    }
  }

  /**
   * Crea un nuevo pedido completo
   */
  async createOrder(input: {
    customer_id: string
    channel: 'whatsapp' | 'web' | 'store'
    pickup_datetime: Date
    notes?: string
    items: Array<{
      product_id: string
      quantity: number
    }>
  }): Promise<OrderWithDetails> {
    try {
      // Validar datos de entrada
      this.validateCreateOrderInput(input)

      // Verificar que el cliente existe
      const customer = await this.customerRepo.findById(input.customer_id)
      if (!customer) {
        throw new NotFoundError('Cliente', input.customer_id)
      }

      // Validar disponibilidad de stock de todos los productos y guardarlos
      const products: Product[] = []
      
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

        products.push(product)
      }

      // Calcular el total amount y generar order_number
      const totalAmount = input.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.product_id)
        return sum + (item.quantity * product!.price_per_unit)
      }, 0)

      // Generar número de pedido único (puedes usar una función de la base de datos o generar uno aquí)
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Crear el pedido
      const orderData: OrderInsert = {
        customer_id: input.customer_id,
        channel: input.channel,
        pickup_datetime: input.pickup_datetime.toISOString(),
        notes: input.notes,
        status: 'new',
        order_number: orderNumber,
        total_amount: totalAmount,
      }

      const order = await this.orderRepo.create(orderData)

      // Añadir items con precios actuales
      const itemsWithPrices: OrderItemInsert[] = await Promise.all(
        input.items.map(async (item) => {
          const product = await this.productRepo.findById(item.product_id)
          const unitPrice = product!.price_per_unit
          const subtotal = item.quantity * unitPrice
          
          return {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            subtotal,
          }
        })
      )

      await this.orderRepo.addItems(order.id, itemsWithPrices)

      logger.info('Pedido creado', 'OrderService', {
        orderId: order.id,
        customerId: input.customer_id,
        itemCount: input.items.length,
      })

      // Retornar pedido completo
      return await this.getById(order.id)
    } catch (error) {
      logger.error('Error al crear pedido', 'OrderService', error)
      throw error
    }
  }

  /**
   * Actualiza el estado de un pedido
   */
  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ): Promise<Order> {
    try {
      // Obtener pedido actual
      const currentOrder = await this.getById(orderId)

      // Validar transición de estado
      this.validateStatusTransition(
        currentOrder.status as OrderStatus,
        newStatus
      )

      const updated = await this.orderRepo.updateStatus(orderId, newStatus)

      logger.info('Estado de pedido actualizado', 'OrderService', {
        orderId,
        oldStatus: currentOrder.status,
        newStatus,
      })

      return updated
    } catch (error) {
      logger.error('Error al actualizar estado', 'OrderService', error)
      throw error
    }
  }

  /**
   * Cancela un pedido
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      if (!reason || reason.trim().length < 5) {
        throw new ValidationError(
          'La razón de cancelación debe tener al menos 5 caracteres'
        )
      }

      const cancelled = await this.orderRepo.cancel(orderId, reason)

      logger.info('Pedido cancelado', 'OrderService', { orderId, reason })

      return cancelled
    } catch (error) {
      logger.error('Error al cancelar pedido', 'OrderService', error)
      throw error
    }
  }

  /**
   * Obtiene pedidos del día
   */
  async getTodayOrders(): Promise<Order[]> {
    try {
      return await this.orderRepo.getTodayOrders()
    } catch (error) {
      logger.error('Error al obtener pedidos del día', 'OrderService', error)
      throw error
    }
  }

  /**
   * Obtiene pedidos de un cliente
   */
  async getCustomerOrders(
    customerId: string,
    limit = 20
  ): Promise<Order[]> {
    try {
      return await this.orderRepo.findByCustomer(customerId, limit)
    } catch (error) {
      logger.error('Error al obtener pedidos del cliente', 'OrderService', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private validateCreateOrderInput(input: {
    items: Array<{ product_id: string; quantity: number }>
    pickup_datetime: Date
  }): void {
    if (input.items.length === 0) {
      throw new ValidationError('El pedido debe tener al menos un producto')
    }

    if (input.items.length > BUSINESS_RULES.ORDER.MAX_ITEMS) {
      throw new ValidationError(
        `El pedido no puede tener más de ${BUSINESS_RULES.ORDER.MAX_ITEMS} productos`
      )
    }

    // Validar que la fecha de recogida sea futura
    if (input.pickup_datetime <= new Date()) {
      throw new ValidationError('La fecha de recogida debe ser en el futuro')
    }

    // Validar cantidades
    input.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        throw new ValidationError(
          `La cantidad del item ${index + 1} debe ser mayor a 0`
        )
      }
    })
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus]

    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BusinessRuleError(
        `No se puede cambiar el estado de "${currentStatus}" a "${newStatus}"`
      )
    }
  }
}