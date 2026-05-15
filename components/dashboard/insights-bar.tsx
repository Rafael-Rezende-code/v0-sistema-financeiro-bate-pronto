"use client"

import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Shirt, Star, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdvancedStats } from "@/lib/types"

interface InsightsBarProps {
  insights: AdvancedStats['insights']
}

const iconMap: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp className="h-4 w-4" />,
  'trending-down': <TrendingDown className="h-4 w-4" />,
  'arrow-up': <ArrowUp className="h-4 w-4" />,
  'arrow-down': <ArrowDown className="h-4 w-4" />,
  'shirt': <Shirt className="h-4 w-4" />,
  'star': <Star className="h-4 w-4" />,
  'info': <Info className="h-4 w-4" />,
  'warning': <AlertTriangle className="h-4 w-4" />,
}

export function InsightsBar({ insights }: InsightsBarProps) {
  if (!insights || insights.length === 0) return null
  
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, index) => (
        <div 
          key={index}
          className={cn(
            "flex items-center gap-3 rounded-lg border p-3 transition-all duration-300 hover:shadow-md",
            insight.type === 'success' && "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950",
            insight.type === 'warning' && "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950",
            insight.type === 'info' && "border-primary/20 bg-primary/5"
          )}
        >
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            insight.type === 'success' && "bg-green-500/10 text-green-600 dark:text-green-400",
            insight.type === 'warning' && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
            insight.type === 'info' && "bg-primary/10 text-primary"
          )}>
            {iconMap[insight.icon] || <Info className="h-4 w-4" />}
          </div>
          <p className={cn(
            "text-sm font-medium",
            insight.type === 'success' && "text-green-700 dark:text-green-300",
            insight.type === 'warning' && "text-orange-700 dark:text-orange-300",
            insight.type === 'info' && "text-foreground"
          )}>
            {insight.message}
          </p>
        </div>
      ))}
    </div>
  )
}
