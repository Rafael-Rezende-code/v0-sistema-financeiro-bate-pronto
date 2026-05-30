"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Focus, ShoppingCart, TrendingUp, Target, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface FocusModeProps {
  stats: AdvancedStats
}

export function FocusMode({ stats }: FocusModeProps) {
  const [open, setOpen] = useState(false)
  const dailyProgress = stats.dailyGoal > 0 ? (stats.todayRevenue / stats.dailyGoal) * 100 : 0
  const isGoalReached = dailyProgress >= 100
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Focus className="h-4 w-4" />
          <span className="hidden sm:inline">Ver foco do dia</span>
          <span className="sm:hidden">Foco</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Focus className="h-5 w-5 text-primary" />
            Foco do Dia
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <ShoppingCart className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.todaySales}</p>
              <p className="text-xs text-muted-foreground">Vendas</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">R$ {stats.todayRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">R$ {stats.todayProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground">Lucro</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meta diaria</span>
              <span className="font-medium">R$ {stats.dailyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="absolute left-0 top-0 h-full transition-all duration-500 rounded-full bg-primary"
                style={{ width: `${Math.min(dailyProgress, 100)}%` }}
              />
            </div>
            <p className="text-center text-sm">
              {isGoalReached ? (
                <span className="text-primary font-medium">Meta diaria atingida!</span>
              ) : (
                <span className="text-muted-foreground">
                  {dailyProgress.toFixed(0)}% da meta - faltam R$ {(stats.dailyGoal - stats.todayRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ScenarioSimulatorProps {
  totalRevenue: number
  totalProfit: number
}

export function ScenarioSimulator({ totalRevenue, totalProfit }: ScenarioSimulatorProps) {
  const [open, setOpen] = useState(false)
  const [percentage, setPercentage] = useState("10")
  
  const changePercent = Number(percentage) || 0
  const newRevenue = totalRevenue * (1 + changePercent / 100)
  const newProfit = totalProfit * (1 + changePercent / 100)
  
  const presets = [
    { label: "-20%", value: -20 },
    { label: "-10%", value: -10 },
    { label: "+10%", value: 10 },
    { label: "+20%", value: 20 },
    { label: "+50%", value: 50 },
  ]
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Simular</span>
          <span className="sm:hidden">Simular</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Simulador de Cenarios
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="percentage">Variacao nas vendas (%)</Label>
            <Input
              id="percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Ex: 10 ou -10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={Number(percentage) === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPercentage(String(preset.value))}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Faturamento atual:</span>
              <span className="font-medium">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Novo faturamento:</span>
              <span className={cn(
                "font-bold",
                changePercent > 0 ? "text-primary" : changePercent < 0 ? "text-muted-foreground" : ""
              )}>
                R$ {newRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-muted-foreground">Lucro atual:</span>
              <span className="font-medium">R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Novo lucro estimado:</span>
              <span className={cn(
                "font-bold",
                changePercent > 0 ? "text-primary" : changePercent < 0 ? "text-muted-foreground" : ""
              )}>
                R$ {newProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
