import { CustomerRepository } from '../repositories/CustomerRepository'
import { OrderRepository } from '../repositories/OrderRepository'
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
  CustomerFilters,
  CustomerSegment,
  CustomerMetrics,
} from '../types/entities'
import { NotFoundError, ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'
import { BUSINESS_RULES } from '../config/constants'
import { daysBetween } from '../utils/helpers'

export class CustomerService {
  constructor(
    private customerRepo: CustomerRepository,
    private orderRepo: OrderRepository
  ) {}

  /**
   * Obtiene todos los clientes
   */
  async getAll(filters?: CustomerFilters): Promise<Customer[]> {
    try {
      const customers = await this.customerRepo.findAll(filters)

      logger.info('Clientes obtenidos', 'CustomerService', {
        count: customers.length,
        filters,
      })

      return customers
    } catch (error) {
      logger.error('Error al obtener clientes', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Obtiene un cliente por ID
   */
  async getById(id: string): Promise<Customer> {
    try {
      const customer = await this.customerRepo.findById(id)

      if (!customer) {
        throw new NotFoundError('Cliente', id)
      }

      return customer
    } catch (error) {
      logger.error('Error al obtener cliente', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Obtiene un cliente por teléfono
   */
  async getByPhone(phone: string): Promise<Customer | null> {
    try {
      return await this.customerRepo.findByPhone(phone)
    } catch (error) {
      logger.error('Error al obtener cliente por teléfono', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Crea un nuevo cliente o lo obtiene si ya existe
   */
  async createOrGetByPhone(
    phone: string,
    name?: string,
    email?: string
  ): Promise<Customer> {
    try {
      // Buscar cliente existente
      const existing = await this.getByPhone(phone)

      if (existing) {
        logger.info('Cliente existente encontrado', 'CustomerService', {
          customerId: existing.id,
        })
        return existing
      }

      // Crear nuevo cliente
      if (!name) {
        throw new ValidationError(
          'El nombre es requerido para crear un nuevo cliente'
        )
      }

      const customer = await this.customerRepo.create({
        name,
        phone,
        email,
      })

      logger.info('Nuevo cliente creado', 'CustomerService', {
        customerId: customer.id,
      })

      return customer
    } catch (error) {
      logger.error('Error al crear u obtener cliente', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Crea un nuevo cliente
   */
  async create(data: CustomerInsert): Promise<Customer> {
    try {
      this.validateCustomerData(data)

      const customer = await this.customerRepo.create(data)

      logger.info('Cliente creado', 'CustomerService', {
        customerId: customer.id,
        name: customer.name,
      })

      return customer
    } catch (error) {
      logger.error('Error al crear cliente', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Actualiza un cliente
   */
  async update(id: string, data: CustomerUpdate): Promise<Customer> {
    try {
      await this.getById(id)

      if (data.phone || data.email || data.name) {
        this.validateCustomerData(data as CustomerInsert)
      }

      const updated = await this.customerRepo.update(id, data)

      logger.info('Cliente actualizado', 'CustomerService', {
        customerId: id,
      })

      return updated
    } catch (error) {
      logger.error('Error al actualizar cliente', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Obtiene los mejores clientes
   */
  async getTopCustomers(limit = 10): Promise<Customer[]> {
    try {
      return await this.customerRepo.getTopCustomers(limit)
    } catch (error) {
      logger.error('Error al obtener top clientes', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Obtiene clientes inactivos
   */
  async getInactiveCustomers(daysSince = 90): Promise<Customer[]> {
    try {
      return await this.customerRepo.getInactiveCustomers(daysSince)
    } catch (error) {
      logger.error('Error al obtener clientes inactivos', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Obtiene métricas de un cliente
   */
  async getCustomerMetrics(customerId: string): Promise<CustomerMetrics> {
    try {
      const customer = await this.getById(customerId)

      const avgOrderValue =
        customer.order_count > 0
          ? customer.total_spent / customer.order_count
          : 0

      const daysSinceLastOrder = customer.last_order_at
        ? daysBetween(new Date(), customer.last_order_at)
        : null

      const lifetimeValue = customer.total_spent

      // Calcular frecuencia (pedidos por mes)
      const firstOrderDate = customer.first_order_at
        ? new Date(customer.first_order_at)
        : new Date()
      const monthsSinceFirst =
        daysBetween(new Date(), firstOrderDate) / 30
      const frequency =
        monthsSinceFirst > 0 ? customer.order_count / monthsSinceFirst : 0

      return {
        customer,
        avgOrderValue,
        daysSinceLastOrder,
        lifetimeValue,
        frequency,
      }
    } catch (error) {
      logger.error('Error al obtener métricas', 'CustomerService', error)
      throw error
    }
  }

  /**
   * Busca clientes
   */
  async search(query: string, limit = 20): Promise<Customer[]> {
    try {
      return await this.customerRepo.search(query, limit)
    } catch (error) {
      logger.error('Error al buscar clientes', 'CustomerService', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private validateCustomerData(data: CustomerInsert | CustomerUpdate): void {
    if (data.name) {
      if (data.name.trim().length < BUSINESS_RULES.VALIDATION.MIN_NAME_LENGTH) {
        throw new ValidationError(
          `El nombre debe tener al menos ${BUSINESS_RULES.VALIDATION.MIN_NAME_LENGTH} caracteres`
        )
      }
    }

    if (data.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/
      if (!phoneRegex.test(data.phone)) {
        throw new ValidationError(
          'Formato de teléfono inválido. Usar formato internacional (+34...)'
        )
      }
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new ValidationError('Formato de email inválido')
      }
    }
  }
}