"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCashflow, addCashflowEntry } from "../actions"
import type { Cashflow } from "@/lib/types"
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORIES = {
  entrada: [
    { value: "venda", label: "Venda" },
    { value: "aporte", label: "Aporte de Capital" },
    { value: "outros_entrada", label: "Outros" },
  ],
  saida: [
    { value: "compra_estoque", label: "Compra de Estoque" },
    { value: "marketing", label: "Marketing/Anúncios" },
    { value: "embalagem", label: "Embalagem" },
    { value: "frete", label: "Frete" },
    { value: "retirada_socio", label: "Retirada de Sócio" },
    { value: "outros_saida", label: "Outros" },
  ],
}

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

function getCategoryLabel(category: string) {
  const allCategories = [...CATEGORIES.entrada, ...CATEGORIES.saida]
  return allCategories.find(c => c.value === category)?.label || category
}

export default function CaixaPage() {
  const [cashflow, setCashflow] = useState<Cashflow[]>([])
  const [type, setType] = useState<"entrada" | "saida">("entrada")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadCashflow()
  }, [])

  const loadCashflow = async () => {
    const data = await getCashflow()
    setCashflow(data)
  }

  const totalEntradas = cashflow
    .filter(c => c.type === "entrada")
    .reduce((sum, c) => sum + Number(c.amount), 0)
  
  const totalSaidas = cashflow
    .filter(c => c.type === "saida")
    .reduce((sum, c) => sum + Number(c.amount), 0)
  
  const saldo = totalEntradas - totalSaidas

  const handleSubmit = async () => {
    if (!category || !amount) return
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.set("type", type)
      formData.set("category", category)
      formData.set("description", description)
      formData.set("amount", amount)
      
      await addCashflowEntry(formData)
      await loadCashflow()
      
      setType("entrada")
      setCategory("")
      setDescription("")
      setAmount("")
      setDialogOpen(false)
    } catch (error) {
      console.error("Erro ao adicionar entrada:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Controle de entradas e saídas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogDescription>
                Registre uma entrada ou saída de caixa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 md:space-y-6 py-4">
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button
                  onClick={() => {
                    setType("entrada")
                    setCategory("")
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border-2 p-3 md:p-4 transition-all",
                    type === "entrada"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-border hover:border-green-500/50"
                  )}
                >
                  <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium text-sm md:text-base">Entrada</span>
                </button>
                <button
                  onClick={() => {
                    setType("saida")
                    setCategory("")
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border-2 p-3 md:p-4 transition-all",
                    type === "saida"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-border hover:border-red-500/50"
                  )}
                >
                  <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium text-sm md:text-base">Saída</span>
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES[type].map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descreva a movimentação"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!category || !amount || isSubmitting}
                className={cn(
                  "w-full h-10 md:h-11",
                  type === "entrada" && "bg-green-600 hover:bg-green-700",
                  type === "saida" && "bg-red-600 hover:bg-red-700"
                )}
              >
                {isSubmitting ? "Registrando..." : `Registrar ${type === "entrada" ? "Entrada" : "Saída"}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] md:text-sm text-muted-foreground truncate">Total Entradas</p>
                <p className="text-lg md:text-2xl font-bold text-green-600 truncate">{formatCurrency(totalEntradas)}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-1.5 md:p-2.5 shrink-0">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] md:text-sm text-muted-foreground truncate">Total Saídas</p>
                <p className="text-lg md:text-2xl font-bold text-red-600 truncate">{formatCurrency(totalSaidas)}</p>
              </div>
              <div className="rounded-lg bg-red-100 p-1.5 md:p-2.5 shrink-0">
                <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "col-span-2 lg:col-span-1",
          saldo >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        )}>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className={cn(
                  "text-[10px] md:text-sm truncate",
                  saldo >= 0 ? "text-green-700" : "text-red-700"
                )}>Saldo Atual</p>
                <p className={cn(
                  "text-lg md:text-2xl font-bold truncate",
                  saldo >= 0 ? "text-green-700" : "text-red-700"
                )}>{formatCurrency(saldo)}</p>
              </div>
              <div className={cn(
                "rounded-lg p-1.5 md:p-2.5 shrink-0",
                saldo >= 0 ? "bg-green-200" : "bg-red-200"
              )}>
                <Wallet className={cn(
                  "h-4 w-4 md:h-5 md:w-5",
                  saldo >= 0 ? "text-green-700" : "text-red-700"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Movimentações</CardTitle>
          <CardDescription className="text-xs md:text-sm">Histórico de entradas e saídas</CardDescription>
        </CardHeader>
        <CardContent>
          {cashflow.length === 0 ? (
            <div className="flex h-32 md:h-40 items-center justify-center text-muted-foreground text-sm">
              Nenhuma movimentação registrada ainda
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {cashflow.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 md:p-4"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className={cn(
                      "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full shrink-0",
                      entry.type === "entrada" ? "bg-green-100" : "bg-red-100"
                    )}>
                      {entry.type === "entrada" ? (
                        <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm md:text-base truncate">{getCategoryLabel(entry.category)}</p>
                      <p className="text-[10px] md:text-sm text-muted-foreground truncate">
                        {entry.description || "Sem descrição"} - {formatDate(entry.date)}
                      </p>
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm md:text-lg font-semibold shrink-0 ml-2",
                    entry.type === "entrada" ? "text-green-600" : "text-red-600"
                  )}>
                    {entry.type === "entrada" ? "+" : "-"}{formatCurrency(entry.amount)}
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
