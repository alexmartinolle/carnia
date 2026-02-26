import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t">
      {/* Barra de bandera */}
      <div className="h-1 header-flag" />
      
      <div className="container py-6 px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">CS</span>
              </div>
              <span className="text-sm font-semibold">Carnia</span>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-left">
              Sistema de gestión inteligente para carnicerías
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 md:items-end">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link href="/privacidad" className="hover:text-primary">
                Privacidad
              </Link>
              <Link href="/terminos" className="hover:text-primary">
                Términos
              </Link>
              <Link href="/soporte" className="hover:text-primary">
                Soporte
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Carnia. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}