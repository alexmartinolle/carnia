import { BaseRepository } from './base/BaseRepository'
import type {
  Product,
  ProductWithCategory,
  ProductInsert,
  ProductUpdate,
  ProductFilters,
} from '../types/entities'

export class ProductRepository extends BaseRepository {
  /**
   * Obtiene todos los productos con filtros
   */
  async findAll(filters?: ProductFilters): Promise<ProductWithCategory[]> {
    try {
      let query = this.db
        .from('products')
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .is('deleted_at', null)

      // Aplicar filtros
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      if (filters?.hasLowStock) {
        // Filtrar productos con stock bajo
        const { data: allProducts } = await query

        const lowStock =
          allProducts?.filter(
            (p) => p.stock_quantity < p.stock_minimum
          ) || []

        return lowStock as unknown as ProductWithCategory[]
      }

      if (filters?.priceMin !== undefined) {
        query = query.gte('price_per_unit', filters.priceMin)
      }

      if (filters?.priceMax !== undefined) {
        query = query.lte('price_per_unit', filters.priceMax)
      }

      query = query.order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      return (data as unknown as ProductWithCategory[]) || []
    } catch (error) {
      return this.handleError(error, 'ProductRepository.findAll')
    }
  }

  /**
   * Obtiene un producto por ID
   */
  async findById(id: string): Promise<ProductWithCategory | null> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle()

      if (error) throw error

      return data as unknown as ProductWithCategory
    } catch (error) {
      return this.handleError(error, 'ProductRepository.findById')
    }
  }

  /**
   * Obtiene productos con stock bajo
   */
  async findLowStock(): Promise<Product[]> {
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
      return this.handleError(error, 'ProductRepository.findLowStock')
    }
  }

  /**
   * Crea un producto
   */
  async create(data: ProductInsert): Promise<Product> {
    try {
      // Verificar que la categoría existe
      const categoryExists = await this.exists('categories', data.category_id)
      if (!categoryExists) {
        throw new Error('La categoría especificada no existe')
      }

      // Verificar nombre único
      const { data: existing } = await this.db
        .from('products')
        .select('id')
        .ilike('name', data.name)
        .is('deleted_at', null)
        .maybeSingle()

      if (existing) {
        throw new Error('Ya existe un producto con ese nombre')
      }

      const { data: product, error } = await this.db
        .from('products')
        .insert(data)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(product, 'Producto creado')
    } catch (error) {
      return this.handleError(error, 'ProductRepository.create')
    }
  }

  /**
   * Actualiza un producto
   */
  async update(id: string, data: ProductUpdate): Promise<Product> {
    try {
      await this.findById(id).then((product) =>
        this.assertExists(product, 'Producto', id)
      )

      if (data.name) {
        const { data: existing } = await this.db
          .from('products')
          .select('id')
          .ilike('name', data.name)
          .neq('id', id)
          .is('deleted_at', null)
          .maybeSingle()

        if (existing) {
          throw new Error('Ya existe otro producto con ese nombre')
        }
      }

      const { data: updated, error } = await this.db
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(updated, 'Producto actualizado')
    } catch (error) {
      return this.handleError(error, 'ProductRepository.update')
    }
  }

  /**
   * Elimina un producto (soft delete)
   */
  async softDelete(id: string): Promise<void> {
    try {
      await this.findById(id).then((product) =>
        this.assertExists(product, 'Producto', id)
      )

      const { error } = await this.db
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      return this.handleError(error, 'ProductRepository.softDelete')
    }
  }

  /**
   * Actualiza el stock de un producto
   */
  async updateStock(id: string, newStock: number): Promise<Product> {
    try {
      this.assertNonNegative(newStock, 'Stock')

      const { data, error } = await this.db
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(data, 'Producto actualizado')
    } catch (error) {
      return this.handleError(error, 'ProductRepository.updateStock')
    }
  }

  /**
   * Obtiene el stock actual
   */
  async getStock(id: string): Promise<number> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select('stock_quantity')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error

      return this.assertExists(data, 'Producto', id).stock_quantity
    } catch (error) {
      return this.handleError(error, 'ProductRepository.getStock')
    }
  }

  /**
   * Verifica disponibilidad de stock
   */
  async hasStock(id: string, requiredQuantity: number): Promise<boolean> {
    const currentStock = await this.getStock(id)
    return currentStock >= requiredQuantity
  }

  /**
   * Búsqueda de productos
   */
  async search(query: string, limit = 20): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await this.db
        .from('products')
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .ilike('name', `%${query}%`)
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(limit)

      if (error) throw error

      return (data as unknown as ProductWithCategory[]) || []
    } catch (error) {
      return this.handleError(error, 'ProductRepository.search')
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
      const { data: salesData, error: salesError } = await this.db
        .from('sales_items')
        .select('quantity, created_at')
        .eq('product_id', productId)

      if (salesError) throw salesError

      const totalSold =
        salesData?.reduce((sum, item) => sum + item.quantity, 0) || 0
      const timesOrdered = salesData?.length || 0

      const { data: lastSale } = await this.db
        .from('sales_items')
        .select('created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        totalSold,
        timesOrdered,
        lastSaleDate: lastSale?.created_at || null,
      }
    } catch (error) {
      return this.handleError(error, 'ProductRepository.getProductStats')
    }
  }
}