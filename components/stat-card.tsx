import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  variant?: "default" | "primary" | "highlight"
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-md",
      variant === "primary" && "bg-primary text-primary-foreground",
      variant === "highlight" && "bg-primary/5 border-primary/20",
    )}>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1">
            <p className={cn(
              "text-[11px] md:text-sm font-medium truncate",
              variant === "default" && "text-muted-foreground",
              variant === "primary" && "opacity-80",
              variant === "highlight" && "text-primary",
            )}>
              {title}
            </p>
            <p className={cn(
              "text-base md:text-2xl font-bold tracking-tight truncate",
              variant === "highlight" && "text-foreground",
            )}>
              {value}
            </p>
            {description && (
              <p className={cn(
                "text-[10px] md:text-xs truncate",
                variant === "default" && "text-muted-foreground",
                variant === "primary" && "opacity-70",
                variant === "highlight" && "text-muted-foreground",
              )}>
                {description}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-lg p-1.5 md:p-2.5 shrink-0",
            variant === "default" && "bg-primary/10",
            variant === "primary" && "bg-white/20",
            variant === "highlight" && "bg-primary/10",
          )}>
            <Icon className={cn(
              "h-4 w-4 md:h-5 md:w-5",
              variant === "default" && "text-primary",
              variant === "primary" && "text-current",
              variant === "highlight" && "text-primary",
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
