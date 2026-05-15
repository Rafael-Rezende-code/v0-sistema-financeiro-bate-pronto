"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface WeekComparisonCardProps {
  stats: AdvancedStats
}

export function WeekComparisonCard({ stats }: WeekComparisonCardProps) {
  const isGrowth = stats.weeklyGrowthPercentage >= 0
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Comparativo Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Semana Atual</p>
            <p className="text-2xl font-bold text-primary">
              R$ {stats.currentWeekRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">VS</span>
            <div className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold",
              isGrowth ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"
            )}>
              {isGrowth ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{isGrowth ? '+' : ''}{stats.weeklyGrowthPercentage.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Semana Passada</p>
            <p className="text-xl font-medium text-muted-foreground">
              R$ {stats.lastWeekRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
