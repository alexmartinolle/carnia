import Link from 'next/link'
import { Store } from 'lucide-react'

export default function InfoBar() {
  return (
    <div className="flex justify-center flex-wrap gap-x-10 gap-y-2 px-6 py-4"
      style={{
        backgroundImage: 'url(/images/infobar/background.png)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
      <div className="flex items-center gap-2 text-sm bg-white px-1 py-0.5 rounded">
        <Store className="w-5 h-5" />
          Pide online y recoge en tienda
      </div>
    </div>
  )
}
