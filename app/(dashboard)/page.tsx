import { getDashboardStats, getAdvancedStats } from "./actions"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfitForecastCard } from "@/components/dashboard/profit-forecast-card"
import { WeekComparisonCard } from "@/components/dashboard/week-comparison-card"
import { WeeklyHeatmap } from "@/components/dashboard/weekly-heatmap"
import { FocusMode, ScenarioSimulator } from "@/components/dashboard/focus-and-simulator"
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
  const [stats, advancedStats] = await Promise.all([
    getDashboardStats(),
    getAdvancedStats(),
  ])

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visao geral do seu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <FocusMode stats={advancedStats} />
          <ScenarioSimulator totalRevenue={stats.totalRevenue} totalProfit={stats.totalProfit} />
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Vendas"
          value={String(stats.totalSales)}
          description="Total de vendas"
          icon={ShoppingCart}
        />
        <StatCard
          title="Faturamento"
          value={formatCurrency(stats.totalRevenue)}
          description={`Ticket: ${formatCurrency(stats.avgTicket)}`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Lucro"
          value={formatCurrency(stats.totalProfit)}
          description={`Margem: ${stats.profitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          variant="highlight"
        />
        <StatCard
          title="Saldo em Caixa"
          value={formatCurrency(stats.cashBalance)}
          description="Disponivel"
          icon={Wallet}
        />
      </div>

      {/* Previsao e Comparativo */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ProfitForecastCard stats={advancedStats} />
        <WeekComparisonCard stats={advancedStats} />
      </div>

      {/* Heatmap e Vendas por produto */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <WeeklyHeatmap stats={advancedStats} />
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shirt className="h-4 w-4 text-primary" />
              Vendas por Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.salesByProduct.map((product) => {
                const config = PRODUCT_CONFIG[product.type]
                const maxCount = Math.max(...stats.salesByProduct.map(p => p.count), 1)
                const percentage = (product.count / maxCount) * 100

                return (
                  <div key={product.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{config.label}</span>
                      <span className="text-muted-foreground">
                        {product.count} un. - {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retiradas dos Socios */}
      <Card className="mt-4 transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Retiradas dos Socios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.withdrawalsByPartner.map((partner) => {
              const lucroLiquido = stats.totalProfit / 2
              const saldoDisponivel = lucroLiquido - partner.total

              return (
                <div
                  key={partner.partner}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:bg-muted/50"
                >
                  <div>
                    <p className="font-semibold">{partner.partner}</p>
                    <p className="text-sm text-muted-foreground">
                      Retirado: {formatCurrency(partner.total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Disponivel</p>
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

      {/* Ultimas vendas */}
      <Card className="mt-4 transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Ultimas Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSales.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
              Nenhuma venda registrada ainda
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentSales.slice(0, 5).map((sale) => {
                const config = PRODUCT_CONFIG[sale.product_type]

                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Shirt className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {config.label}
                          {sale.personalized && (
                            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                              Pers.
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sale.customer_name || "Cliente"} - {formatDate(sale.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(sale.final_price)}</p>
                      <p className="text-xs text-primary">
                        +{formatCurrency(sale.profit)}
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
