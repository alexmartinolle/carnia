'use client'

import { useState } from 'react'
import { Search, Camera, Package, Trash2, AlertTriangle, TrendingDown, DollarSign, Filter, CheckCircle, XCircle, Clock, Download } from 'lucide-react'

type StockProduct = {
  id: string
  name: string
  sku: string
  stock: number
  unit: string
  coverageDays: number
  coverageStatus: 'sufficient' | 'warning' | 'critical'
  expiryDate?: string
  value: number
  category: string
}

type WasteRisk = {
  id: string
  product: string
  currentStock: string
  expiryDate: string
  valueAtRisk: string
}

const STOCK_PRODUCTS: StockProduct[] = [
  { id: '1', name: 'Chuletón de ternera', sku: 'TER-001', stock: 15.2, unit: 'kg', coverageDays: 8, coverageStatus: 'sufficient', value: 532, category: 'Ternera' },
  { id: '2', name: 'Secreto ibérico', sku: 'CER-003', stock: 5.1, unit: 'kg', coverageDays: 2, coverageStatus: 'critical', expiryDate: '2026-06-06', value: 306, category: 'Cerdo' },
  { id: '3', name: 'Lomo alto', sku: 'TER-005', stock: 5.0, unit: 'kg', coverageDays: 0.17, coverageStatus: 'critical', value: 250, category: 'Ternera' },
  { id: '4', name: 'Pollo entero', sku: 'POL-001', stock: 12.0, unit: 'ud', coverageDays: 4, coverageStatus: 'warning', expiryDate: '2026-06-08', value: 180, category: 'Pollo' },
  { id: '5', name: 'Hamburguesas de buey', sku: 'TER-012', stock: 3.0, unit: 'kg', coverageDays: 1, coverageStatus: 'warning', expiryDate: '2026-06-05', value: 45, category: 'Ternera' },
  { id: '6', name: 'Costillas de cordero', sku: 'COR-002', stock: 8.5, unit: 'kg', coverageDays: 12, coverageStatus: 'sufficient', value: 425, category: 'Cordero' },
  { id: '7', name: 'Chorizo ibérico', sku: 'EMB-004', stock: 4.2, unit: 'kg', coverageDays: 15, coverageStatus: 'sufficient', value: 126, category: 'Embutidos' },
  { id: '8', name: 'Entrecot', sku: 'TER-008', stock: 6.8, unit: 'kg', coverageDays: 3, coverageStatus: 'warning', value: 408, category: 'Ternera' },
]

const WASTE_RISKS: WasteRisk[] = [
  { id: '1', product: 'Secreto ibérico', currentStock: '5.1 kg', expiryDate: 'Mañana', valueAtRisk: '45 €' },
  { id: '2', product: 'Hamburguesas de buey', currentStock: '3.0 kg', expiryDate: 'Mañana', valueAtRisk: '25 €' },
  { id: '3', product: 'Pollo entero', currentStock: '12.0 ud', expiryDate: 'En 3 días', valueAtRisk: '15 €' },
]

const LOW_STOCK = [
  { product: 'Lomo alto', stock: '5.0 kg', threshold: '8 kg', urgency: 'critical' },
  { product: 'Hamburguesas de buey', stock: '3.0 kg', threshold: '10 kg', urgency: 'critical' },
  { product: 'Secreto ibérico', stock: '5.1 kg', threshold: '5 kg', urgency: 'warning' },
]

export default function StockPage() {
  const [isReceiptMode, setIsReceiptMode] = useState(false)
  const [isCleaningMode, setIsCleaningMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const totalInventoryValue = STOCK_PRODUCTS.reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Stock</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestión de inventario y control de mermas</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 lg:flex-none lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 py-2.5 rounded-lg bg-[#1f100a] border border-white/10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#E57368]"
            />
          </div>

          <button
            onClick={() => setIsReceiptMode(!isReceiptMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isReceiptMode
                ? 'bg-[#C0392B] text-white'
                : 'bg-[#1f100a] border border-white/10 text-zinc-300 hover:bg-white/5'
            }`}
          >
            <Download className="size-4" />
            {isReceiptMode ? 'Modo Albarán Activo' : 'Entrada de Albarán'}
          </button>

          <button
            onClick={() => setIsCleaningMode(!isCleaningMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isCleaningMode
                ? 'bg-[#C0392B] text-white'
                : 'bg-[#1f100a] border border-white/10 text-zinc-300 hover:bg-white/5'
            }`}
          >
            <Trash2 className="size-4" />
            {isCleaningMode ? 'Modo Limpieza Activo' : 'Registrar Merma'}
          </button>
        </div>
      </div>

      {/* Modo Recepción de Género (Albarán) */}
      {isReceiptMode && (
        <div className="rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Download className="size-5 text-[#E57368]" />
              Modo Recepción de Género
            </h2>
            <span className="text-sm text-zinc-400">Introduce los kilos netos que entran en cámara</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {STOCK_PRODUCTS.slice(0, 4).map((product) => (
              <ReceiptProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#C0392B]/20 flex justify-end gap-3">
            <button
              onClick={() => setIsReceiptMode(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[#C0392B] text-white hover:bg-[#a93226] transition-colors">
              Confirmar Entrada
            </button>
          </div>
        </div>
      )}

      {/* Modo Limpieza de Pieza */}
      {isCleaningMode && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Trash2 className="size-5 text-amber-400" />
              Registrar Limpieza / Deshuese
            </h2>
            <span className="text-sm text-zinc-400">Kilos de grasa/hueso retirados del stock</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {STOCK_PRODUCTS.slice(0, 4).map((product) => (
              <CleaningProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-amber-500/20 flex justify-end gap-3">
            <button
              onClick={() => setIsCleaningMode(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-amber-950 hover:bg-amber-600 transition-colors">
              Registrar Merma
            </button>
          </div>
        </div>
      )}

      {/* Zona Superior: Tarjetas de Impacto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna 1: Poco Stock */}
        <div className="rounded-xl bg-[#1f100a] border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-400" />
            Poco Stock
          </h3>
          <div className="space-y-2">
            {LOW_STOCK.map((item, i) => (
              <LowStockItem key={i} item={item} />
            ))}
          </div>
        </div>

        {/* Columna 2: Riesgo de Merma */}
        <div className="rounded-xl bg-[#1f100a] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Clock className="size-4 text-amber-400" />
              Riesgo de Merma
            </h3>
            <span className="text-xs font-semibold text-amber-400">85 € en riesgo</span>
          </div>
          <div className="space-y-2">
            {WASTE_RISKS.map((risk) => (
              <WasteRiskItem key={risk.id} risk={risk} />
            ))}
          </div>
        </div>

        {/* Columna 3: Valor del Inventario */}
        <div className="rounded-xl bg-[#1f100a] border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
            <DollarSign className="size-4 text-emerald-400" />
            Valor del Inventario
          </h3>
          <p className="text-3xl font-bold text-zinc-50 mb-2">€{totalInventoryValue.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mb-4">Valor total en cámara</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Ternera</span>
              <span className="text-zinc-200">€1,590</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Cerdo</span>
              <span className="text-zinc-200">€306</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Pollo</span>
              <span className="text-zinc-200">€180</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Cordero</span>
              <span className="text-zinc-200">€425</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Embutidos</span>
              <span className="text-zinc-200">€126</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zona Inferior: Tabla de Control */}
      <div className="rounded-xl bg-[#1f100a] border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">Control de Stock</h2>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>Todos</FilterButton>
            <FilterButton active={selectedCategory === 'Ternera'} onClick={() => setSelectedCategory('Ternera')}>Ternera</FilterButton>
            <FilterButton active={selectedCategory === 'Cerdo'} onClick={() => setSelectedCategory('Cerdo')}>Cerdo</FilterButton>
            <FilterButton active={selectedCategory === 'Pollo'} onClick={() => setSelectedCategory('Pollo')}>Pollo</FilterButton>
            <FilterButton active={selectedCategory === 'Cordero'} onClick={() => setSelectedCategory('Cordero')}>Cordero</FilterButton>
            <FilterButton active={selectedCategory === 'Embutidos'} onClick={() => setSelectedCategory('Embutidos')}>Embutidos</FilterButton>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Días Cobertura</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Caducidad</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Valor</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {STOCK_PRODUCTS.map((product) => (
                <StockRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReceiptProductCard({ product }: { product: StockProduct }) {
  return (
    <div className="rounded-lg bg-[#1f100a] border border-white/10 p-4">
      <p className="text-sm font-medium text-zinc-100 mb-2">{product.name}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          placeholder="0.0"
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#E57368]"
        />
        <span className="text-xs text-zinc-500">{product.unit}</span>
      </div>
    </div>
  )
}

function CleaningProductCard({ product }: { product: StockProduct }) {
  return (
    <div className="rounded-lg bg-[#1f100a] border border-white/10 p-4">
      <p className="text-sm font-medium text-zinc-100 mb-2">{product.name}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          placeholder="0.0"
          className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />
        <span className="text-xs text-zinc-500">{product.unit}</span>
      </div>
    </div>
  )
}

function LowStockItem({ item }: { item: { product: string; stock: string; threshold: string; urgency: string } }) {
  const isCritical = item.urgency === 'critical'
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <span className="text-sm text-zinc-300">{item.product}</span>
      <div className="text-right">
        <span className={`text-sm font-medium ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>{item.stock}</span>
        <span className="text-xs text-zinc-500 ml-1">/ {item.threshold}</span>
      </div>
    </div>
  )
}

function WasteRiskItem({ risk }: { risk: WasteRisk }) {
  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-zinc-100">{risk.product}</span>
        <span className="text-xs font-semibold text-amber-400">{risk.valueAtRisk}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Caduca: {risk.expiryDate}</span>
        <button className="text-xs text-[#E57368] hover:text-[#E57368]/80 font-medium">
          Oferta Flash
        </button>
      </div>
    </div>
  )
}

function StockRow({ product }: { product: StockProduct }) {
  const coverageColor = {
    sufficient: 'text-emerald-400 bg-emerald-400/10',
    warning: 'text-amber-400 bg-amber-400/10',
    critical: 'text-red-400 bg-red-400/10',
  }[product.coverageStatus]

  const coverageText = {
    sufficient: `${product.coverageDays} días 🟢`,
    warning: `${product.coverageDays} días 🟡`,
    critical: product.coverageDays < 1
      ? `${Math.round(product.coverageDays * 24)} horas 🔴`
      : `${product.coverageDays} días 🔴`,
  }[product.coverageStatus]

  return (
    <tr className="hover:bg-white/2 transition-colors">
      <td className="px-4 py-3">
        <span className="text-sm text-zinc-100">{product.name}</span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-400">{product.sku}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          step="0.1"
          defaultValue={product.stock}
          className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-sm text-zinc-100 focus:outline-none focus:border-[#E57368]"
        />
        <span className="text-xs text-zinc-500 ml-1">{product.unit}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${coverageColor}`}>
          {coverageText}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-300">
        {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('es-ES') : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-100 font-medium text-right">€{product.value}</td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <button className="p-1.5 rounded-md bg-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors" title="Editar">
            <Filter className="size-4" />
          </button>
          <button className="p-1.5 rounded-md bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors" title="Dar de baja">
            <XCircle className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
        active
          ? 'bg-[#C0392B] text-white'
          : 'bg-white/5 text-zinc-400 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}
