import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary" | "success" | "warning"
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      variant === "primary" && "bg-primary text-primary-foreground",
      variant === "success" && "bg-success text-success-foreground",
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className={cn(
                "text-xs",
                variant === "default" ? "text-muted-foreground" : "opacity-70"
              )}>
                {description}
              </p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600",
                variant !== "default" && (trend.isPositive ? "text-green-200" : "text-red-200")
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}% vs período anterior
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-lg p-2.5",
            variant === "default" ? "bg-primary/10" : "bg-white/20"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              variant === "default" ? "text-primary" : "text-current"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
