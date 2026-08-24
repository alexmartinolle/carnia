'use client'

import { usePathname } from 'next/navigation'
import TopBar from './TopBar'

// Order matters: more specific prefixes first, '/panel' (dashboard) last as fallback.
const TITLES: Array<[string, string]> = [
  ['/panel/productos', 'Productos'],
  ['/panel/pedidos', 'Pedidos'],
  ['/panel/stock', 'Stock'],
  ['/panel/ventas', 'Ventas'],
  ['/panel/categorias', 'Categorías'],
  ['/panel/estadisticas', 'Estadísticas'],
  ['/panel/ia', 'IA / Previsión'],
  ['/panel', 'Dashboard'],
]

export default function TopBarAuto({ locale }: { locale: string }) {
  const pathname = usePathname()
  const stripped = pathname.replace(new RegExp(`^/${locale}`), '')

  let title = 'Panel'
  for (const [key, label] of TITLES) {
    if (stripped === key || stripped.startsWith(key + '/')) {
      title = label
      break
    }
  }

  return <TopBar title={title} locale={locale} />
}
