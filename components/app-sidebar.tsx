"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wallet,
  Users,
  TrendingUp,
  Moon,
  Sun,
  UserCircle,
  Archive,
  BarChart3,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Nova Venda", href: "/vendas/nova", icon: ShoppingCart },
  { name: "Histórico", href: "/vendas", icon: TrendingUp },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Caixa", href: "/caixa", icon: Wallet },
  { name: "Retiradas", href: "/retiradas", icon: Users },
  { name: "Clientes", href: "/clientes", icon: UserCircle },
  { name: "Lotes", href: "/lotes", icon: Archive },
  { name: "DRE", href: "/dre", icon: BarChart3 },
]

// Navegação simplificada para mobile (5 itens max para caber bem)
const mobileNavigation = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Vender", href: "/vendas/nova", icon: ShoppingCart },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Caixa", href: "/caixa", icon: Wallet },
  { name: "Sócios", href: "/retiradas", icon: Users },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <div className="flex items-center gap-3">
          <Image 
            src="/icons/icon-512.png" 
            alt="Bate Pronto" 
            width={36} 
            height={36} 
            className="rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Bate Pronto</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestão Financeira</p>
          </div>
        </div>
        <ThemeToggle />
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
  )
}

function MobileBottomNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
        {/* Theme Toggle no mobile */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition-colors"
        >
          <div className="relative h-5 w-5">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          <span className="text-[10px] font-medium">Tema</span>
        </button>
      </div>
    </nav>
  )
}

export function AppSidebar() {
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-sidebar text-sidebar-foreground md:block">
        <SidebarContent />
      </aside>
    </>
  )
}
