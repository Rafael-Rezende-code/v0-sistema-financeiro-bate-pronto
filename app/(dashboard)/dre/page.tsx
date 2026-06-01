import { getDRE } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatMonth(mes: string) {
  return new Date(mes + "T12:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

export default async function DREPage() {
  const dre = await getDRE()

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">DRE</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Demonstrativo de Resultado por mês
        </p>
      </div>

      {dre.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground text-sm">
            Nenhum dado disponível
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dre.map((mes: any, index: number) => {
            const anterior = dre[index + 1]
            const crescimento = anterior
              ? ((Number(mes.lucro_liquido_estimado) - Number(anterior.lucro_liquido_estimado)) / Math.abs(Number(anterior.lucro_liquido_estimado))) * 100
              : null
            const lucroPositivo = Number(mes.lucro_liquido_estimado) >= 0

            return (
              <Card key={mes.mes}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{formatMonth(mes.mes)}</CardTitle>
                    <div className="flex items-center gap-2">
                      {crescimento !== null && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${crescimento >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {crescimento >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(crescimento).toFixed(0)}% vs mês anterior
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{mes.vendas} vendas</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Faturamento</p>
                      <p className="text-sm font-bold">{formatCurrency(mes.faturamento)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Custo produto</p>
                      <p className="text-sm font-bold">{formatCurrency(mes.custo_produto)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Lucro bruto</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(mes.lucro_bruto)}</p>
                      <p className="text-xs text-muted-foreground">{mes.margem_bruta_pct}%</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Imposto</p>
                      <p className="text-sm font-bold text-amber-600">{formatCurrency(mes.imposto_periodo)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Despesas</p>
                      <p className="text-sm font-bold">{formatCurrency(mes.despesa_operacional)}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${lucroPositivo ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                      <p className="text-xs text-muted-foreground">Lucro líquido</p>
                      <p className={`text-sm font-bold ${lucroPositivo ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(mes.lucro_liquido_estimado)}
                      </p>
                      <p className="text-xs text-muted-foreground">{mes.margem_liquida_pct}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
