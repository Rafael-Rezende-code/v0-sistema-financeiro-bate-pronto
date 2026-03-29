import { getDashboardStats } from "./actions"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Wallet,
  Shirt,
  Users,
} from "lucide-react"
import { PRODUCT_CONFIG } from "@/lib/types"

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

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio este mês
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Vendas"
          value={String(stats.totalSales)}
          description="Total de vendas no período"
          icon={ShoppingCart}
        />
        <StatCard
          title="Faturamento"
          value={formatCurrency(stats.totalRevenue)}
          description={`Ticket médio: ${formatCurrency(stats.avgTicket)}`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Lucro"
          value={formatCurrency(stats.totalProfit)}
          description={`Margem: ${stats.profitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Saldo em Caixa"
          value={formatCurrency(stats.cashBalance)}
          description="Saldo disponível"
          icon={Wallet}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-primary" />
              Vendas por Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.salesByProduct.map((product) => {
                const config = PRODUCT_CONFIG[product.type]
                const maxCount = Math.max(...stats.salesByProduct.map(p => p.count), 1)
                const percentage = (product.count / maxCount) * 100

                return (
                  <div key={product.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{config.label}</span>
                      <span className="text-muted-foreground">
                        {product.count} vendas - {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Retiradas dos Sócios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.withdrawalsByPartner.map((partner) => {
                const lucroLiquido = stats.totalProfit / 2
                const saldoDisponivel = lucroLiquido - partner.total

                return (
                  <div
                    key={partner.partner}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div>
                      <p className="font-semibold">{partner.partner}</p>
                      <p className="text-sm text-muted-foreground">
                        Retirado: {formatCurrency(partner.total)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Disponível (50% lucro)
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(saldoDisponivel > 0 ? saldoDisponivel : 0)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Últimas Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSales.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhuma venda registrada ainda
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentSales.map((sale) => {
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
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(sale.final_price)}</p>
                      <p className="text-sm text-green-600">
                        Lucro: {formatCurrency(sale.profit)}
                      </p>
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
