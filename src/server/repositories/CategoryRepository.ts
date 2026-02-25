import { BaseRepository } from './base/BaseRepository'
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from '../types/entities'

export class CategoryRepository extends BaseRepository {
  /**
   * Obtiene todas las categorías
   */
  async findAll(): Promise<Category[]> {
    try {
      const { data, error } = await this.db
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'CategoryRepository.findAll')
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  async findById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await this.db
        .from('categories')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      return data
    } catch (error) {
      return this.handleError(error, 'CategoryRepository.findById')
    }
  }

  /**
   * Obtiene una categoría por slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await this.db
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error

      return data
    } catch (error) {
      return this.handleError(error, 'CategoryRepository.findBySlug')
    }
  }

  /**
   * Crea una categoría
   */
  async create(data: CategoryInsert): Promise<Category> {
    try {
      // Verificar nombre único
      const { data: existing } = await this.db
        .from('categories')
        .select('id')
        .ilike('name', data.name)
        .maybeSingle()

      if (existing) {
        throw new Error('Ya existe una categoría con ese nombre')
      }

      // Verificar slug único
      const { data: existingSlug } = await this.db
        .from('categories')
        .select('id')
        .eq('slug', data.slug)
        .maybeSingle()

      if (existingSlug) {
        throw new Error('Ya existe una categoría con ese slug')
      }

      const { data: category, error } = await this.db
        .from('categories')
        .insert(data)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(category, 'Categoría creada')
    } catch (error) {
      return this.handleError(error, 'CategoryRepository.create')
    }
  }

  /**
   * Actualiza una categoría
   */
  async update(id: string, data: CategoryUpdate): Promise<Category> {
    try {
      // Verificar que existe
      await this.findById(id).then((cat) =>
        this.assertExists(cat, 'Categoría', id)
      )

      // Verificar nombre único si se actualiza
      if (data.name) {
        const { data: existing } = await this.db
          .from('categories')
          .select('id')
          .ilike('name', data.name)
          .neq('id', id)
          .maybeSingle()

        if (existing) {
          throw new Error('Ya existe otra categoría con ese nombre')
        }
      }

      // Verificar slug único si se actualiza
      if (data.slug) {
        const { data: existingSlug } = await this.db
          .from('categories')
          .select('id')
          .eq('slug', data.slug)
          .neq('id', id)
          .maybeSingle()

        if (existingSlug) {
          throw new Error('Ya existe otra categoría con ese slug')
        }
      }

      const { data: updated, error } = await this.db
        .from('categories')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.assertExists(updated, 'Categoría actualizada')
    } catch (error) {
      return this.handleError(error, 'CategoryRepository.update')
    }
  }

  /**
   * Elimina una categoría
   */
  async delete(id: string): Promise<void> {
    try {
      // Verificar que existe
      await this.findById(id).then((cat) =>
        this.assertExists(cat, 'Categoría', id)
      )

      // Verificar que no tiene productos
      const productCount = await this.getProductCount(id)

      if (productCount > 0) {
        throw new Error(
          `No se puede eliminar la categoría porque tiene ${productCount} productos asociados`
        )
      }

      const { error } = await this.db.from('categories').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      return this.handleError(error, 'CategoryRepository.delete')
    }
  }

  /**
   * Obtiene el conteo de productos de una categoría
   */
  async getProductCount(categoryId: string): Promise<number> {
    try {
      const { count, error } = await this.db
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .is('deleted_at', null)

      if (error) throw error

      return count || 0
    } catch (error) {
      return this.handleError(error, 'CategoryRepository.getProductCount')
    }
  }

  /**
   * Obtiene todas las categorías con conteo de productos
   */
  async findAllWithProductCount(): Promise <
    Array<Category & { product_count: number }>
  > {
    try {
      const categories = await this.findAll()

      const withCounts = await Promise.all(
        categories.map(async (category) => ({
          ...category,
          product_count: await this.getProductCount(category.id),
        }))
      )

      return withCounts
    } catch (error) {
      return this.handleError(
        error,
        'CategoryRepository.findAllWithProductCount'
      )
    }
  }
}