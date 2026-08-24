import { createPublicClient } from '@/utils/supabase/public'
import type { Product, Category } from '@/types/product'
import type { Pack } from '@/types/pack'

// Productos destacados: selección aleatoria de 4 visibles
export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name_es, name_ca, slug, sort_order)')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data) return []

  // Aleatorizar en JS (Supabase no soporta ORDER BY random() en RLS)
  return data.sort(() => Math.random() - 0.5).slice(0, 4)
}

// Todos los productos visibles con filtro opcional por categoría
export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const supabase = createPublicClient()

  let query = supabase
    .from('products')
    .select('*, categories(id, name_es, name_ca, slug, sort_order)')
    .eq('is_visible', true)
    .order('name_es', { ascending: true })

  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  const { data, error } = await query
  if (error || !data) return []
  return data
}

// Todas las categorías ordenadas
export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data
}

// Un producto por slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name_es, name_ca, slug, sort_order)')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error || !data) return null
  return data
}

// Productos en oferta
export async function getOfferProducts(): Promise<Product[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name_es, name_ca, slug, sort_order)')
    .eq('is_visible', true)
    .eq('is_on_offer', true)
    .order('name_es', { ascending: true })

  if (error || !data) return []
  return data
}

// Todos los packs visibles
export async function getPacks(): Promise<Pack[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('packs')
    .select('*, pack_products(*, products(id, name_es, name_ca, slug))')
    .eq('is_visible', true)
    .order('name_es', { ascending: true })

  if (error || !data) return []
  return data
}

// Un pack por slug con productos e imágenes
export async function getPackBySlug(slug: string) {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('packs')
    .select('*, pack_products(*, products(id, name_es, name_ca, slug, image_url))')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error || !data) return null
  return data
}
