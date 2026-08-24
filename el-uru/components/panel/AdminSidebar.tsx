'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Beef,
  Package,
  ClipboardList,
  TrendingUp,
  FolderTree,
  BarChart3,
  Sparkles,
  LogOut,
  Box,
} from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | 'pending'
  exact?: boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

const SECTIONS: NavSection[] = [
  {
    title: 'Tienda',
    items: [
      { href: '/panel', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/panel/ventas', label: 'Ventas', icon: TrendingUp },
      { href: '/panel/pedidos', label: 'Pedidos', icon: Package, badge: 'pending' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { href: '/panel/stock', label: 'Stock', icon: ClipboardList },
      { href: '/panel/productos', label: 'Productos', icon: Beef },
      { href: '/panel/packs', label: 'Packs', icon: Box },
      { href: '/panel/categorias', label: 'Categorías', icon: FolderTree },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { href: '/panel/estadisticas', label: 'Estadísticas', icon: BarChart3},
      { href: '/panel/ia', label: 'IA / Previsión', icon: Sparkles },
    ],
  },
]

function initials(email: string) {
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/).filter(Boolean)
  const letters = (parts[0]?.[0] ?? 'A') + (parts[1]?.[0] ?? parts[0]?.[1] ?? 'U')
  return letters.toUpperCase()
}

export default function AdminSidebar({ email, locale }: { email: string; locale: string }) {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState<number>(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/orders/pending-count')
        const data = await res.json()
        setPendingCount(data.count ?? 0)
      } catch {
        setPendingCount(0)
      }
    }
    fetchCount()
  }, [])

  const isActive = (href: string, exact?: boolean) => {
    const localized = `/${locale}${href}`
    if (exact) return pathname === localized
    return pathname === localized || pathname.startsWith(localized + '/')
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#1a0a00] border-r border-white/5 text-zinc-200">
      {/* Brand */}
      <div className="flex items-center justify-center px-4 py-5 border-b border-white/5">
        <Image
          src="/images/logo/logo.png"
          alt="El Uru"
          width={160}
          height={100}
          priority
          className="h-auto w-auto object-contain"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-2 mb-2 text-[10px] font-semibold tracking-[0.12em] text-zinc-500 uppercase">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    className={
                      active
                        ? 'group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium bg-[#C0392B] text-white shadow-sm shadow-black/20'
                        : 'group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors'
                    }
                  >
                    <Icon className={active ? 'size-4 text-white' : 'size-4 text-zinc-400 group-hover:text-zinc-200'} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (item.badge === 'pending' ? pendingCount > 0 : true) ? (
                      <span
                        className={
                          active
                            ? 'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold bg-white/20 text-white'
                            : 'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold bg-[#C0392B] text-white'
                        }
                      >
                        {item.badge === 'pending' ? pendingCount : item.badge}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 px-1">
          <div className="size-9 rounded-full bg-[#3a2218] ring-1 ring-white/10 flex items-center justify-center text-xs font-semibold text-zinc-200">
            {initials(email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-100 truncate">Admin Uru</p>
            <p className="text-[11px] text-zinc-500 truncate">Staff</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              title="Cerrar sesión"
              className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
