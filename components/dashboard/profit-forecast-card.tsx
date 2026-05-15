"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface ProfitForecastCardProps {
  stats: AdvancedStats
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return (
    <span>
      {prefix}{displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
    </span>
  )
}

export function ProfitForecastCard({ stats }: ProfitForecastCardProps) {
  const progress = stats.daysInMonth > 0 
    ? (stats.daysElapsed / stats.daysInMonth) * 100 
    : 0
  
  const profitProgress = stats.projectedMonthProfit > 0 
    ? (stats.currentMonthProfit / stats.projectedMonthProfit) * 100 
    : 0

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Previsao de Lucro Mensal</CardTitle>
          <Zap className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-primary">
            R$ <AnimatedNumber value={stats.projectedMonthProfit} />
          </div>
          <p className="text-sm text-muted-foreground">Baseado no ritmo atual de vendas</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso do mes ({stats.daysElapsed}/{stats.daysInMonth} dias)</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${Math.min(profitProgress, 100)}%` }}
            />
            <div 
              className="absolute top-0 h-full bg-primary/30 transition-all duration-1000 ease-out rounded-full"
              style={{ left: `${Math.min(profitProgress, 100)}%`, width: `${Math.max(0, 100 - profitProgress)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Atual: <span className="font-semibold text-foreground">R$ {stats.currentMonthProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
            <span>Projetado: <span className="font-semibold text-primary">R$ {stats.projectedMonthProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Se mantiver o ritmo</p>
            <p className="text-sm font-semibold">R$ {stats.projectedMonthProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground">Se crescer 10%</p>
            <p className="text-sm font-semibold text-primary">R$ {stats.projectionOptimistic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        {stats.profitGrowthPercentage !== 0 && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg p-3 text-sm",
            stats.profitGrowthPercentage > 0 ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"
          )}>
            {stats.profitGrowthPercentage > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {stats.profitGrowthPercentage > 0 
                ? `Voce esta ${stats.profitGrowthPercentage.toFixed(0)}% acima do mes passado!` 
                : `${Math.abs(stats.profitGrowthPercentage).toFixed(0)}% abaixo do mes passado`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
