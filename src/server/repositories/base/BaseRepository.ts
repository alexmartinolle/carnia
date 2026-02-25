import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
import { logger } from '../../utils/logger'

/**
 * Clase base abstracta para todos los repositories
 * Proporciona funcionalidad común de acceso a datos
 */
export abstract class BaseRepository {
  protected readonly db: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>) {
    this.db = db
  }

  /**
   * Maneja errores de Supabase de forma consistente
   */
  protected handleError(error: unknown, context: string): never {
    logger.error('Repository error', context, error)

    if (error instanceof Error) {
      throw new Error(`${context}: ${error.message}`)
    }

    throw new Error(`${context}: Error desconocido`)
  }

  /**
   * Verifica que un valor no sea null/undefined
   */
  protected assertExists<T>(
    data: T | null | undefined,
    entityName: string,
    id?: string
  ): T {
    if (data === null || data === undefined) {
      const message = id
        ? `${entityName} con ID ${id} no encontrado`
        : `${entityName} no encontrado`
      throw new Error(message)
    }
    return data
  }

  /**
   * Valida que un número no sea negativo
   */
  protected assertNonNegative(value: number, fieldName: string): void {
    if (value < 0) {
      throw new Error(`${fieldName} no puede ser negativo`)
    }
  }

  /**
   * Valida que un número sea positivo
   */
  protected assertPositive(value: number, fieldName: string): void {
    if (value <= 0) {
      throw new Error(`${fieldName} debe ser mayor a 0`)
    }
  }

  /**
   * Verifica si un registro existe por ID
   */
  protected async exists(tableName: string, id: string): Promise<boolean> {
    try {
      const { count, error } = await this.db
        .from(tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('id', id)

      if (error) throw error

      return (count || 0) > 0
    } catch (error) {
      return this.handleError(error, `BaseRepository.exists(${tableName})`)
    }
  }

  /**
   * Cuenta registros con filtros opcionales
   */
  protected async count(tableName: string): Promise<number> {
    try {
      const { count, error } = await this.db
        .from(tableName as any)
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      return count || 0
    } catch (error) {
      return this.handleError(error, `BaseRepository.count(${tableName})`)
    }
  }
}