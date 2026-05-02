import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      {/* Mobile: padding-top para o header fixo, Desktop: padding-left para sidebar */}
      <main className="pt-14 md:pt-0 md:pl-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
