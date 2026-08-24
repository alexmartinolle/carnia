'use client'

import Image from 'next/image'

export default function QualitySection() {
  return (
    <section className="py-16"
      style={{ background: '#D0E8F0' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3"
            style={{ color: 'var(--color-text-main)' }}>
            Origen de Nuestra Carne
          </h2>
          <p className="text-base max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}>
            Seleccionamos la mejor carne de Argentina, Uruguay y Galicia,
            combinando tradición y calidad excepcional.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Mapa visual */}
          <div className="relative rounded-xl overflow-hidden"
            style={{ border: '0.5px solid var(--color-warm-border)' }}>
            <div className="aspect-video relative">
              <Image
                src="/images/hero/origen.png"
                alt="Mapa de origen de nuestra carne"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-xl overflow-hidden">
              <div className="relative aspect-4/1">
                <div
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url(/images/flags/argentina.png)' }}
                />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden">
              <div className="relative aspect-4/1">
                <div
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url(/images/flags/uruguay.png)' }}
                />
              </div>
            </div>

            <div className="rounded-xl overflow-hidden">
              <div className="relative aspect-4/1">
                <div
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url(/images/flags/galicia.png)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
