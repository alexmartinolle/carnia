import { BaseRepository } from './base/BaseRepository'
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
  CustomerFilters,
  Order,
} from '../types/entities'

export class CustomerRepository extends BaseRepository {
  /**
   * Obtiene todos los clientes con filtros
   */
  async findAll(filters?: CustomerFilters): Promise<Customer[]> {
    try {
      let query = this.db.from('customers').select('*')

      if (filters?.segment) {
        query = query.eq('segment', filters.segment)
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        )
      }

      if (filters?.hasOrders !== undefined) {
        if (filters.hasOrders) {
          query = query.gt('order_count', 0)
        } else {
          query = query.eq('order_count', 0)
        }
      }

      if (filters?.inactiveSince) {
        query = query.lt('last_order_at', filters.inactiveSince.toISOString())
      }

      query = query.order('total_spent', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.findAll')
    }
  }

  /**
   * Obtiene un cliente por ID
   */
  async findById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await this.db
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      return data
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.findById')
    }
  }

  /**
   * Obtiene un cliente por teléfono
   */
  async findByPhone(phone: string): Promise<Customer | null> {
    try {
      const { data, error } = await this.db
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()

      if (error) throw error

      return data
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.findByPhone')
    }
  }

  /**
   * Crea un cliente
   */
  async create(data: CustomerInsert): Promise<Customer> {
    try {
      const existing = await this.findByPhone(data.phone)

      if (existing) {
        throw new Error('Ya existe un cliente con ese número de teléfono')
      }

      const { data: customer, error } = await this.db
        .from('customers')
        .insert(data)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(customer, 'Cliente creado')
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.create')
    }
  }

  /**
   * Actualiza un cliente
   */
  async update(id: string, data: CustomerUpdate): Promise<Customer> {
    try {
      await this.findById(id).then((customer) =>
        this.assertExists(customer, 'Cliente', id)
      )

      if (data.phone) {
        const { data: existing } = await this.db
          .from('customers')
          .select('id')
          .eq('phone', data.phone)
          .neq('id', id)
          .maybeSingle()

        if (existing) {
          throw new Error('Ya existe otro cliente con ese teléfono')
        }
      }

      const { data: updated, error } = await this.db
        .from('customers')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(updated, 'Cliente actualizado')
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.update')
    }
  }

  /**
   * Obtiene los mejores clientes
   */
  async getTopCustomers(limit = 10): Promise<Customer[]> {
    try {
      const { data, error } = await this.db
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.getTopCustomers')
    }
  }

  /**
   * Obtiene clientes inactivos
   */
  async getInactiveCustomers(daysSince = 90): Promise<Customer[]> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysSince)

      const { data, error } = await this.db
        .from('customers')
        .select('*')
        .lt('last_order_at', cutoffDate.toISOString())
        .order('last_order_at', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.getInactiveCustomers')
    }
  }

  /**
   * Obtiene historial de pedidos
   */
  async getOrderHistory(customerId: string, limit = 20): Promise<Order[]> {
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
      return this.handleError(error, 'CustomerRepository.getOrderHistory')
    }
  }

  /**
   * Búsqueda de clientes
   */
  async search(query: string, limit = 20): Promise<Customer[]> {
    try {
      const { data, error } = await this.db
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'CustomerRepository.search')
    }
  }
}