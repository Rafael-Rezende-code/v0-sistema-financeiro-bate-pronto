"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface MonthlyGoalCardProps {
  stats: AdvancedStats
}

export function MonthlyGoalCard({ stats }: MonthlyGoalCardProps) {
  const currentRevenue = (stats.monthlyProgress / 100) * stats.monthlyGoal
  const progressCapped = Math.min(stats.monthlyProgress, 100)
  const isGoalReached = stats.monthlyProgress >= 100
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
      isGoalReached && "ring-2 ring-green-500"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Meta do Mes</CardTitle>
          <Target className={cn("h-5 w-5", isGoalReached ? "text-green-500" : "text-primary")} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold">
              R$ {currentRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground ml-2">
              / R$ {stats.monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className={cn(
            "text-2xl font-bold",
            isGoalReached ? "text-green-500" : "text-primary"
          )}>
            {stats.monthlyProgress.toFixed(0)}%
          </span>
        </div>
        
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className={cn(
              "absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full",
              isGoalReached ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${progressCapped}%` }}
          />
          {isGoalReached && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
        
        {isGoalReached ? (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">
            Parabens! Meta atingida!
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Faltam R$ {(stats.monthlyGoal - currentRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir a meta
          </p>
        )}
      </CardContent>
    </Card>
  )
}
