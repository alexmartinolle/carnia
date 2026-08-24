import Link from 'next/link'
import Image from 'next/image'

export default function SobreNosotros() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/butcher-hero.png"
            alt="Carnicero en el mostrador"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl">
            <p className="text-white text-2xl md:text-3xl font-semibold mb-4">
              Más de 15 años llevando la mejor carne a Barcelona
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra historia */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--color-text-main)' }}>
          Nuestra historia
        </h2>
        <div className="space-y-4 text-base" style={{ color: 'var(--color-text-muted)' }}>
          <p>
            El Uru nació de la pasión por la carne de calidad. Abrimos nuestras puertas en Premià de Mar con un objetivo claro: traer a Barcelona la tradición carnica argentina y uruguaya, donde la carne no es solo un producto, sino parte de la identidad.
          </p>
          <p>
            El nombre "El Uru" es un homenaje a nuestras raíces uruguayas. Allí, la carnicería es el corazón del barrio, el lugar donde se comparten recetas, se cuenta la vida y se confía en quien te atiende. Queríamos replicar esa cercanía aquí.
          </p>
          <p>
            Hoy, seguimos con la misma filosofía del primer día: seleccionar las mejores piezas, tratar a cada cliente como en casa y mantener vivo el oficio con respeto y conocimiento.
          </p>
        </div>
      </section>

      {/* El origen de la carne */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--color-text-main)' }}>
            El origen de la carne
          </h2>
          <div className="space-y-4 text-base" style={{ color: 'var(--color-text-muted)' }}>
            <p>
              Trabajamos con ganaderos de Argentina y Uruguay, seleccionando animales de razas como Angus y Hereford, criados en pasturas naturales. Esto se traduce en una carne con marmoleado, sabor y terneza que no se consigue con métodos intensivos.
            </p>
            <p>
              Cada pieza pasa por nuestro control: verificamos el color, la textura y el aroma. Si no cumple con nuestros estándares, no entra al mostrador. Simple.
            </p>
            <p>
              También colaboramos con productores locales de Cataluña que comparten nuestra visión de ganadería respetuosa. Proximidad cuando es posible, calidad siempre.
            </p>
          </div>
        </div>
      </section>

      {/* El equipo */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-8" style={{ color: 'var(--color-text-main)' }}>
          El equipo
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-4 bg-gray-200">
              <Image
                src="/images/team/butcher-1.jpg"
                alt="Carnicero"
                width={192}
                height={192}
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-main)' }}>
              Nombre del Carnicero
            </h3>
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              Especialista en cortes argentinos y asados
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-4 bg-gray-200">
              <Image
                src="/images/team/butcher-2.jpg"
                alt="Carnicero"
                width={192}
                height={192}
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-main)' }}>
              Nombre del Carnicero
            </h3>
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              Experto en embutidos y preparaciones
            </p>
          </div>
        </div>
      </section>

      {/* El local */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-8" style={{ color: 'var(--color-text-main)' }}>
            El local
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
              <Image
                src="/images/shop/counter.jpg"
                alt="Mostrador"
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
              <Image
                src="/images/shop/camera.jpg"
                alt="Cámara frigorífica"
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
              <Image
                src="/images/shop/workshop.jpg"
                alt="Obrador"
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros valores */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-8" style={{ color: 'var(--color-text-main)' }}>
          Nuestros valores
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg" style={{ background: 'var(--color-warm-bg)', border: '0.5px solid var(--color-warm-border)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-main)' }}>
              Frescura diaria
            </h3>
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              Recibimos carne todos los días. Lo que vendemos hoy llegó hoy.
            </p>
          </div>
          <div className="p-6 rounded-lg" style={{ background: 'var(--color-warm-bg)', border: '0.5px solid var(--color-warm-border)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-main)' }}>
              Trato personalizado
            </h3>
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              Te asesoramos según lo que vas a cocinar. No vendemos, recomendamos.
            </p>
          </div>
          <div className="p-6 rounded-lg" style={{ background: 'var(--color-warm-bg)', border: '0.5px solid var(--color-warm-border)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-main)' }}>
              Producto de proximidad
            </h3>
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              Trabajamos con ganaderos locales cuando la calidad lo permite.
            </p>
          </div>
          <div className="p-6 rounded-lg" style={{ background: 'var(--color-warm-bg)', border: '0.5px solid var(--color-warm-border)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-main)' }}>
              Tradición familiar
            </h3>
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              Somos un negocio familiar, no una cadena. Aquí nos conoces.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--color-text-main)' }}>
            Ven a visitarnos
          </h2>
          <div className="space-y-2 mb-8" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-base">Gran Via de Lluís Companys, 102, 08330 Premià de Mar, Barcelona</p>
            <p className="text-base">Martes a Sábado: 9:00–14:00 · 17:00–20:30</p>
            <p className="text-base">Domingo: 9:00–14:00</p>
            <p className="text-base">Lunes: Cerrado</p>
          </div>
          <Link
            href="/productos"
            className="inline-block text-white text-base px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            style={{ background: 'var(--color-brand)' }}
          >
            Hacer pedido online
          </Link>
        </div>
      </section>
    </>
  )
}
