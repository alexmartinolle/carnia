/**
 * Errores personalizados del backend
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    const message = id
      ? `${entity} con ID ${id} no encontrado`
      : `${entity} no encontrado`
    super(message, 'NOT_FOUND', 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName: string, available: number, requested: number) {
    super(
      `Stock insuficiente para "${productName}". Disponible: ${available}, Solicitado: ${requested}`,
      'INSUFFICIENT_STOCK',
      400,
      { productName, available, requested }
    )
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION', 400)
  }
}