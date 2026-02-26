# 🥩 CarniaSmart Backend

Sistema backend completo para gestión de carnicería construido con **Next.js 15**, **tRPC**, **TypeScript** y **Supabase**.

## 🏗️ Arquitectura

El backend sigue una arquitectura en capas limpia y escalable:
```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│    React Components + TanStack Query    │
└──────────────┬──────────────────────────┘
               │ tRPC (Type-safe)
┌──────────────▼──────────────────────────┐
│           API LAYER (tRPC)              │
│      Routers + Validación (Zod)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        SERVICE LAYER                    │
│      Lógica de Negocio                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      REPOSITORY LAYER                   │
│      Acceso a Datos                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      DATABASE (Supabase)                │
│   PostgreSQL + Triggers + RLS           │
└─────────────────────────────────────────┘
```

---

## 📂 Estructura del Proyecto
```
src/server/
├── config/              # Configuración
│   ├── supabase.ts     # Cliente Supabase
│   └── constants.ts    # Constantes de negocio
│
├── types/              # TypeScript Types
│   ├── database.types.ts  # Auto-generado de Supabase
│   ├── entities.ts        # Tipos de dominio
│   └── index.ts
│
├── validators/         # Schemas Zod
│   ├── common.validators.ts
│   ├── category.validators.ts
│   ├── product.validators.ts
│   ├── customer.validators.ts
│   ├── order.validators.ts
│   ├── sale.validators.ts
│   ├── inventory.validators.ts
│   └── index.ts
│
├── repositories/       # Data Access Layer
│   ├── base/
│   │   └── BaseRepository.ts
│   ├── CategoryRepository.ts
│   ├── ProductRepository.ts
│   ├── CustomerRepository.ts
│   ├── OrderRepository.ts
│   ├── SaleRepository.ts
│   ├── InventoryRepository.ts
│   └── index.ts
│
├── services/          # Business Logic Layer
│   ├── CategoryService.ts
│   ├── ProductService.ts
│   ├── CustomerService.ts
│   ├── OrderService.ts
│   ├── SaleService.ts
│   ├── InventoryService.ts
│   ├── AnalyticsService.ts
│   └── index.ts
│
├── api/               # tRPC API Layer
│   ├── trpc.ts       # tRPC setup
│   ├── context.ts    # Context + DI
│   ├── root.ts       # Root router
│   └── routers/
│       ├── category.router.ts
│       ├── product.router.ts
│       ├── customer.router.ts
│       ├── order.router.ts
│       ├── sale.router.ts
│       ├── inventory.router.ts
│       └── analytics.router.ts
│
└── utils/            # Utilidades
    ├── errors.ts     # Custom errors
    ├── logger.ts     # Logger estructurado
    └── helpers.ts    # Funciones helper
```

---

## 🎯 Capas del Backend

### 1️⃣ **TYPES** - Tipos TypeScript

**📁 Ubicación:** `src/server/types/`

Los **Types** definen la estructura de datos de toda la aplicación de forma type-safe.

#### ¿Qué son?

Son definiciones de TypeScript que representan:
- **Entidades de base de datos** (tablas)
- **Tipos para operaciones** (Insert, Update)
- **Tipos con relaciones** (JOINs)
- **Tipos de respuesta** (DTOs)
- **Enums y constantes**

#### Tipos principales
```typescript
// Entidades base (tablas)
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']

// Tipos para inserts (sin id, timestamps)
export type ProductInsert = Database['public']['Tables']['products']['Insert']

// Tipos para updates (todos opcionales)
export type ProductUpdate = Database['public']['Tables']['products']['Update']

// Tipos con relaciones
export type ProductWithCategory = Product & {
  category: Category
}

// Filtros
export interface ProductFilters {
  categoryId?: string
  isActive?: boolean
  search?: string
  hasLowStock?: boolean
}
```

#### ¿Por qué son importantes?

✅ **Type Safety**: El compilador detecta errores en tiempo de desarrollo
✅ **Autocomplete**: IntelliSense muestra todas las propiedades disponibles
✅ **Refactoring seguro**: Cambios propagados automáticamente
✅ **Documentación viva**: Los tipos sirven como documentación

#### Ejemplo de uso
```typescript
// ❌ ERROR: TypeScript detecta el error
const product: Product = {
  name: 'Chuletón',
  price: 'veinte euros', // ❌ Error: debe ser number
}

// ✅ CORRECTO
const product: ProductInsert = {
  name: 'Chuletón',
  category_id: '123',
  price_per_unit: 20.50,
  is_per_kg: true,
  stock_quantity: 10,
  stock_minimum: 5,
}
```

---

### 2️⃣ **VALIDATORS** - Schemas Zod

**📁 Ubicación:** `src/server/validators/`

Los **Validators** son schemas de Zod que validan los datos de entrada en runtime.

#### ¿Qué son?

Schemas que definen:
- **Validaciones de formato** (email, teléfono, UUID)
- **Validaciones de rango** (min, max)
- **Validaciones de negocio** (fecha futura, stock positivo)
- **Transformaciones** (trim, lowercase)
- **Mensajes de error personalizados**

#### Validators principales
```typescript
// Validator común reutilizable
export const priceSchema = z
  .number()
  .positive('El precio debe ser mayor a 0')
  .multipleOf(0.01, 'Máximo 2 decimales')
  .max(999999.99, 'Precio demasiado alto')

// Validator de creación de producto
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  category_id: z.string().uuid(),
  price_per_unit: priceSchema,
  stock_quantity: z.number().nonnegative(),
  stock_minimum: z.number().nonnegative(),
})

// Validator de filtros
export const productFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  search: z.string().min(1).max(100).optional(),
})
```

#### ¿Por qué son importantes?

✅ **Seguridad**: Validan datos antes de procesarlos
✅ **Feedback al usuario**: Mensajes de error claros
✅ **Type inference**: Los tipos se infieren automáticamente
✅ **Validación runtime**: Detectan datos inválidos en ejecución

#### Ejemplo de uso
```typescript
// Entrada del usuario
const input = {
  name: 'Ch',
  price_per_unit: -10,
}

// Validación
const result = createProductSchema.safeParse(input)

if (!result.success) {
  console.log(result.error.format())
  // {
  //   name: ['El nombre debe tener al menos 2 caracteres'],
  //   price_per_unit: ['El precio debe ser mayor a 0']
  // }
}
```

---

### 3️⃣ **REPOSITORIES** - Capa de Acceso a Datos

**📁 Ubicación:** `src/server/repositories/`

Los **Repositories** son clases que encapsulan TODAS las operaciones de base de datos.

#### ¿Qué son?

Clases especializadas que:
- **Abstraen las queries SQL/Supabase**
- **Implementan el patrón Repository**
- **Centralizan el acceso a datos**
- **No contienen lógica de negocio**

#### Estructura de un Repository
```typescript
export class ProductRepository extends BaseRepository {
  /**
   * Obtiene todos los productos
   */
  async findAll(filters?: ProductFilters): Promise<ProductWithCategory[]> {
    try {
      let query = this.db
        .from('products')
        .select('*, category:categories(*)')
        .is('deleted_at', null)

      // Aplicar filtros
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return this.handleError(error, 'ProductRepository.findAll')
    }
  }

  /**
   * Crea un producto
   */
  async create(data: ProductInsert): Promise<Product> {
    // Implementación...
  }

  // Más métodos...
}
```

#### ¿Por qué son importantes?

✅ **Separación de responsabilidades**: Solo manejan acceso a datos
✅ **Reutilización**: Queries compartidas entre services
✅ **Testing**: Fácil de mockear en tests
✅ **Cambio de DB**: Cambiar de DB sin tocar lógica de negocio

#### Métodos típicos de un Repository
```typescript
// CRUD básico
findAll(filters?)    // Obtener todos
findById(id)         // Obtener uno
create(data)         // Crear
update(id, data)     // Actualizar
delete(id)           // Eliminar

// Queries específicas
findLowStock()       // Productos con stock bajo
search(query)        // Búsqueda
getStats(id)         // Estadísticas
```

#### Ejemplo de uso
```typescript
// En un Service
const productRepo = new ProductRepository(db)

// Obtener productos activos
const activeProducts = await productRepo.findAll({ isActive: true })

// Buscar por nombre
const results = await productRepo.search('chuletón')

// Crear producto
const newProduct = await productRepo.create({
  name: 'Chuletón',
  category_id: 'abc-123',
  price_per_unit: 25.50,
  // ...
})
```

---

### 4️⃣ **SERVICES** - Capa de Lógica de Negocio

**📁 Ubicación:** `src/server/services/`

Los **Services** contienen TODA la lógica de negocio de la aplicación.

#### ¿Qué son?

Clases que:
- **Implementan reglas de negocio**
- **Orquestan múltiples repositories**
- **Validan datos de negocio**
- **Calculan métricas**
- **Loggean operaciones importantes**

#### Estructura de un Service
```typescript
export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private inventoryRepo: InventoryRepository
  ) {}

  /**
   * Crea un nuevo producto con validaciones de negocio
   */
  async create(data: ProductInsert): Promise<Product> {
    // 1. Validaciones de negocio
    this.validateProductData(data)

    // 2. Operación principal
    const product = await this.productRepo.create(data)

    // 3. Lógica adicional
    if (product.stock_quantity < product.stock_minimum) {
      logger.warn('Producto creado con stock bajo', {
        productId: product.id,
        stock: product.stock_quantity,
      })
    }

    // 4. Logging
    logger.info('Producto creado', {
      productId: product.id,
      name: product.name,
    })

    return product
  }

  /**
   * Ajusta stock con registro en inventario
   */
  async adjustStock(
    productId: string,
    newStock: number,
    reason: string,
    notes?: string
  ): Promise<Product> {
    // Validación
    if (newStock < 0) {
      throw new ValidationError('El stock no puede ser negativo')
    }

    // Obtener stock actual
    const currentStock = await this.productRepo.getStock(productId)

    // Determinar tipo de movimiento
    const type = newStock > currentStock ? 'in' : 'out'

    // Registrar en inventario (orquestación)
    await this.inventoryRepo.registerMovement({
      product_id: productId,
      type,
      quantity: Math.abs(newStock - currentStock),
      reason,
      notes,
    })

    // Actualizar stock
    return await this.productRepo.updateStock(productId, newStock)
  }

  // Validaciones privadas
  private validateProductData(data: ProductInsert): void {
    if (data.price_per_unit <= 0) {
      throw new ValidationError('El precio debe ser mayor a 0')
    }
    // Más validaciones...
  }
}
```

#### ¿Por qué son importantes?

✅ **Lógica centralizada**: Toda la lógica en un solo lugar
✅ **Reutilización**: Los routers solo llaman a services
✅ **Testing**: Fácil de testear con repositories mockeados
✅ **Mantenibilidad**: Cambios en un solo lugar

#### Diferencia Repository vs Service
```typescript
// ❌ INCORRECTO: Lógica de negocio en Repository
class ProductRepository {
  async create(data: ProductInsert) {
    // ❌ NO: Validaciones de negocio aquí
    if (data.price_per_unit < 5) {
      throw new Error('Precio muy bajo')
    }
    // ❌ NO: Cálculos de negocio aquí
    data.suggested_price = data.price_per_unit * 1.3
    
    return this.db.from('products').insert(data)
  }
}

// ✅ CORRECTO: Repository solo accede a datos
class ProductRepository {
  async create(data: ProductInsert) {
    return this.db.from('products').insert(data)
  }
}

// ✅ CORRECTO: Service tiene la lógica de negocio
class ProductService {
  async create(data: ProductInsert) {
    // ✅ Validaciones de negocio
    if (data.price_per_unit < 5) {
      throw new ValidationError('Precio muy bajo')
    }

    // ✅ Cálculos de negocio
    const enrichedData = {
      ...data,
      suggested_price: data.price_per_unit * 1.3,
    }

    return this.productRepo.create(enrichedData)
  }
}
```

#### Ejemplo de uso
```typescript
// En un router de tRPC
const productService = new ProductService(productRepo, inventoryRepo)

// Crear producto (con todas las validaciones y lógica)
const product = await productService.create({
  name: 'Chuletón',
  price_per_unit: 25.50,
  // ...
})

// Ajustar stock (registra movimiento automáticamente)
await productService.adjustStock(
  'product-id',
  50,
  'purchase',
  'Compra semanal'
)
```

---

## 🔄 Flujo de una Request

Veamos cómo fluye una petición a través de todas las capas:
```
1. FRONTEND
   Usuario hace click en "Crear Producto"
   ↓
2. tRPC CLIENT
   trpc.product.create.mutate({ name: '...', price: 25.50 })
   ↓
3. API LAYER (Router)
   productRouter.create recibe la petición
   ↓
4. VALIDATOR
   createProductSchema valida los datos
   ✓ name: string válido
   ✓ price: número positivo
   ↓
5. SERVICE LAYER
   productService.create(input)
   - Valida reglas de negocio
   - Verifica categoría existe
   - Calcula valores derivados
   ↓
6. REPOSITORY LAYER
   productRepo.create(data)
   - Construye query SQL
   - Ejecuta INSERT en DB
   ↓
7. DATABASE
   Supabase ejecuta:
   - INSERT en products
   - Triggers automáticos
   - RLS policies
   ↓
8. RESPUESTA
   Datos fluyen de vuelta por las capas
   Service → Router → tRPC → Frontend
```

---

## 📚 Ejemplos Prácticos

### Ejemplo 1: Crear un Pedido
```typescript
// 1. VALIDATOR (validators/order.validators.ts)
export const createOrderSchema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().positive(),
    })
  ).min(1).max(50),
  pickup_datetime: z.coerce.date().refine(
    date => date > new Date(),
    'La fecha debe ser futura'
  ),
})

// 2. REPOSITORY (repositories/OrderRepository.ts)
export class OrderRepository extends BaseRepository {
  async create(data: OrderInsert): Promise<Order> {
    const { data: order, error } = await this.db
      .from('orders')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return order
  }

  async addItems(orderId: string, items: OrderItemInsert[]): Promise<void> {
    const { error } = await this.db
      .from('order_items')
      .insert(items.map(item => ({ ...item, order_id: orderId })))

    if (error) throw error
  }
}

// 3. SERVICE (services/OrderService.ts)
export class OrderService {
  async createOrder(input: CreateOrderInput): Promise<OrderWithDetails> {
    // Validar cliente existe
    const customer = await this.customerRepo.findById(input.customer_id)
    if (!customer) {
      throw new NotFoundError('Cliente')
    }

    // Validar stock de todos los productos
    for (const item of input.items) {
      const product = await this.productRepo.findById(item.product_id)
      
      if (!product.is_active) {
        throw new ValidationError(`Producto "${product.name}" inactivo`)
      }

      if (product.stock_quantity < item.quantity) {
        throw new InsufficientStockError(
          product.name,
          product.stock_quantity,
          item.quantity
        )
      }
    }

    // Crear pedido
    const order = await this.orderRepo.create({
      customer_id: input.customer_id,
      channel: input.channel,
      pickup_datetime: input.pickup_datetime.toISOString(),
      status: 'new',
    })

    // Añadir items con precios actuales
    const itemsWithPrices = await Promise.all(
      input.items.map(async item => {
        const product = await this.productRepo.findById(item.product_id)
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price_per_unit,
        }
      })
    )

    await this.orderRepo.addItems(order.id, itemsWithPrices)

    logger.info('Pedido creado', { orderId: order.id })

    return this.orderRepo.findById(order.id)
  }
}

// 4. ROUTER (api/routers/order.router.ts)
export const orderRouter = createTRPCRouter({
  create: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.order.createOrder(input)
    }),
})

// 5. CLIENTE (Frontend)
const { mutate: createOrder } = trpc.order.create.useMutation()

createOrder({
  customer_id: 'abc-123',
  channel: 'web',
  pickup_datetime: new Date('2024-12-25 18:00'),
  items: [
    { product_id: 'prod-1', quantity: 2 },
    { product_id: 'prod-2', quantity: 1 },
  ],
})
```

---

## 🧪 Testing

### Unit Tests (Services)
```typescript
describe('ProductService', () => {
  it('debe crear producto con validaciones', async () => {
    const mockProductRepo = {
      create: jest.fn().mockResolvedValue(mockProduct),
    }
    const service = new ProductService(mockProductRepo, mockInventoryRepo)

    const result = await service.create({
      name: 'Chuletón',
      price_per_unit: 25.50,
    })

    expect(result).toBeDefined()
    expect(mockProductRepo.create).toHaveBeenCalled()
  })

  it('debe rechazar precio negativo', async () => {
    await expect(
      service.create({ price_per_unit: -10 })
    ).rejects.toThrow(ValidationError)
  })
})
```

### Integration Tests (Repositories)
```typescript
describe('ProductRepository', () => {
  it('debe crear y recuperar producto', async () => {
    const repo = new ProductRepository(supabaseClient)

    const created = await repo.create(mockProductData)
    const retrieved = await repo.findById(created.id)

    expect(retrieved).toEqual(created)
  })
})
```

---

## 🚀 Uso del Backend

### En el Frontend con tRPC
```typescript
import { trpc } from '@/lib/trpc/react'

function ProductList() {
  // Query
  const { data: products, isLoading } = trpc.product.getAll.useQuery({
    isActive: true,
  })

  // Mutation
  const { mutate: createProduct } = trpc.product.create.useMutation({
    onSuccess: () => {
      alert('Producto creado!')
    },
  })

  const handleCreate = () => {
    createProduct({
      name: 'Chuletón',
      category_id: 'cat-123',
      price_per_unit: 25.50,
      stock_quantity: 10,
      stock_minimum: 5,
    })
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button onClick={handleCreate}>Crear Producto</button>
    </div>
  )
}
```

---

## 🔧 Variables de Entorno
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App
NODE_ENV=development
PORT=3000
```

---

## 📦 Dependencias Principales
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.22.0",
    "superjson": "^2.2.0",
    "next": "15.0.0",
    "react": "^18.3.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 🎓 Conceptos Clave

### Repository Pattern

**Ventajas:**
- ✅ Abstrae la fuente de datos
- ✅ Facilita testing (mockeable)
- ✅ Centraliza queries
- ✅ Permite cambiar DB sin romper código

### Service Layer

**Ventajas:**
- ✅ Contiene lógica de negocio
- ✅ Orquesta múltiples repositories
- ✅ Reutilizable desde múltiples puntos
- ✅ Testeable independientemente

### Dependency Injection
```typescript
// Los servicios reciben dependencias por constructor
class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private customerRepo: CustomerRepository,
    private productRepo: ProductRepository
  ) {}
}

// Esto permite:
// 1. Testing con mocks
// 2. Cambiar implementaciones
// 3. Desacoplamiento
```

---

## 📖 Recursos Adicionales

- [tRPC Documentation](https://trpc.io)
- [Zod Documentation](https://zod.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

---

## 👥 Contribuir

Para añadir nuevas funcionalidades:

1. **Crear Types** si son necesarios
2. **Crear Validators** para validar inputs
3. **Añadir métodos al Repository** para acceso a datos
4. **Implementar lógica en Service**
5. **Crear endpoint en Router**
6. **Documentar** el cambio

---

## 📝 Licencia

MIT

---

**Desarrollado con ❤️ para CarniaSmart**

✅ RESUMEN DE FASES - FRONTEND CARNIASMART

✅ FASE 1 COMPLETADA: SETUP INICIAL + LAYOUT BASE
Archivos creados (7):

✅ src/app/globals.css - Tema con colores carne + banderas
✅ src/lib/utils.ts - Helpers y formatters
✅ src/components/layout/Header.tsx - Header responsive con banderas
✅ src/components/layout/Sidebar.tsx - Navegación sidebar
✅ src/components/layout/Footer.tsx - Footer con banderas
✅ src/app/(dashboard)/layout.tsx - Layout dashboard
✅ src/app/layout.tsx - Root layout con tRPC

Características:

✅ Responsive mobile-first
✅ Colores rojo carne predominante
✅ Banderas Uruguay/Argentina (header/footer)
✅ Sistema de navegación completo
✅ Sonner toast configurado


📋 FASES RESTANTES
FASE 2: COMPONENTES COMPARTIDOS ⏱️ 2h
Componentes a desarrollar (8):

components/shared/DataTable.tsx - Tabla genérica reutilizable
components/shared/PageHeader.tsx - Header de página con breadcrumb
components/shared/EmptyState.tsx - Estado vacío
components/shared/LoadingSpinner.tsx - Spinner de carga
components/shared/ErrorState.tsx - Estado de error
components/shared/ConfirmDialog.tsx - Diálogo de confirmación
components/shared/SearchInput.tsx - Input de búsqueda con debounce
components/shared/StatusBadge.tsx - Badge de estados


FASE 3: DASHBOARD PRINCIPAL ⏱️ 2h
Componentes a desarrollar (7):

app/(dashboard)/page.tsx - Página principal del dashboard
components/dashboard/StatsCard.tsx - Card de estadísticas
components/dashboard/RecentSales.tsx - Ventas recientes
components/dashboard/LowStockAlert.tsx - Alertas de stock bajo
components/dashboard/PendingOrders.tsx - Pedidos pendientes
components/dashboard/RevenueChart.tsx - Gráfico de revenue
components/dashboard/QuickActions.tsx - Acciones rápidas


FASE 4: MÓDULO PRODUCTOS ⏱️ 3h
Componentes a desarrollar (8):

app/(dashboard)/productos/page.tsx - Lista de productos
app/(dashboard)/productos/nuevo/page.tsx - Crear producto
app/(dashboard)/productos/[id]/page.tsx - Ver producto
app/(dashboard)/productos/[id]/editar/page.tsx - Editar producto
components/products/ProductTable.tsx - Tabla de productos
components/products/ProductForm.tsx - Formulario de producto
components/products/ProductCard.tsx - Card de producto
components/products/StockBadge.tsx - Badge de stock


FASE 5: MÓDULO CATEGORÍAS ⏱️ 1.5h
Componentes a desarrollar (5):

app/(dashboard)/categorias/page.tsx - Lista de categorías
app/(dashboard)/categorias/nueva/page.tsx - Crear categoría
app/(dashboard)/categorias/[id]/editar/page.tsx - Editar categoría
components/categories/CategoryTable.tsx - Tabla de categorías
components/categories/CategoryForm.tsx - Formulario de categoría


FASE 6: MÓDULO CLIENTES ⏱️ 2.5h
Componentes a desarrollar (7):

app/(dashboard)/clientes/page.tsx - Lista de clientes
app/(dashboard)/clientes/nuevo/page.tsx - Crear cliente
app/(dashboard)/clientes/[id]/page.tsx - Ver cliente
app/(dashboard)/clientes/[id]/editar/page.tsx - Editar cliente
components/customers/CustomerTable.tsx - Tabla de clientes
components/customers/CustomerForm.tsx - Formulario de cliente
components/customers/SegmentBadge.tsx - Badge de segmento


FASE 7: MÓDULO PEDIDOS ⏱️ 3h
Componentes a desarrollar (8):

app/(dashboard)/pedidos/page.tsx - Lista de pedidos
app/(dashboard)/pedidos/nuevo/page.tsx - Crear pedido
app/(dashboard)/pedidos/[id]/page.tsx - Ver pedido
components/orders/OrderTable.tsx - Tabla de pedidos
components/orders/OrderForm.tsx - Formulario multi-step
components/orders/OrderStatusBadge.tsx - Badge de estado
components/orders/OrderTimeline.tsx - Timeline de pedido
components/orders/ProductSelector.tsx - Selector de productos


FASE 8: MÓDULO VENTAS ⏱️ 2.5h
Componentes a desarrollar (6):

app/(dashboard)/ventas/page.tsx - Lista de ventas
app/(dashboard)/ventas/nueva/page.tsx - Registrar venta
app/(dashboard)/ventas/[id]/page.tsx - Ver venta
components/sales/QuickSale.tsx - Venta rápida (POS)
components/sales/SaleTable.tsx - Tabla de ventas
components/sales/SaleReceipt.tsx - Recibo de venta


FASE 9: MÓDULO INVENTARIO ⏱️ 2h
Componentes a desarrollar (6):

app/(dashboard)/inventario/page.tsx - Vista principal
app/(dashboard)/inventario/ajustar/page.tsx - Ajustar stock
app/(dashboard)/inventario/historial/page.tsx - Historial
components/inventory/StockAdjustForm.tsx - Formulario ajuste
components/inventory/MovementTable.tsx - Tabla de movimientos
components/inventory/LowStockList.tsx - Lista de stock bajo


FASE 10: MÓDULO ANALYTICS ⏱️ 2h
Componentes a desarrollar (6):

app/(dashboard)/analytics/page.tsx - Dashboard analytics
components/analytics/SalesChart.tsx - Gráfico de ventas
components/analytics/RevenueChart.tsx - Gráfico de revenue
components/analytics/TopProducts.tsx - Productos más vendidos
components/analytics/CategoryBreakdown.tsx - Breakdown por categoría
components/analytics/DateRangePicker.tsx - Selector de rango