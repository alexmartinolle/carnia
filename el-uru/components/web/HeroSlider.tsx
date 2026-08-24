'use client'
import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import Link from 'next/link'

const SLIDES = [
  { image: '/images/slider/slide-1.png', alt: 'Eventos', href: '/eventos' },
  { image: '/images/slider/slide-2.png', alt: 'Packs', href: '/packs' },
  { image: '/images/slider/slide-3.png', alt: 'Elaborados', href: '/productos?cat=elaborados' },
]

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )
  const [current, setCurrent] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrent(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  return (
    <div className="relative w-full overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {SLIDES.map((slide, i) => (
            <Link
              key={i}
              href={slide.href}
              className="flex-none w-full relative block cursor-pointer"
              style={{ height: 'clamp(200px, 40vw, 480px)' }}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Botón anterior */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white transition-colors flex items-center justify-center shadow-lg hidden md:block"
      >
        ←
      </button>

      {/* Botón siguiente */}
      <button
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Slide siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white transition-colors flex items-center justify-center shadow-lg hidden md:block"
      >
        →
      </button>

      {/* Dots de navegación */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); emblaApi?.scrollTo(i) }}
            aria-label={`Ir a slide ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width:      current === i ? '24px' : '8px',
              background: current === i ? 'var(--color-brand)' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
