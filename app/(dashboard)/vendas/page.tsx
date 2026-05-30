import { getSales, deleteSale } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PRODUCT_CONFIG } from "@/lib/types"
import { TrendingUp, Shirt, Trash2 } from "lucide-react"
import Link from "next/link"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

export default async function VendasPage() {
  const sales = await getSales()
  
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.final_price), 0)
  const totalProfit = sales.reduce((sum, s) => sum + Number(s.profit), 0)

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico de Vendas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Todas as vendas registradas
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/vendas/nova">Nova Venda</Link>
        </Button>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-3 mb-6 md:mb-8">
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] md:text-sm text-muted-foreground truncate">Vendas</p>
                <p className="text-lg md:text-2xl font-bold">{sales.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-1.5 md:p-2.5 shrink-0">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] md:text-sm text-muted-foreground truncate">Faturamento</p>
                <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-1.5 md:p-2.5 shrink-0 hidden sm:block">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] md:text-sm text-muted-foreground truncate">Lucro</p>
                <p className="text-lg md:text-2xl font-bold text-green-600 truncate">{formatCurrency(totalProfit)}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-1.5 md:p-2.5 shrink-0 hidden sm:block">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="flex h-32 md:h-40 items-center justify-center text-muted-foreground text-sm">
              Nenhuma venda registrada ainda
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {sales.map((sale) => {
                const config = PRODUCT_CONFIG[sale.product_type]

                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 md:p-4"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Shirt className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base truncate">
                          {config.label}
                          {sale.personalized && (
                            <span className="ml-1.5 md:ml-2 rounded-full bg-primary/10 px-1.5 md:px-2 py-0.5 text-[9px] md:text-xs text-primary">
                              Pers.
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] md:text-sm text-muted-foreground truncate">
                          {sale.customer_name || "Cliente"} - {formatDate(sale.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-6 shrink-0 ml-2">
                      <div className="text-right">
                        <p className="font-semibold text-sm md:text-base">{formatCurrency(sale.final_price)}</p>
                        <p className="text-[10px] md:text-sm text-green-600">
                          +{formatCurrency(sale.profit)}
                        </p>
                      </div>
                      <form action={async () => {
                        "use server"
                        await deleteSale(sale.id)
                      }}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
