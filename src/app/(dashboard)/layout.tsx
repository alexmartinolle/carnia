import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar Desktop */}
        <aside className="hidden w-64 md:block">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 px-4 md:px-6">{children}</div>
        </main>
      </div>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  )
}