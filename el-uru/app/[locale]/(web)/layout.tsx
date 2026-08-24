import Header from '@/components/web/Header'
import Link from 'next/link'

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-white font-bold text-lg mb-2">Carnicería El Uru</p>
          <p className="text-sm">La mejor carne Argentina y Uruguaya de Barcelona</p>
          <p className="text-sm">🇦🇷 🇺🇾</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-base">Horario</p>
          <p className="text-base">Martes a Sábado</p>
          <p className="text-base">9:00–14:00 · 17:00–20:30</p>
          <p className="text-base">Domingo</p>
          <p className="text-base">9:00–14:00</p>
          <p className="text-base">Lunes Cerrado</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-base">Contacto</p>
          <p className="text-base">Gran Via de Lluís Companys, 102, 08330 Premià de Mar, Barcelona</p>
          <p className="text-base">643 99 64 12</p>
          <p className="text-base">info@eluru.es</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-base">Legal</p>
          <div className="flex flex-col gap-2">
            <Link href="/sobre-nosotros" className="text-sm hover:text-white transition-colors">Sobre Nosotros</Link>
            <Link href="/privacidad" className="text-sm hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="text-sm hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link href="/cookies" className="text-sm hover:text-white transition-colors">Política de Cookies</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} Carnicería El Uru. Todos los derechos reservados.
      </div>
    </footer>
  )
}

export default async function WebLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <Header locale={locale} categories={[]} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
