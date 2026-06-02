"use client"

import { useState, useEffect } from "react"
import { getSales, deleteSale, updateSale } from "../actions"
import type { Sale } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { PRODUCT_CONFIG, CHANNEL_LABELS, SALE_TYPE_LABELS, SIZE_OPTIONS, type SaleType } from "@/lib/types"
import { TrendingUp, DollarSign, Percent, Shirt, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

function getMonthOptions() {
  const options = []
  const today = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    options.push({ value, label })
  }
  return options
}

const SALE_TYPE_BADGE: Record<string, "secondary" | "destructive" | "outline"> = {
  normal: "secondary",
  liquidacao: "destructive",
  desconto: "outline",
}

export default function VendasHistoricoPage() {
  const today = new Date()
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [filterType, setFilterType] = useState<SaleType | "all">("all")
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [editForm, setEditForm] = useState({ channel: "", team: "", size: "", sale_type: "normal", customer_name: "", custom_price: "" })
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const monthOptions = getMonthOptions()

  const fetchSales = async (month: string) => {
    setLoading(true)
    try {
      if (month === "all") {
        const data = await getSales()
        setSales(data)
      } else {
        const [year, mon] = month.split("-")
        const startDate = `${year}-${mon}-01`
        const lastDay = new Date(Number(year), Number(mon), 0).getDate()
        const endDate = `${year}-${mon}-${String(lastDay).padStart(2, "0")}`
        const data = await getSales(startDate, endDate)
        setSales(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSales(selectedMonth) }, [selectedMonth])

  const openEdit = (sale: Sale) => {
    setEditingSale(sale)
    setEditForm({
      channel: sale.channel || "",
      team: sale.team || "",
      size: sale.size || "",
      sale_type: sale.sale_type || "normal",
      customer_name: sale.customer_name || "",
      custom_price: "",
    })
  }

  const handleEditSubmit = async () => {
    if (!editingSale) return
    setIsEditSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("channel", editForm.channel)
      fd.set("team", editForm.team)
      fd.set("size", editForm.size)
      fd.set("sale_type", editForm.sale_type)
      fd.set("customer_name", editForm.customer_name)
      if (editForm.custom_price) fd.set("custom_price", editForm.custom_price)
      await updateSale(editingSale.id, fd)
      setEditingSale(null)
      await fetchSales(selectedMonth)
    } catch (e) {
      console.error(e)
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta venda?")) return
    try {
      await deleteSale(id)
      await fetchSales(selectedMonth)
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = filterType === "all" ? sales : sales.filter((s) => s.sale_type === filterType)

  const totalRevenue = filtered.reduce((sum, s) => sum + Number(s.final_price), 0)
  const totalProfit = filtered.reduce((sum, s) => sum + Number(s.profit), 0)
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico de Vendas</h1>
          <p className="text-sm md:text-base text-muted-foreground">Todas as vendas registradas</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/vendas/nova">Nova Venda</Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={(v) => setFilterType(v as SaleType | "all")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {(Object.entries(SALE_TYPE_LABELS) as [SaleType, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resumo do período */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Faturamento</p>
              <p className="font-bold text-sm truncate">{formatCurrency(totalRevenue)}</p>
              <p className="text-[10px] text-muted-foreground">{filtered.length} vendas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 shrink-0">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Lucro</p>
              <p className="font-bold text-sm text-green-600 truncate">{formatCurrency(totalProfit)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 shrink-0">
              <Percent className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Margem média</p>
              <p className="font-bold text-sm">{avgMargin.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Nenhuma venda no período
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sale) => {
            const config = PRODUCT_CONFIG[sale.product_type]
            const margin = Number(sale.final_price) > 0
              ? (Number(sale.profit) / Number(sale.final_price)) * 100
              : 0
            return (
              <Card key={sale.id} className="transition-all hover:shadow-sm">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-3">
                    <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Shirt className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-medium text-sm">{config.label}</span>
                        {sale.size && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{sale.size}</Badge>
                        )}
                        {sale.sale_type && sale.sale_type !== "normal" && (
                          <Badge
                            variant={SALE_TYPE_BADGE[sale.sale_type] ?? "secondary"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {SALE_TYPE_LABELS[sale.sale_type]}
                          </Badge>
                        )}
                        {sale.personalized && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pers.</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{formatDate(sale.date)}</span>
                        {sale.customer_name && <span>{sale.customer_name}</span>}
                        {sale.team && <span>{sale.team}</span>}
                        {sale.channel && CHANNEL_LABELS[sale.channel] && (
                          <span>{CHANNEL_LABELS[sale.channel]}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="font-semibold text-sm">{formatCurrency(Number(sale.final_price))}</p>
                      <p className="text-xs text-green-600">+{formatCurrency(Number(sale.profit))}</p>
                      <p className="text-[10px] text-muted-foreground">{margin.toFixed(0)}%</p>
                      <div className="flex gap-1 mt-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(sale)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(sale.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!editingSale} onOpenChange={(open) => { if (!open) setEditingSale(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Canal</Label>
              <Select value={editForm.channel} onValueChange={(v) => setEditForm({ ...editForm, channel: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Canal de venda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {(Object.entries(CHANNEL_LABELS) as [string, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input value={editForm.team} onChange={(e) => setEditForm({ ...editForm, team: e.target.value })} placeholder="Ex: Flamengo" />
            </div>
            <div className="space-y-2">
              <Label>Tamanho</Label>
              <Select value={editForm.size} onValueChange={(v) => setEditForm({ ...editForm, size: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Tamanho" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {SIZE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de venda</Label>
              <Select value={editForm.sale_type} onValueChange={(v) => setEditForm({ ...editForm, sale_type: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(SALE_TYPE_LABELS) as [string, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome do cliente</Label>
              <Input value={editForm.customer_name} onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })} placeholder="Nome do cliente" />
            </div>
            <div className="space-y-2">
              <Label>Preço personalizado (opcional)</Label>
              <Input type="number" value={editForm.custom_price} onChange={(e) => setEditForm({ ...editForm, custom_price: e.target.value })} placeholder="Deixe em branco para manter" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSale(null)}>Cancelar</Button>
            <Button onClick={handleEditSubmit} disabled={isEditSubmitting}>
              {isEditSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
