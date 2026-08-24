'use client'

import { useEffect, useState } from 'react'

function formatDate(d: Date, locale: string) {
  const day = d.toLocaleDateString(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
  const time = d.toLocaleTimeString(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
  // Capitalize weekday
  const capitalized = day.charAt(0).toUpperCase() + day.slice(1)
  return { day: capitalized, time }
}

export default function TopBar({ title, locale }: { title: string; locale: string }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const { day, time } = formatDate(now, locale)

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-[#1f0e06]">
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
      <div className="text-sm text-zinc-400 text-right leading-tight">
        <span>{day}</span>
        <span className="mx-1.5 text-zinc-600">·</span>
        <span>{time}</span>
      </div>
    </header>
  )
}
