"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface WeeklyHeatmapProps {
  stats: AdvancedStats
}

export function WeeklyHeatmap({ stats }: WeeklyHeatmapProps) {
  const maxSales = Math.max(...stats.weeklyHeatmap.map(d => d.sales), 1)
  
  const getIntensityClass = (sales: number) => {
    if (sales === 0) return "bg-muted"
    const ratio = sales / maxSales
    if (ratio > 0.75) return "bg-primary"
    if (ratio > 0.5) return "bg-primary/70"
    if (ratio > 0.25) return "bg-primary/40"
    return "bg-primary/20"
  }
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Vendas por Dia da Semana</CardTitle>
        <p className="text-xs text-muted-foreground">Ultimos 30 dias</p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-2">
            {stats.weeklyHeatmap.map((day) => (
              <Tooltip key={day.day}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{day.dayShort}</span>
                    <div className={cn(
                      "w-full aspect-square rounded-md transition-all duration-300 hover:scale-110 cursor-pointer min-h-[40px]",
                      getIntensityClass(day.sales)
                    )} />
                    <span className="text-xs font-medium">{day.sales}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{day.day}</p>
                    <p>{day.sales} vendas</p>
                    <p className="text-primary">R$ {day.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
          <span className="text-xs text-muted-foreground">Menos</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-muted" />
            <div className="w-4 h-4 rounded bg-primary/20" />
            <div className="w-4 h-4 rounded bg-primary/40" />
            <div className="w-4 h-4 rounded bg-primary/70" />
            <div className="w-4 h-4 rounded bg-primary" />
          </div>
          <span className="text-xs text-muted-foreground">Mais</span>
        </div>
      </CardContent>
    </Card>
  )
}
