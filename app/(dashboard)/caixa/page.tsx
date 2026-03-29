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
    year: "numeric",
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Controle de entradas e saídas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogDescription>
                Registre uma entrada ou saída de caixa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setType("entrada")
                    setCategory("")
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all",
                    type === "entrada"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-border hover:border-green-500/50"
                  )}
                >
                  <ArrowUpRight className="h-5 w-5" />
                  <span className="font-medium">Entrada</span>
                </button>
                <button
                  onClick={() => {
                    setType("saida")
                    setCategory("")
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all",
                    type === "saida"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-border hover:border-red-500/50"
                  )}
                >
                  <ArrowDownRight className="h-5 w-5" />
                  <span className="font-medium">Saída</span>
                </button>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
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
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descreva a movimentação"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!category || !amount || isSubmitting}
                className={cn(
                  "w-full",
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

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-2.5">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
              </div>
              <div className="rounded-lg bg-red-100 p-2.5">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          saldo >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "text-sm",
                  saldo >= 0 ? "text-green-700" : "text-red-700"
                )}>Saldo Atual</p>
                <p className={cn(
                  "text-2xl font-bold",
                  saldo >= 0 ? "text-green-700" : "text-red-700"
                )}>{formatCurrency(saldo)}</p>
              </div>
              <div className={cn(
                "rounded-lg p-2.5",
                saldo >= 0 ? "bg-green-200" : "bg-red-200"
              )}>
                <Wallet className={cn(
                  "h-5 w-5",
                  saldo >= 0 ? "text-green-700" : "text-red-700"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
          <CardDescription>Histórico de entradas e saídas</CardDescription>
        </CardHeader>
        <CardContent>
          {cashflow.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              Nenhuma movimentação registrada ainda
            </div>
          ) : (
            <div className="space-y-3">
              {cashflow.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      entry.type === "entrada" ? "bg-green-100" : "bg-red-100"
                    )}>
                      {entry.type === "entrada" ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{getCategoryLabel(entry.category)}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.description || "Sem descrição"} - {formatDate(entry.date)}
                      </p>
                    </div>
                  </div>
                  <p className={cn(
                    "text-lg font-semibold",
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
