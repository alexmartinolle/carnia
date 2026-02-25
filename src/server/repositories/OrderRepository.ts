import { BaseRepository } from './base/BaseRepository'
import type {
  Order,
  OrderWithDetails,
  OrderInsert,
  OrderUpdate,
  OrderItem,
  OrderItemInsert,
  OrderFilters,
  OrderStatus,
} from '../types/entities'

export class OrderRepository extends BaseRepository {
  /**
   * Obtiene todos los pedidos con filtros
   */
  async findAll(filters?: OrderFilters): Promise<Order[]> {
    try {
      let query = this.db.from('orders').select('*')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      if (filters?.channel) {
        query = query.eq('channel', filters.channel)
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString())
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString())
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
      return this.handleError(error, 'OrderRepository.findAll')
    }
  }

  /**
   * Obtiene un pedido con detalles completos
   */
  async findById(id: string): Promise<OrderWithDetails | null> {
    try {
      const { data, error } = await this.db
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      return data as unknown as OrderWithDetails
    } catch (error) {
      return this.handleError(error, 'OrderRepository.findById')
    }
  }

  /**
   * Obtiene pedidos de un cliente
   */
  async findByCustomer(customerId: string, limit = 20): Promise<Order[]> {
    try {
      const { data, error } = await this.db
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'OrderRepository.findByCustomer')
    }
  }

  /**
   * Obtiene pedidos pendientes
   */
  async findPending(): Promise<Order[]> {
    try {
      const { data, error } = await this.db
        .from('orders')
        .select('*')
        .in('status', ['new', 'confirmed', 'ready'])
        .order('pickup_datetime', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'OrderRepository.findPending')
    }
  }

  /**
   * Crea un pedido
   */
  async create(data: OrderInsert): Promise<Order> {
    try {
      const customerExists = await this.exists('customers', data.customer_id)
      if (!customerExists) {
        throw new Error('El cliente especificado no existe')
      }

      const { data: order, error } = await this.db
        .from('orders')
        .insert({
          ...data,
          total_amount: 0, // Se actualizará con los items
        })
        .select()
        .single()

      if (error) throw error

      return this.assertExists(order, 'Pedido creado')
    } catch (error) {
      return this.handleError(error, 'OrderRepository.create')
    }
  }

  /**
   * Añade items a un pedido
   */
  async addItems(orderId: string, items: OrderItemInsert[]): Promise<void> {
    try {
      await this.findById(orderId).then((order) =>
        this.assertExists(order, 'Pedido', orderId)
      )

      // Validar stock de todos los productos
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

      // Insertar items (triggers calcularán subtotales y total)
      const { error: insertError } = await this.db
        .from('order_items')
        .insert(
          items.map((item) => ({
            ...item,
            order_id: orderId,
          }))
        )

      if (insertError) throw insertError
    } catch (error) {
      return this.handleError(error, 'OrderRepository.addItems')
    }
  }

  /**
   * Actualiza el estado de un pedido
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const currentOrder = await this.findById(id)
      this.assertExists(currentOrder, 'Pedido', id)

      const { data, error } = await this.db
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(data, 'Pedido actualizado')
    } catch (error) {
      return this.handleError(error, 'OrderRepository.updateStatus')
    }
  }

  /**
   * Cancela un pedido
   */
  async cancel(id: string, reason: string): Promise<Order> {
    try {
      const currentOrder = await this.findById(id)
      this.assertExists(currentOrder, 'Pedido', id)

      if (currentOrder!.status === 'completed') {
        throw new Error('No se puede cancelar un pedido completado')
      }

      if (currentOrder!.status === 'cancelled') {
        throw new Error('El pedido ya está cancelado')
      }

      const { data, error } = await this.db
        .from('orders')
        .update({
          status: 'cancelled',
          notes: currentOrder!.notes
            ? `${currentOrder!.notes}\n\nCANCELADO: ${reason}`
            : `CANCELADO: ${reason}`,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(data, 'Pedido cancelado')
    } catch (error) {
      return this.handleError(error, 'OrderRepository.cancel')
    }
  }

  /**
   * Obtiene pedidos del día
   */
  async getTodayOrders(): Promise<Order[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await this.db
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'OrderRepository.getTodayOrders')
    }
  }

  /**
   * Obtiene pedidos urgentes (pickup en menos de 2 horas)
   */
  async getUrgentOrders(): Promise<Order[]> {
    try {
      const twoHoursFromNow = new Date()
      twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)

      const { data, error } = await this.db
        .from('orders')
        .select('*')
        .in('status', ['new', 'confirmed'])
        .lte('pickup_datetime', twoHoursFromNow.toISOString())
        .order('pickup_datetime', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'OrderRepository.getUrgentOrders')
    }
  }

  /**
   * Obtiene items de un pedido
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await this.db
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'OrderRepository.getOrderItems')
    }
  }

  /**
   * Actualiza un pedido
   */
  async update(id: string, data: OrderUpdate): Promise<Order> {
    try {
      await this.findById(id).then((order) =>
        this.assertExists(order, 'Pedido', id)
      )

      const { data: updated, error } = await this.db
        .from('orders')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(updated, 'Pedido actualizado')
    } catch (error) {
      return this.handleError(error, 'OrderRepository.update')
    }
  }
}