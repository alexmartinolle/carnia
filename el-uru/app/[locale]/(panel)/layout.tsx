import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/panel/AdminSidebar'
import TopBarAuto from '@/components/panel/TopBarAuto'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const role = user.app_metadata?.role as string | undefined
  if (role !== 'STAFF') redirect(`/${locale}`)

  return (
    <div className="flex h-screen overflow-hidden bg-[#2a1610] text-zinc-100">
      <AdminSidebar email={user.email ?? ''} locale={locale} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBarAuto locale={locale} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
