"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wallet,
  Users,
  TrendingUp,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Nova Venda", href: "/vendas/nova", icon: ShoppingCart },
  { name: "Histórico", href: "/vendas", icon: TrendingUp },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Fluxo de Caixa", href: "/caixa", icon: Wallet },
  { name: "Retiradas", href: "/retiradas", icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Bate Pronto</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestão Financeira</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs font-medium text-sidebar-accent-foreground/70">Sócios</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                Rafael
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                João
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
