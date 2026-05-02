"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getWithdrawals, addWithdrawal, getDashboardStats } from "../actions"
import type { Withdrawal, DashboardStats } from "@/lib/types"
import { Users, Plus, User, Wallet, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

const PARTNERS = [
  { id: "Rafael", name: "Rafael" },
  { id: "Joao", name: "João" },
] as const

export default function RetiradasPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<"Rafael" | "Joao" | null>(null)
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [withdrawalsData, statsData] = await Promise.all([
      getWithdrawals(),
      getDashboardStats(),
    ])
    setWithdrawals(withdrawalsData)
    setStats(statsData)
  }

  const totalByPartner = (partner: string) => {
    return withdrawals
      .filter(w => w.partner_name === partner)
      .reduce((sum, w) => sum + Number(w.amount), 0)
  }

  const availableForPartner = (partner: string) => {
    if (!stats) return 0
    const lucroLiquido = stats.totalProfit / 2
    const totalRetirado = totalByPartner(partner)
    return Math.max(0, lucroLiquido - totalRetirado)
  }

  const handleSubmit = async () => {
    if (!selectedPartner || !amount) return
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.set("partner_name", selectedPartner)
      formData.set("amount", amount)
      
      await addWithdrawal(formData)
      await loadData()
      
      setSelectedPartner(null)
      setAmount("")
      setDialogOpen(false)
    } catch (error) {
      console.error("Erro ao adicionar retirada:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalRetiradas = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0)

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Retiradas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie as retiradas dos sócios
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Retirada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Nova Retirada</DialogTitle>
              <DialogDescription>
                Registre uma retirada de lucro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 md:space-y-6 py-4">
              <div className="space-y-3">
                <Label className="text-sm">Sócio</Label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {PARTNERS.map((partner) => {
                    const isSelected = selectedPartner === partner.id
                    const available = availableForPartner(partner.id)
                    
                    return (
                      <button
                        key={partner.id}
                        onClick={() => setSelectedPartner(partner.id)}
                        className={cn(
                          "relative flex flex-col items-center rounded-lg border-2 p-3 md:p-4 transition-all hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -right-1 -top-1 md:-right-1.5 md:-top-1.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary">
                            <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="mb-1.5 md:mb-2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm md:text-base">{partner.name}</span>
                        <span className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
                          Disp: {formatCurrency(available)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10"
                />
                {selectedPartner && Number(amount) > availableForPartner(selectedPartner) && (
                  <p className="text-[10px] md:text-xs text-destructive">
                    Valor excede o disponível para {selectedPartner === "Joao" ? "João" : selectedPartner}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedPartner || !amount || isSubmitting || Number(amount) > availableForPartner(selectedPartner || "Rafael")}
                className="w-full h-10 md:h-11"
              >
                {isSubmitting ? "Registrando..." : "Registrar Retirada"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 mb-6 md:mb-8">
        {PARTNERS.map((partner) => {
          const totalRetirado = totalByPartner(partner.id)
          const disponivel = availableForPartner(partner.id)
          const lucro50 = stats ? stats.totalProfit / 2 : 0

          return (
            <Card key={partner.id}>
              <CardHeader className="pb-3 md:pb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base md:text-lg">{partner.name}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">50% do lucro líquido</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="rounded-lg border p-2 md:p-4">
                      <p className="text-[10px] md:text-sm text-muted-foreground">Parte do Lucro</p>
                      <p className="text-base md:text-xl font-bold">{formatCurrency(lucro50)}</p>
                    </div>
                    <div className="rounded-lg border p-2 md:p-4">
                      <p className="text-[10px] md:text-sm text-muted-foreground">Já Retirado</p>
                      <p className="text-base md:text-xl font-bold text-orange-600">{formatCurrency(totalRetirado)}</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "rounded-lg p-3 md:p-4",
                    disponivel > 0 ? "bg-green-50 border-green-200" : "bg-muted"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          "text-[10px] md:text-sm",
                          disponivel > 0 ? "text-green-700" : "text-muted-foreground"
                        )}>Disponível</p>
                        <p className={cn(
                          "text-lg md:text-2xl font-bold",
                          disponivel > 0 ? "text-green-700" : "text-muted-foreground"
                        )}>{formatCurrency(disponivel)}</p>
                      </div>
                      <div className={cn(
                        "rounded-lg p-1.5 md:p-2.5",
                        disponivel > 0 ? "bg-green-200" : "bg-muted-foreground/20"
                      )}>
                        <Wallet className={cn(
                          "h-4 w-4 md:h-5 md:w-5",
                          disponivel > 0 ? "text-green-700" : "text-muted-foreground"
                        )} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex justify-between text-[10px] md:text-xs">
                      <span className="text-muted-foreground">Retirado</span>
                      <span className="font-medium">
                        {lucro50 > 0 ? ((totalRetirado / lucro50) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${lucro50 > 0 ? Math.min((totalRetirado / lucro50) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Histórico de Retiradas
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Total retirado: {formatCurrency(totalRetiradas)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="flex h-32 md:h-40 items-center justify-center text-muted-foreground text-sm">
              Nenhuma retirada registrada ainda
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 md:p-4"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">
                        {withdrawal.partner_name === "Joao" ? "João" : withdrawal.partner_name}
                      </p>
                      <p className="text-[10px] md:text-sm text-muted-foreground">
                        {formatDate(withdrawal.date)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm md:text-lg font-semibold text-primary">
                    {formatCurrency(withdrawal.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
