'use client'

import { trpc } from '@/lib/trpc/react'
import { toast } from 'sonner'
import type { ProductFilters } from '@/server/types/entities'

export function useProducts(filters?: ProductFilters) {
  const utils = trpc.useUtils()

  const { data: products, isLoading } = trpc.product.getAll.useQuery(filters, {
    placeholderData: (previousData) => previousData,
  })

  const { data: categories } = trpc.category.getAll.useQuery()

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate()
      toast.success('Producto creado correctamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear producto')
    },
  })

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate()
      toast.success('Producto actualizado correctamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar producto')
    },
  })

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate()
      toast.success('Producto eliminado correctamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar producto')
    },
  })

  const adjustStockMutation = trpc.product.adjustStock.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate()
      toast.success('Stock ajustado correctamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al ajustar stock')
    },
  })

  return {
    products: products || [],
    categories: categories || [],
    isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    adjustStock: adjustStockMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAdjustingStock: adjustStockMutation.isPending,
  }
}

export function useProduct(id: string) {
  const { data: product, isLoading } = trpc.product.getById.useQuery(
    { id },
    { enabled: !!id }
  )

  const { data: stats } = trpc.product.getStats.useQuery(
    { id },
    { enabled: !!id }
  )

  return {
    product,
    stats,
    isLoading,
  }
}