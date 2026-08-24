import { TrendingUp, TrendingDown, BarChart3, DollarSign, ShoppingCart, Package, Clock, Calendar, CreditCard, Users, AlertTriangle } from 'lucide-react'

export default async function EstadisticasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Estadísticas</h1>
        <p className="text-sm text-zinc-400 mt-1">Análisis de ventas, productos y rendimiento</p>
      </div>

      {/* 1. VENTAS Y FACTURACIÓN */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <DollarSign className="size-5 text-[#E57368]" />
          Ventas y Facturación
        </h2>

        {/* Comparativas temporales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <ComparisonCard label="Hoy vs Ayer" current="€1,245" previous="€1,100" change="+13%" positive />
          <ComparisonCard label="Esta semana vs Semana anterior" current="€8,340" previous="€7,200" change="+16%" positive />
          <ComparisonCard label="Este mes vs Mes anterior" current="€32,500" previous="€28,900" change="+12%" positive />
          <ComparisonCard label="Este año vs Año anterior" current="€287,000" previous="€245,000" change="+17%" positive />
          <ComparisonCard label="Lunes vs Lunes pasado" current="€1,450" previous="€1,200" change="+21%" positive />
          <ComparisonCard label="Junio 2026 vs Junio 2025" current="€32,500" previous="€27,800" change="+17%" positive />
        </div>

        {/* Evolución - Gráficos simulados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Ingresos diarios (30 días)" type="line" data={dailyRevenueData} />
          <ChartCard title="Ingresos semanales (6 meses)" type="line" data={weeklyRevenueData} />
          <ChartCard title="Ingresos mensuales (12 meses)" type="bar" data={monthlyRevenueData} />
        </div>

        {/* Tendencia */}
        <TrendCard trend="growth" value="+15%" period="últimos 30 días" />
      </section>

      {/* 2. TICKETS Y CLIENTES */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <ShoppingCart className="size-5 text-[#E57368]" />
          Tickets y Clientes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Ticket medio diario" value="€68.50" />
          <KpiCard label="Ticket medio semanal" value="€71.20" />
          <KpiCard label="Ticket medio mensual" value="€69.80" />
          <KpiCard label="Tickets hoy" value="18" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Rango de tickets</h3>
            <div className="space-y-2">
              <TicketRange range="0-20€" count={45} percentage="25%" />
              <TicketRange range="20-50€" count={72} percentage="40%" />
              <TicketRange range="50-100€" count={48} percentage="27%" />
              <TicketRange range="+100€" count={15} percentage="8%" />
            </div>
          </div>

          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Días con más ventas</h3>
            <div className="grid grid-cols-7 gap-1">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div key={day} className="text-center">
                  <div className={`h-12 rounded-md flex items-end justify-center text-xs ${getHeatmapColor(i)}`}>
                    {['12', '15', '14', '18', '28', '35', '8'][i]}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <KpiCard label="Franja mañana (9-14h)" value="€4,200" />
          <KpiCard label="Franja tarde (14-20h)" value="€6,800" />
          <KpiCard label="Ratio Online/Física" value="35% / 65%" />
        </div>
      </section>

      {/* 3. MÉTODOS DE PAGO */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <CreditCard className="size-5 text-[#E57368]" />
          Métodos de Pago
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <PaymentMethodCard method="Efectivo" percentage="28%" amount="€9,100" />
          <PaymentMethodCard method="Tarjeta" percentage="52%" amount="€16,900" />
          <PaymentMethodCard method="Online (Redsys)" percentage="20%" amount="€6,500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Ticket medio por método</h3>
            <div className="space-y-2">
              <PaymentTicketRow method="Efectivo" avgTicket="€58.30" />
              <PaymentTicketRow method="Tarjeta" avgTicket="€75.40" />
              <PaymentTicketRow method="Online" avgTicket="€82.10" />
            </div>
          </div>

          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Transacciones por método</h3>
            <div className="space-y-2">
              <PaymentTransactionRow method="Efectivo" count={156} />
              <PaymentTransactionRow method="Tarjeta" count={224} />
              <PaymentTransactionRow method="Online" count={79} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCTOS */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Package className="size-5 text-[#E57368]" />
          Productos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Top 10 por cantidad</h3>
            <div className="space-y-2">
              {topProductsQuantity.map((p, i) => (
                <ProductRow key={i} rank={i + 1} name={p.name} value={p.value} unit={p.unit} />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Top 10 por ingresos</h3>
            <div className="space-y-2">
              {topProductsRevenue.map((p, i) => (
                <ProductRow key={i} rank={i + 1} name={p.name} value={p.value} unit={p.unit} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Ventas por categoría</h3>
            <div className="space-y-2">
              <CategoryRow name="Ternera" revenue="€12,400" percentage="38%" />
              <CategoryRow name="Cerdo" revenue="€8,200" percentage="25%" />
              <CategoryRow name="Pollo" revenue="€6,100" percentage="19%" />
              <CategoryRow name="Cordero" revenue="€3,800" percentage="12%" />
              <CategoryRow name="Embutidos" revenue="€2,000" percentage="6%" />
            </div>
          </div>

          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Productos sin ventas (30 días)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Chorizo picante</span>
                <span className="text-zinc-500">0 ventas</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Morcilla dulce</span>
                <span className="text-zinc-500">0 ventas</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Secreto ibérico</span>
                <span className="text-zinc-500">0 ventas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STOCK Y MERMA */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="size-5 text-[#E57368]" />
          Stock y Merma
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Valor stock actual" value="€15,800" />
          <KpiCard label="Productos con ajustes" value="12" />
          <KpiCard label="Productos agotados" value="5" />
          <KpiCard label="Próximos a caducar" value="8" />
        </div>

        <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
          <h3 className="text-sm font-medium text-zinc-100 mb-3">Productos con más ajustes manuales</h3>
          <div className="space-y-2">
            <StockAdjustmentRow name="Chuletón de ternera" adjustments={8} />
            <StockAdjustmentRow name="Pollo entero" adjustments={6} />
            <StockAdjustmentRow name="Lomo de cerdo" adjustments={5} />
            <StockAdjustmentRow name="Costillas de cordero" adjustments={4} />
          </div>
        </div>
      </section>

      {/* 6. PEDIDOS ONLINE */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Users className="size-5 text-[#E57368]" />
          Pedidos Online
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Online vs Tienda" value="35% / 65%" />
          <KpiCard label="Tasa conversión" value="4.2%" />
          <KpiCard label="Tiempo preparación" value="25 min" />
          <KpiCard label="Pedidos pendientes" value="3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Estado de pedidos</h3>
            <div className="space-y-2">
              <OrderStatusRow status="Pendientes" count={3} color="amber" />
              <OrderStatusRow status="Confirmados" count={12} color="blue" />
              <OrderStatusRow status="En preparación" count={5} color="purple" />
              <OrderStatusRow status="Entregados" count={45} color="emerald" />
              <OrderStatusRow status="Cancelados" count={2} color="red" />
            </div>
          </div>

          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Zonas por código postal</h3>
            <div className="space-y-2">
              <ZoneRow postalCode="08001" count={18} />
              <ZoneRow postalCode="08002" count={14} />
              <ZoneRow postalCode="08003" count={11} />
              <ZoneRow postalCode="08004" count={9} />
              <ZoneRow postalCode="08005" count={7} />
            </div>
          </div>
        </div>
      </section>

      {/* 7. ESTACIONALIDAD */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Calendar className="size-5 text-[#E57368]" />
          Estacionalidad
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Ventas por mes</h3>
            <div className="space-y-2">
              {monthlySales.map((m, i) => (
                <MonthRow key={i} month={m.month} revenue={m.revenue} change={m.change} />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
            <h3 className="text-sm font-medium text-zinc-100 mb-3">Productos estacionales</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-300 mb-1">Verano vs Invierno</p>
                <div className="space-y-1">
                  <SeasonalProduct name="Pollo asado" summer="↑ 40%" winter="↓ 25%" />
                  <SeasonalProduct name="Choricitos" summer="↓ 30%" winter="↑ 35%" />
                  <SeasonalProduct name="Cordero" summer="↓ 20%" winter="↑ 45%" />
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-sm text-zinc-300 mb-1">Impacto festivos</p>
                <div className="space-y-1">
                  <HolidayImpact holiday="Navidad" impact="+65%" />
                  <HolidayImpact holiday="Semana Santa" impact="+40%" />
                  <HolidayImpact holiday="Sant Joan" impact="+30%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ComparisonCard({ label, current, previous, change, positive }: { label: string; current: string; previous: string; change: string; positive: boolean }) {
  const Trend = positive ? TrendingUp : TrendingDown
  const trendColor = positive ? 'text-emerald-400' : 'text-rose-400'
  return (
    <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
      <p className="text-sm text-zinc-400 mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-xl font-semibold text-zinc-50">{current}</p>
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <Trend className="size-3" />
          <span>{change}</span>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-1">Anterior: {previous}</p>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
      <p className="text-2xl font-semibold text-zinc-50">{value}</p>
      <p className="text-sm text-zinc-400 mt-1">{label}</p>
    </div>
  )
}

function ChartCard({ title, type, data }: { title: string; type: 'line' | 'bar'; data: number[] }) {
  const max = Math.max(...data)
  return (
    <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
      <h3 className="text-sm font-medium text-zinc-100 mb-3">{title}</h3>
      <div className="flex items-end gap-1 h-32">
        {data.map((value, i) => (
          <div
            key={i}
            className={`flex-1 ${type === 'bar' ? 'bg-[#E57368]/80 hover:bg-[#E57368]' : 'bg-[#E57368]/30'} rounded-t transition-colors`}
            style={{ height: `${(value / max) * 100}%` }}
            title={value.toString()}
          />
        ))}
      </div>
    </div>
  )
}

function TrendCard({ trend, value, period }: { trend: 'growth' | 'decline'; value: string; period: string }) {
  const isGrowth = trend === 'growth'
  const Trend = isGrowth ? TrendingUp : TrendingDown
  const color = isGrowth ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${color}`}>
      <Trend className="size-5" />
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs opacity-80">{period}</p>
      </div>
    </div>
  )
}

function TicketRange({ range, count, percentage }: { range: string; count: number; percentage: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-300 w-20">{range}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-[#E57368]" style={{ width: percentage }} />
      </div>
      <span className="text-xs text-zinc-500 w-12 text-right">{count}</span>
    </div>
  )
}

function getHeatmapColor(index: number): string {
  const colors = [
    'bg-emerald-500/20 text-emerald-300',
    'bg-emerald-500/30 text-emerald-300',
    'bg-emerald-500/25 text-emerald-300',
    'bg-emerald-500/40 text-emerald-300',
    'bg-[#E57368]/50 text-[#E57368]',
    'bg-[#E57368]/70 text-[#E57368]',
    'bg-zinc-500/20 text-zinc-400',
  ]
  return colors[index]
}

function PaymentMethodCard({ method, percentage, amount }: { method: string; percentage: string; amount: string }) {
  return (
    <div className="rounded-xl bg-[#1f100a] border border-white/5 p-4">
      <p className="text-sm text-zinc-400 mb-1">{method}</p>
      <p className="text-2xl font-semibold text-zinc-50">{percentage}</p>
      <p className="text-xs text-zinc-500 mt-1">{amount}</p>
    </div>
  )
}

function PaymentTicketRow({ method, avgTicket }: { method: string; avgTicket: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-300">{method}</span>
      <span className="text-zinc-100 font-medium">{avgTicket}</span>
    </div>
  )
}

function PaymentTransactionRow({ method, count }: { method: string; count: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-300">{method}</span>
      <span className="text-zinc-100 font-medium">{count} transacciones</span>
    </div>
  )
}

function ProductRow({ rank, name, value, unit }: { rank: number; name: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="size-6 rounded-full bg-[#E57368]/20 text-[#E57368] text-xs font-medium flex items-center justify-center">{rank}</span>
      <span className="flex-1 text-zinc-300 truncate">{name}</span>
      <span className="text-zinc-100 font-medium">{value} {unit}</span>
    </div>
  )
}

function CategoryRow({ name, revenue, percentage }: { name: string; revenue: string; percentage: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-300 w-24">{name}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-[#E57368]" style={{ width: percentage }} />
      </div>
      <span className="text-xs text-zinc-500 w-20 text-right">{revenue}</span>
    </div>
  )
}

function StockAdjustmentRow({ name, adjustments }: { name: string; adjustments: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-300">{name}</span>
      <span className="text-rose-400 font-medium">{adjustments} ajustes</span>
    </div>
  )
}

function OrderStatusRow({ status, count, color }: { status: string; count: number; color: string }) {
  const colorClasses = {
    amber: 'bg-amber-500/20 text-amber-300',
    blue: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    red: 'bg-rose-500/20 text-rose-300',
  }
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-300">{status}</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>{count}</span>
    </div>
  )
}

function ZoneRow({ postalCode, count }: { postalCode: string; count: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-300">{postalCode}</span>
      <span className="text-zinc-100 font-medium">{count} pedidos</span>
    </div>
  )
}

function MonthRow({ month, revenue, change }: { month: string; revenue: string; change: string }) {
  const isPositive = change.startsWith('+')
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-300 w-20">{month}</span>
      <span className="text-zinc-100 font-medium w-24">{revenue}</span>
      <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>{change}</span>
    </div>
  )
}

function SeasonalProduct({ name, summer, winter }: { name: string; summer: string; winter: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-400 w-32">{name}</span>
      <span className="text-emerald-400 w-16">{summer}</span>
      <span className="text-rose-400 w-16">{winter}</span>
    </div>
  )
}

function HolidayImpact({ holiday, impact }: { holiday: string; impact: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-400">{holiday}</span>
      <span className="text-emerald-400">{impact}</span>
    </div>
  )
}

// Mock data
const dailyRevenueData = [1200, 1450, 1100, 1800, 1650, 2100, 1900, 1400, 1750, 1600, 1950, 2200, 1850, 1500, 1700, 2050, 1900, 2300, 2100, 1750, 1600, 1850, 2000, 2200, 1950, 1700, 1500, 1800, 2100, 1950]
const weeklyRevenueData = [8200, 7800, 9100, 8500, 9400, 8900]
const monthlyRevenueData = [24500, 26800, 25200, 28900, 27500, 32500, 31000, 29800, 28500, 30200, 31500, 32800]

const topProductsQuantity = [
  { name: 'Chuletón de ternera', value: '245', unit: 'kg' },
  { name: 'Pollo entero', value: '180', unit: 'ud' },
  { name: 'Lomo de cerdo', value: '156', unit: 'kg' },
  { name: 'Costillas', value: '142', unit: 'kg' },
  { name: 'Chorizo', value: '98', unit: 'kg' },
]

const topProductsRevenue = [
  { name: 'Chuletón de ternera', value: '€8,575', unit: '' },
  { name: 'Lomo de cerdo', value: '€4,680', unit: '' },
  { name: 'Costillas', value: '€4,260', unit: '' },
  { name: 'Pollo entero', value: '€3,600', unit: '' },
  { name: 'Cordero', value: '€3,420', unit: '' },
]

const monthlySales = [
  { month: 'Ene', revenue: '€24,500', change: '+8%' },
  { month: 'Feb', revenue: '€26,800', change: '+9%' },
  { month: 'Mar', revenue: '€25,200', change: '-6%' },
  { month: 'Abr', revenue: '€28,900', change: '+15%' },
  { month: 'May', revenue: '€27,500', change: '-5%' },
  { month: 'Jun', revenue: '€32,500', change: '+18%' },
]
