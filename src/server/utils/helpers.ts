/**
 * Funciones helper generales
 */

/**
 * Formatea un número como precio
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Formatea una fecha de forma legible
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diff = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Valida si un string es un UUID válido
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Redondea un número a N decimales
 */
export function roundToDecimals(num: number, decimals: number): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Elimina valores undefined/null de un objeto
 */
export function removeNullish<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  ) as Partial<T>
}