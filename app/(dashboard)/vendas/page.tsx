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
    year: "numeric",
  })
}

export default async function VendasPage() {
  const sales = await getSales()
  
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.final_price), 0)
  const totalProfit = sales.reduce((sum, s) => sum + Number(s.profit), 0)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Vendas</h1>
          <p className="text-muted-foreground">
            Todas as vendas registradas
          </p>
        </div>
        <Button asChild>
          <Link href="/vendas/nova">Nova Venda</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-2.5">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              Nenhuma venda registrada ainda
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => {
                const config = PRODUCT_CONFIG[sale.product_type]

                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Shirt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {config.label}
                          {sale.personalized && (
                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              Personalizada
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sale.customer_name || "Cliente não informado"} - {formatDate(sale.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(sale.final_price)}</p>
                        <p className="text-sm text-green-600">
                          Lucro: {formatCurrency(sale.profit)}
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
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
