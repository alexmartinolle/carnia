'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { ShoppingCart, MapPin, MapPinCheckIcon } from 'lucide-react'
import { useCart, cartItemCount } from '@/lib/cart/store'
import type { Category } from '@/types/product'

const NAV_CATEGORIES = [
  { label: 'Todos los Productos',   href: '/productos'                 },
  { label: 'Ternera',   href: '/productos?cat=ternera'   },
  { label: 'Cerdo',     href: '/productos?cat=cerdo'     },
  { label: 'Cordero',   href: '/productos?cat=cordero'   },
  { label: 'Pollo',     href: '/productos?cat=pollo'     },
  { label: 'Elaborados', href: '/productos?cat=elaborados' },
  { label: 'Packs',   href: '/packs'                 },
  { label: 'Sobre Nosotros',   href: '/sobre-nosotros' },
]

function MobileProducts({ locale, onClose }: { locale: string; onClose: () => void }) {
  const categories = [
    { slug: 'ternera', name_es: 'Ternera', name_ca: 'Vedella' },
    { slug: 'cabrito', name_es: 'Cabrito', name_ca: 'Cabrit' },
    { slug: 'cerdo', name_es: 'Cerdo', name_ca: 'Porc' },
    { slug: 'pollo', name_es: 'Pollo', name_ca: 'Pollastre' },
    { slug: 'elaborados', name_es: 'Elaborados', name_ca: 'Elaborats' },
  ]

  return (
    <div className="px-4 py-2 border-b border-gray-800">
      <Link
        href={`/${locale}/productos`}
        onClick={onClose}
        className="flex items-center text-gray-300 hover:text-white
          text-sm py-2 pl-4 border-b border-gray-800
          transition-colors"
      >
        Todos
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/${locale}/productos?cat=${cat.slug}`}
          onClick={onClose}
          className="flex items-center text-gray-300 hover:text-white
            text-sm py-2 pl-4 border-b border-gray-800 last:border-0
            transition-colors"
        >
          {locale === 'es' ? cat.name_es : cat.name_ca}
        </Link>
      ))}
    </div>
  )
}

export default function Header({ locale, categories }: { locale: string; categories: Category[] }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const items = useCart((s) => s.items)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const count = mounted ? cartItemCount(items) : 0

  return (
    <header className="sticky top-0 z-50">

      {/* Top bar */}
      <div style={{ background: 'var(--color-header)' }}
        className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 h-full py-2">
          <Image
            src="/images/logo/logo.png"
            alt="Carnicería El Uru"
            height={120}
            width={360}
            className="h-full w-auto object-contain"
            priority
          />
        </Link>

        {/* Acciones derecha */}
        <div className="flex items-center gap-6">

          {/* Nuestra Tienda — Texto solo desktop */}
          <div className="flex items-center  text-gray-300 hover:text-white transition-colors gap-2 text-sm hidden md:block">
            <MapPin className="w-5 h-5"  />
            <Link href="https://maps.app.goo.gl/6pXsYs32e8vSRZBs5" target="_blank" rel="noopener noreferrer" className="hover:underline">
              {t('ourStore')}
            </Link>
          </div>

          {/* Selector idioma — solo desktop */}
          <div className="flex gap-2 hidden md:block">
            <Link href={`/es${pathname.replace(/^\/(es|ca)/, '')}`}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={locale === 'es'
                ? { background: 'var(--color-celeste)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
              ES
            </Link>
            <Link href={`/ca${pathname.replace(/^\/(es|ca)/, '')}`}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={locale === 'ca'
                ? { background: 'var(--color-celeste)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
              CA
            </Link>
          </div>

          {/* Carrito — solo desktop */}
          <Link href="/carrito"
            className="relative text-gray-300 hover:text-white transition-colors hidden md:block">
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 text-white text-[10px] w-5 h-5
                rounded-full flex items-center justify-center font-bold"
                style={{ background: 'var(--color-celeste)' }}>
                {count}
              </span>
            )}
          </Link>

          {/* Carrito — solo móvil */}
          <Link href="/carrito"
            className="relative text-gray-300 hover:text-white transition-colors md:hidden">
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 text-white text-[10px] w-5 h-5
                rounded-full flex items-center justify-center font-bold"
                style={{ background: 'var(--color-celeste)' }}>
                {count}
              </span>
            )}
          </Link>

          {/* Hamburguesa — solo móvil */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
            aria-label="Abrir menú"
          >
            <span className="block w-6 h-0.5 bg-white transition-all" />
            <span className="block w-6 h-0.5 bg-white transition-all" />
            <span className="block w-6 h-0.5 bg-white transition-all" />
          </button>
        </div>
      </div>

      {/* Nav desktop — categorías horizontales */}
      <nav style={{ background: 'rgba(26,10,0,0.95)' }}
        className="hidden md:flex px-6 gap-1 border-t border-gray-800 justify-center">
        {NAV_CATEGORIES.map((item) => (
          <Link key={item.href} href={item.href}
            className="text-gray-300 hover:text-white text-sm py-3 px-4
              border-b-2 border-transparent
              transition-colors whitespace-nowrap"
            style={{ '--tw-hover-border-color': 'var(--color-celeste)' } as React.CSSProperties}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-celeste)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div style={{ background: 'rgba(26,10,0,0.98)' }}
          className="md:hidden border-t border-gray-800">

          {/* Productos */}
          <button
            onClick={() => setShowProducts(!showProducts)}
            className="w-full flex items-center text-gray-300 hover:text-white
              text-base py-3 px-4 border-b border-gray-800 transition-colors">
            {t('products')}
          </button>

          {showProducts && <MobileProducts locale={locale} onClose={() => setMenuOpen(false)} />}

          {/* Packs */}
          <Link
            href="/packs"
            onClick={() => setMenuOpen(false)}
            className="flex items-center text-gray-300 hover:text-white
              text-base py-3 px-4 border-b border-gray-800
              transition-colors"
          >
            Packs
          </Link>

          {/* Sobre Nosotros */}
          <Link
            href="/sobre-nosotros"
            onClick={() => setMenuOpen(false)}
            className="flex items-center text-gray-300 hover:text-white
              text-base py-3 px-4 border-b border-gray-800
              transition-colors"
          >
            Sobre Nosotros
          </Link>

          {/* Ubicación */}
          <a
            href="https://maps.app.goo.gl/6pXsYs32e8vSRZBs5"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center text-gray-300 hover:text-white
              text-base py-3 px-4 border-b border-gray-800
              transition-colors"
          >
            <MapPin className="w-5 h-5 mr-2" />
            {t('ourStore')}
          </a>

          {/* Selector idioma */}
          <div className="px-4 py-4 border-t border-gray-800">
            <div className="flex gap-3">
              <Link href={`/es${pathname.replace(/^\/(es|ca)/, '')}`}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={locale === 'es'
                  ? { background: 'var(--color-celeste)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                ES
              </Link>
              <Link href={`/ca${pathname.replace(/^\/(es|ca)/, '')}`}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={locale === 'ca'
                  ? { background: 'var(--color-celeste)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                CA
              </Link>
            </div>
          </div>
        </div>
      )}

    </header>
  )
}
