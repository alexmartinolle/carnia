import DashboardContent from '@/components/panel/DashboardContent'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <DashboardContent locale={locale} />
}
