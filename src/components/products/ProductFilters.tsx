'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import type { Category } from '@/server/types/entities'

interface ProductFiltersProps {
  categories: Category[]
  onFilterChange: (filters: {
    categoryId?: string
    isActive?: boolean
    hasLowStock?: boolean
  }) => void
}

export function ProductFilters({
  categories,
  onFilterChange,
}: ProductFiltersProps) {
  const [categoryId, setCategoryId] = useState<string>()
  const [isActive, setIsActive] = useState<boolean>()
  const [hasLowStock, setHasLowStock] = useState<boolean>()

  const handleCategoryChange = (value: string) => {
    const newValue = value === 'all' ? undefined : value
    setCategoryId(newValue)
    onFilterChange({ categoryId: newValue, isActive, hasLowStock })
  }

  const handleStatusChange = (value: string) => {
    const newValue = value === 'all' ? undefined : value === 'active'
    setIsActive(newValue)
    onFilterChange({ categoryId, isActive: newValue, hasLowStock })
  }

  const handleStockChange = (value: string) => {
    const newValue = value === 'all' ? undefined : value === 'low'
    setHasLowStock(newValue)
    onFilterChange({ categoryId, isActive, hasLowStock: newValue })
  }

  const clearFilters = () => {
    setCategoryId(undefined)
    setIsActive(undefined)
    setHasLowStock(undefined)
    onFilterChange({})
  }

  const activeFiltersCount = [categoryId, isActive, hasLowStock].filter(
    Boolean
  ).length

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-2">
        {/* Categoría */}
        <Select value={categoryId || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {/* Stock */}
        <Select
          value={hasLowStock === undefined ? 'all' : hasLowStock ? 'low' : 'ok'}
          onValueChange={handleStockChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el stock</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="ok">Stock OK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Filter className="mr-1 h-3 w-3" />
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpiar
          </Button>
        </div>
      )}
    </div>
  )
}