import { CategoryRepository } from '../repositories/CategoryRepository'
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from '../types/entities'
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'
import { BUSINESS_RULES } from '../config/constants'

export class CategoryService {
  constructor(private categoryRepo: CategoryRepository) {}

  /**
   * Obtiene todas las categorías
   */
  async getAll(): Promise<Category[]> {
    try {
      const categories = await this.categoryRepo.findAll()

      logger.info('Categorías obtenidas', 'CategoryService', {
        count: categories.length,
      })

      return categories
    } catch (error) {
      logger.error('Error al obtener categorías', 'CategoryService', error)
      throw error
    }
  }

  /**
   * Obtiene todas las categorías con conteo de productos
   */
  async getAllWithProductCount(): Promise <
    Array<Category & { product_count: number }>
  > {
    try {
      return await this.categoryRepo.findAllWithProductCount()
    } catch (error) {
      logger.error(
        'Error al obtener categorías con conteo',
        'CategoryService',
        error
      )
      throw error
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  async getById(id: string): Promise<Category> {
    try {
      const category = await this.categoryRepo.findById(id)

      if (!category) {
        throw new NotFoundError('Categoría', id)
      }

      return category
    } catch (error) {
      logger.error('Error al obtener categoría', 'CategoryService', error)
      throw error
    }
  }

  /**
   * Obtiene una categoría por slug
   */
  async getBySlug(slug: string): Promise<Category> {
    try {
      const category = await this.categoryRepo.findBySlug(slug)

      if (!category) {
        throw new NotFoundError('Categoría')
      }

      return category
    } catch (error) {
      logger.error('Error al obtener categoría por slug', 'CategoryService', error)
      throw error
    }
  }

  /**
   * Crea una nueva categoría
   */
  async create(data: CategoryInsert): Promise<Category> {
    try {
      // Validaciones de negocio
      this.validateCategoryData(data)

      const category = await this.categoryRepo.create(data)

      logger.info('Categoría creada', 'CategoryService', {
        categoryId: category.id,
        name: category.name,
      })

      return category
    } catch (error) {
      logger.error('Error al crear categoría', 'CategoryService', error)
      throw error
    }
  }

  /**
   * Actualiza una categoría
   */
  async update(id: string, data: CategoryUpdate): Promise<Category> {
    try {
      // Verificar que existe
      await this.getById(id)

      // Validar datos si se proporcionan
      if (data.name || data.slug) {
        this.validateCategoryData(data as CategoryInsert)
      }

      const updated = await this.categoryRepo.update(id, data)

      logger.info('Categoría actualizada', 'CategoryService', {
        categoryId: id,
      })

      return updated
    } catch (error) {
      logger.error('Error al actualizar categoría', 'CategoryService', error)
      throw error
    }
  }

  /**
   * Elimina una categoría
   */
  async delete(id: string): Promise<void> {
    try {
      // Verificar que no tiene productos
      const productCount = await this.categoryRepo.getProductCount(id)

      if (productCount > 0) {
        throw new ConflictError(
          `No se puede eliminar la categoría porque tiene ${productCount} productos asociados`
        )
      }

      await this.categoryRepo.delete(id)

      logger.info('Categoría eliminada', 'CategoryService', { categoryId: id })
    } catch (error) {
      logger.error('Error al eliminar categoría', 'CategoryService', error)
      throw error
    }
  }

  /**
   * Obtiene el conteo de productos de una categoría
   */
  async getProductCount(categoryId: string): Promise<number> {
    try {
      return await this.categoryRepo.getProductCount(categoryId)
    } catch (error) {
      logger.error('Error al obtener conteo de productos', 'CategoryService', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  private validateCategoryData(data: CategoryInsert | CategoryUpdate): void {
    if (data.name) {
      if (data.name.trim().length < BUSINESS_RULES.VALIDATION.MIN_NAME_LENGTH) {
        throw new ValidationError(
          `El nombre debe tener al menos ${BUSINESS_RULES.VALIDATION.MIN_NAME_LENGTH} caracteres`
        )
      }

      if (data.name.length > BUSINESS_RULES.VALIDATION.MAX_NAME_LENGTH) {
        throw new ValidationError(
          `El nombre no puede exceder ${BUSINESS_RULES.VALIDATION.MAX_NAME_LENGTH} caracteres`
        )
      }
    }

    if (data.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugRegex.test(data.slug)) {
        throw new ValidationError(
          'El slug debe contener solo letras minúsculas, números y guiones'
        )
      }
    }

    if (data.description && data.description.length > BUSINESS_RULES.VALIDATION.MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `La descripción no puede exceder ${BUSINESS_RULES.VALIDATION.MAX_DESCRIPTION_LENGTH} caracteres`
      )
    }
  }
}