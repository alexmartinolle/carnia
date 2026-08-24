import Link from 'next/link'
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Ticket, Target, TrendingDown as TrendDownIcon, Package, Clock, AlertCircle, Globe, Store, Eye, CheckCircle, Play } from 'lucide-react'
import { getPendingOrdersCount, getTodayOrdersCount, getTodaySalesTotal } from '@/lib/queries/sales'

type Kpi = {
  label: string
  value: string
  icon: React.ReactNode
  detail: string
  trend?: { dir: 'up' | 'down'; text: string }
}

type OrderStatus = {
  status: string
  count: number
  color: string
}

type StockAlert = {
  product: string
  current: string
  threshold: string
  type: 'stock' | 'expiry'
  value?: string
}

type RecentActivity = {
  id: string
  time: string
  source: 'web' | 'store'
  customer: string
  total: string
  status: string
  statusColor: string
  action: string
}

const ORDER_STATUSES: OrderStatus[] = [
  { status: 'Pendientes', count: 3, color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { status: 'En Preparación', count: 2, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { status: 'Listos', count: 5, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
]

const STOCK_ALERTS: StockAlert[] = [
  { product: 'Secreto Ibérico', current: '1.5 kg', threshold: '5 kg', type: 'stock' },
  { product: 'Chuletón de ternera', current: '2.0 kg', threshold: '8 kg', type: 'stock' },
  { product: 'Hamburguesas de buey', current: '3 kg', threshold: '-', type: 'expiry', value: '45 €' },
  { product: 'Pollo entero', current: '4 ud', threshold: '10 ud', type: 'stock' },
]

const RECENT_ACTIVITY: RecentActivity[] = [
  { id: '1', time: '19:25', source: 'web', customer: 'Juan M. (08015)', total: '68,40 €', status: 'Preparando', statusColor: 'text-amber-400 bg-amber-400/10', action: 'Ver' },
  { id: '2', time: '19:12', source: 'store', customer: 'Ticket #4821', total: '24,15 €', status: 'Pagado (Tarjeta)', statusColor: 'text-emerald-400 bg-emerald-400/10', action: 'Ver' },
  { id: '3', time: '18:55', source: 'web', customer: 'Invitado (08005)', total: '112,00 €', status: 'Pendiente', statusColor: 'text-red-400 bg-red-400/10', action: 'Preparar' },
  { id: '4', time: '18:42', source: 'store', customer: 'Ticket #4820', total: '45,80 €', status: 'Pagado (Efectivo)', statusColor: 'text-emerald-400 bg-emerald-400/10', action: 'Ver' },
  { id: '5', time: '18:30', source: 'web', customer: 'Maria L. (08002)', total: '89,50 €', status: 'Listo', statusColor: 'text-emerald-400 bg-emerald-400/10', action: 'Ver' },
]

export default async function DashboardContent({ locale }: { locale: string }) {
  const pendingCount = await getPendingOrdersCount()
  const todayCount = await getTodayOrdersCount()
  const todayTotal = await getTodaySalesTotal()

  const KPIS: Kpi[] = [
    {
      label: 'Ventas de Hoy',
      value: `€${todayTotal.toFixed(2)}`,
      icon: <DollarSign className="size-5 text-[#E57368]" />,
      detail: '+8% vs ayer',
      trend: { dir: 'up', text: '+8% vs ayer' }
    },
    {
      label: 'Tickets Emitidos',
      value: todayCount.toString(),
      icon: <Ticket className="size-5 text-[#E57368]" />,
      detail: `${Math.floor(todayCount * 0.85)} en tienda / ${Math.ceil(todayCount * 0.15)} en web`,
    },
    {
      label: 'Ticket Medio',
      value: `€${(todayTotal / (todayCount || 1)).toFixed(2)}`,
      icon: <Target className="size-5 text-[#E57368]" />,
      detail: todayTotal / (todayCount || 1) > 70 ? '↑ Más premium' : '→ Básico',
    },
    {
      label: 'Merma Acumulada',
      value: '145,20 €',
      icon: <TrendDownIcon className="size-5 text-[#E57368]" />,
      detail: 'Este mes',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Fila de Tarjetas Rápidas (KPIs Diarios) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* 2. Sección Central: Operaciones en Tiempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Pedidos Online */}
        <div className="rounded-xl bg-[#1f100a] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="size-5 text-[#E57368]" />
              Pedidos Online
            </h2>
            <Link
              href={`/${locale}/panel/pedidos`}
              className="text-xs text-[#E57368] hover:text-[#E57368]/80 transition-colors"
            >
              Ver bandeja →
            </Link>
          </div>

          <div className="space-y-3">
            {ORDER_STATUSES.map((status) => (
              <OrderStatusCard key={status.status} status={status} />
            ))}
          </div>
        </div>

        {/* Columna Derecha: Alertas de Stock y Caducidad */}
        <div className="rounded-xl bg-[#1f100a] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="size-5 text-[#E57368]" />
              Alertas de Stock y Caducidad
            </h2>
            <Link
              href={`/${locale}/panel/productos`}
              className="text-xs text-[#E57368] hover:text-[#E57368]/80 transition-colors"
            >
              Ver stock →
            </Link>
          </div>

          <div className="space-y-3">
            {STOCK_ALERTS.map((alert) => (
              <StockAlertCard key={alert.product} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Sección Inferior: Historial Reciente */}
      <section>
        <h2 className="text-base font-semibold text-zinc-100 mb-3 flex items-center gap-2">
          <Clock className="size-5 text-[#E57368]" />
          Últimos Pedidos y Tickets
        </h2>
        <div className="rounded-xl bg-[#1f100a] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Hora</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Origen</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Cliente / Ticket</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RECENT_ACTIVITY.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Trend = kpi.trend?.dir === 'up' ? TrendingUp : TrendingDown
  const trendColor = kpi.trend?.dir === 'up' ? 'text-emerald-400' : 'text-rose-400'
  return (
    <div className="rounded-xl bg-[#1f100a] border border-white/5 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="size-10 rounded-lg bg-[#C0392B]/20 flex items-center justify-center">
          {kpi.icon}
        </div>
        {kpi.trend && (
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <Trend className="size-3" />
            <span>{kpi.trend.text}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-zinc-50 tracking-tight">{kpi.value}</p>
      <p className="text-sm text-zinc-400 mt-1">{kpi.label}</p>
      <p className="text-xs text-zinc-500 mt-2">{kpi.detail}</p>
    </div>
  )
}

function OrderStatusCard({ status }: { status: OrderStatus }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${status.color}`}>
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-white/5 flex items-center justify-center">
          <Package className="size-4" />
        </div>
        <span className="text-sm font-medium">{status.status}</span>
      </div>
      <span className="text-lg font-semibold">{status.count}</span>
    </div>
  )
}

function StockAlertCard({ alert }: { alert: StockAlert }) {
  const isExpiry = alert.type === 'expiry'
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
      <div className={`size-8 rounded-full flex items-center justify-center ${isExpiry ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
        {isExpiry ? <Clock className="size-4" /> : <AlertCircle className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">{alert.product}</p>
        <p className="text-xs text-zinc-500">
          {isExpiry ? `Caduca pronto · Valor: ${alert.value}` : `Stock: ${alert.current} · Umbral: ${alert.threshold}`}
        </p>
      </div>
    </div>
  )
}

function ActivityRow({ activity }: { activity: RecentActivity }) {
  return (
    <tr className="hover:bg-white/2 transition-colors">
      <td className="px-4 py-3 text-sm text-zinc-300">{activity.time}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {activity.source === 'web' ? (
            <Globe className="size-4 text-zinc-500" />
          ) : (
            <Store className="size-4 text-zinc-500" />
          )}
          <span className="text-sm text-zinc-400">{activity.source === 'web' ? 'Web' : 'Tienda'}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-300">{activity.customer}</td>
      <td className="px-4 py-3 text-sm text-zinc-100 font-medium text-right">{activity.total}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${activity.statusColor}`}>
          {activity.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button className="text-xs text-[#E57368] hover:text-[#E57368]/80 transition-colors">
          {activity.action}
        </button>
      </td>
    </tr>
  )
}
