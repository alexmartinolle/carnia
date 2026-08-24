'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { effectiveUnitPrice } from '@/lib/pricing'
import type { Product } from '@/types/product'

type Props = {
  products:     Product[]
  initialName?: string
  onSelect:     (p: Product) => void
  setInputRef?: (el: HTMLInputElement | null) => void
  placeholder?: string
}

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function ProductPicker({
  products,
  initialName = '',
  onSelect,
  setInputRef,
  placeholder = 'Empieza a escribir el producto...',
}: Props) {
  const [query, setQuery]         = useState(initialName)
  const [open, setOpen]           = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef              = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Normaliza nombres UNA sola vez por lista de productos (no en cada keystroke).
  const indexed = useMemo(
    () => products.map(p => ({ p, key: norm(p.name_es) + ' ' + norm(p.name_ca) })),
    [products]
  )

  const filtered = useMemo(() => {
    const q = norm(query.trim())
    const base = q
      ? indexed.filter(it => it.key.includes(q)).map(it => it.p)
      : products
    return base.slice(0, 10)
  }, [query, indexed, products])

  // Mantener el highlight dentro de rango cuando cambia el filtro
  useEffect(() => {
    setHighlight(h => Math.min(h, Math.max(filtered.length - 1, 0)))
  }, [filtered.length])

  function pick(p: Product) {
    onSelect(p)
    setQuery(p.name_es)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && filtered[highlight]) {
        e.preventDefault()
        pick(filtered[highlight])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={setInputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        placeholder={placeholder}
        className="w-full bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]"
      />

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full bg-[#1f100a] border border-white/10 rounded-lg shadow-xl shadow-black/40 max-h-64 overflow-auto"
        >
          {filtered.map((p, i) => {
            const unitLabel = p.product_type === 'WEIGHT' ? '€/kg' : '€/ud'
            const effective = effectiveUnitPrice(p)
            const onOffer   = p.is_on_offer === true && p.offer_price != null
                              && p.product_type !== 'WEIGHT'
            return (
              <li
                key={p.id}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => { e.preventDefault(); pick(p) }}
                onMouseEnter={() => setHighlight(i)}
                className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between gap-3 ${
                  i === highlight ? 'bg-white/5 text-zinc-50' : 'text-zinc-200'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  {p.name_es}
                  {onOffer && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                      OFERTA
                    </span>
                  )}
                </span>
                <span className="text-[11px] shrink-0 flex items-center gap-2">
                  {onOffer && (
                    <span className="line-through text-zinc-500">
                      {Number(p.price).toFixed(2)}
                    </span>
                  )}
                  <span className={onOffer ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                    {effective.toFixed(2)} {unitLabel}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {open && filtered.length === 0 && (
        <div className="absolute z-30 mt-1 w-full bg-[#1f100a] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-500">
          Sin resultados
        </div>
      )}
    </div>
  )
}
