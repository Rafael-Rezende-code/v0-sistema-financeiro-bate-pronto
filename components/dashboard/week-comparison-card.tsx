"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface WeekComparisonCardProps {
  stats: AdvancedStats
}

export function WeekComparisonCard({ stats }: WeekComparisonCardProps) {
  const isGrowth = stats.weeklyGrowthPercentage > 0
  const isNeutral = stats.weeklyGrowthPercentage === 0
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Comparativo Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Esta semana</p>
            <p className="text-xl font-bold text-primary">
              R$ {stats.currentWeekRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold",
              isGrowth && "bg-primary/10 text-primary",
              !isGrowth && !isNeutral && "bg-muted text-muted-foreground",
              isNeutral && "bg-muted text-muted-foreground"
            )}>
              {isGrowth ? (
                <TrendingUp className="h-4 w-4" />
              ) : isNeutral ? (
                <Minus className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{isGrowth ? '+' : ''}{stats.weeklyGrowthPercentage.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Semana passada</p>
            <p className="text-lg font-medium text-muted-foreground">
              R$ {stats.lastWeekRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
