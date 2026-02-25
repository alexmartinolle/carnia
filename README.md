This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

📋 1. STACK TÉCNICO
┌─────────────────────────────────────────────────┐
│              STACK TÉCNICO BACKEND              │
├─────────────────────────────────────────────────┤
│ Runtime:        Node.js 20+                     │
│ Framework:      Next.js 15 (App Router)         │
│ Lenguaje:       TypeScript 5.3+                 │
│ Base de Datos:  Supabase (PostgreSQL)           │
│ Cliente DB:     @supabase/supabase-js           │
│ API Layer:      tRPC 11.x                       │
│ Validación:     Zod 3.x                         │
│ Cache:          (Opcional) Upstash Redis        │
│ Testing:        Vitest + Testing Library        │
│ Linting:        ESLint + Prettier               │
└─────────────────────────────────────────────────┘

📁 2. ESTRUCTURA DE CARPETAS
src/
├── server/                          # 🔥 BACKEND COMPLETO
│   │
│   ├── config/                      # Configuración
│   │   ├── supabase.ts             # Cliente Supabase
│   │   └── constants.ts            # Constantes del negocio
│   │
│   ├── types/                       # Types TypeScript
│   │   ├── database.types.ts       # Auto-generado de Supabase
│   │   ├── entities.ts             # Entidades de dominio
│   │   └── index.ts                # Exports
│   │
│   ├── repositories/                # 📦 DATA ACCESS LAYER
│   │   ├── base/
│   │   │   └── BaseRepository.ts
│   │   ├── CategoryRepository.ts
│   │   ├── ProductRepository.ts
│   │   ├── CustomerRepository.ts
│   │   ├── OrderRepository.ts
│   │   ├── SaleRepository.ts
│   │   ├── InventoryRepository.ts
│   │   └── index.ts
│   │
│   ├── services/                    # 🎯 BUSINESS LOGIC LAYER
│   │   ├── CategoryService.ts
│   │   ├── ProductService.ts
│   │   ├── CustomerService.ts
│   │   ├── OrderService.ts
│   │   ├── SaleService.ts
│   │   ├── InventoryService.ts
│   │   ├── AnalyticsService.ts
│   │   └── index.ts
│   │
│   ├── validators/                  # 🔍 ZOD SCHEMAS
│   │   ├── category.validators.ts
│   │   ├── product.validators.ts
│   │   ├── customer.validators.ts
│   │   ├── order.validators.ts
│   │   ├── sale.validators.ts
│   │   ├── inventory.validators.ts
│   │   ├── common.validators.ts
│   │   └── index.ts
│   │
│   ├── api/                         # 🌐 tRPC API LAYER
│   │   ├── trpc.ts                 # tRPC setup
│   │   ├── context.ts              # Context creation
│   │   ├── routers/
│   │   │   ├── category.router.ts
│   │   │   ├── product.router.ts
│   │   │   ├── customer.router.ts
│   │   │   ├── order.router.ts
│   │   │   ├── sale.router.ts
│   │   │   ├── inventory.router.ts
│   │   │   ├── analytics.router.ts
│   │   │   └── index.ts
│   │   └── root.ts                 # Root router
│   │
│   └── utils/                       # 🛠️ UTILIDADES
│       ├── errors.ts               # Custom errors
│       ├── logger.ts               # Logger
│       ├── helpers.ts              # Helpers generales
│       └── index.ts
│
├── app/                             # Next.js App Router
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts        # tRPC HTTP handler
│   └── ...
│
└── lib/                             # Cliente utilities
    └── trpc/
        ├── client.ts
        ├── provider.tsx
        └── react.ts

🗺️ 3. HOJA DE RUTA DE DESARROLLO
FASE 1: Configuración Base ⏱️ 30 min

✅ Estructura de carpetas
✅ Configuración de Supabase
✅ Generación de tipos de DB
✅ Constantes de negocio
✅ Utilities (errors, logger)

FASE 2: Types & Validators ⏱️ 1h

✅ Tipos de entidades
✅ Schemas Zod comunes
✅ Validators por módulo

FASE 3: Repository Layer ⏱️ 2h

✅ BaseRepository
✅ CategoryRepository
✅ ProductRepository
✅ CustomerRepository
✅ OrderRepository
✅ SaleRepository
✅ InventoryRepository

FASE 4: Service Layer ⏱️ 2.5h

✅ CategoryService
✅ ProductService
✅ CustomerService
✅ OrderService
✅ SaleService
✅ InventoryService
✅ AnalyticsService

FASE 5: API Layer (tRPC) ⏱️ 2h

✅ tRPC setup + context
✅ Category router
✅ Product router
✅ Customer router
✅ Order router
✅ Sale router
✅ Inventory router
✅ Analytics router
✅ Root router

FASE 6: Testing & Refinamiento ⏱️ 1h

✅ Tests unitarios
✅ Tests de integración
✅ Documentación
✅ Optimizaciones