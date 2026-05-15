"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface ProfitForecastCardProps {
  stats: AdvancedStats
}

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const duration = 800
    const steps = 20
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
      {prefix}{displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

  const isPositiveGrowth = stats.profitGrowthPercentage > 0

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
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
          <p className="text-sm text-muted-foreground">Baseado no ritmo atual</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{stats.daysElapsed}/{stats.daysInMonth} dias</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${Math.min(profitProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Atual: <span className="font-medium text-foreground">R$ {stats.currentMonthProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
          </div>
        </div>
        
        {stats.profitGrowthPercentage !== 0 && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg p-3 text-sm",
            isPositiveGrowth 
              ? "bg-primary/10 text-primary" 
              : "bg-muted text-muted-foreground"
          )}>
            {isPositiveGrowth ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositiveGrowth 
                ? `${stats.profitGrowthPercentage.toFixed(0)}% acima do mes passado` 
                : `${Math.abs(stats.profitGrowthPercentage).toFixed(0)}% abaixo do mes passado`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
