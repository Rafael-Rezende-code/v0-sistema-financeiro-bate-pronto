"use client"

import { useState, useEffect } from "react"
import { getPurchaseOrders, createPurchaseOrder, getUnlinkedTaxes, linkTaxToLote, updateLote } from "../actions"
import type { PurchaseOrderWithCost } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Package, Plus, Calculator, Link2, MapPin, ListChecks, Pencil } from "lucide-react"

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatUSD(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(value)
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR")
}

export default function LotesPage() {
  const [lotes, setLotes] = useState<PurchaseOrderWithCost[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState({
    quantity: "",
    purchase_amount_usd: "",
    exchange_rate: "",
    arrival_date: "",
    purchase_amount_brl: "",
    supplier: "",
    notes: "",
    tracking_code: "",
    items_description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLote, setEditingLote] = useState<PurchaseOrderWithCost | null>(null)
  const [editForm, setEditForm] = useState({
    arrival_date: "",
    tracking_code: "",
    items_description: "",
    supplier: "",
    notes: "",
  })
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [unlinkedTaxes, setUnlinkedTaxes] = useState<any[]>([])
  const [taxLoteMap, setTaxLoteMap] = useState<Record<string, string>>({})
  const [linkingId, setLinkingId] = useState<string | null>(null)

  const fetchLotes = async () => {
    try {
      const [lotesData, taxesData] = await Promise.all([
        getPurchaseOrders(),
        getUnlinkedTaxes(),
      ])
      setLotes(lotesData)
      setUnlinkedTaxes(taxesData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLotes() }, [])

  const handleLinkTax = async (cashflowId: string) => {
    const purchaseOrderId = taxLoteMap[cashflowId]
    if (!purchaseOrderId) return
    setLinkingId(cashflowId)
    try {
      await linkTaxToLote(cashflowId, purchaseOrderId)
      setTaxLoteMap((prev) => { const next = { ...prev }; delete next[cashflowId]; return next })
      await fetchLotes()
    } catch (e) {
      console.error(e)
    } finally {
      setLinkingId(null)
    }
  }

  const openEdit = (lote: PurchaseOrderWithCost) => {
    setEditingLote(lote)
    setEditForm({
      arrival_date: lote.arrival_date || "",
      tracking_code: lote.tracking_code || "",
      items_description: lote.items_description || "",
      supplier: lote.supplier || "",
      notes: lote.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingLote) return
    setIsEditSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("arrival_date", editForm.arrival_date)
      fd.set("tracking_code", editForm.tracking_code)
      fd.set("items_description", editForm.items_description)
      fd.set("supplier", editForm.supplier)
      fd.set("notes", editForm.notes)
      await updateLote(editingLote.id, fd)
      setIsEditDialogOpen(false)
      await fetchLotes()
    } catch (e) {
      console.error(e)
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const computedBRL =
    form.purchase_amount_usd && form.exchange_rate
      ? (Number(form.purchase_amount_usd) * Number(form.exchange_rate)).toFixed(2)
      : ""

  const previewCostPerUnit = (() => {
    const brl = form.purchase_amount_brl ? Number(form.purchase_amount_brl) : Number(computedBRL)
    const qty = Number(form.quantity)
    if (brl > 0 && qty > 0) return brl / qty
    return null
  })()

  const handleSubmit = async () => {
    if (!form.quantity || !form.purchase_amount_usd || !form.exchange_rate) return
    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("quantity", form.quantity)
      fd.set("purchase_amount_usd", form.purchase_amount_usd)
      fd.set("exchange_rate", form.exchange_rate)
      if (form.arrival_date) fd.set("arrival_date", form.arrival_date)
      if (form.purchase_amount_brl) fd.set("purchase_amount_brl", form.purchase_amount_brl)
      else if (computedBRL) fd.set("purchase_amount_brl", computedBRL)
      if (form.supplier) fd.set("supplier", form.supplier)
      if (form.notes) fd.set("notes", form.notes)
      if (form.tracking_code) fd.set("tracking_code", form.tracking_code)
      if (form.items_description) fd.set("items_description", form.items_description)
      await createPurchaseOrder(fd)
      setIsDialogOpen(false)
      setForm({
        quantity: "",
        purchase_amount_usd: "",
        exchange_rate: "",
        arrival_date: "",
        purchase_amount_brl: "",
        supplier: "",
        notes: "",
        tracking_code: "",
        items_description: "",
      })
      await fetchLotes()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lotes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie os lotes de compra
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lote
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Carregando...
        </div>
      ) : lotes.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
          Nenhum lote cadastrado ainda
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lotes.map((lote) => (
            <Card key={lote.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {lote.quantity} peças
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    {lote.arrival_date && (
                      <Badge variant="outline" className="text-xs">
                        {formatDate(lote.arrival_date)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(lote)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {lote.supplier && (
                  <p className="text-xs text-muted-foreground">{lote.supplier}</p>
                )}
                {lote.tracking_code && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {lote.tracking_code}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">USD</p>
                    <p className="font-medium">{formatUSD(lote.purchase_amount_usd)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Câmbio</p>
                    <p className="font-medium">R$ {Number(lote.exchange_rate).toFixed(2)}</p>
                  </div>
                  {lote.purchase_amount_brl && (
                    <div>
                      <p className="text-xs text-muted-foreground">Total BRL</p>
                      <p className="font-medium">{formatBRL(lote.purchase_amount_brl)}</p>
                    </div>
                  )}
                  {lote.unit_cost_brl && (
                    <div>
                      <p className="text-xs text-muted-foreground">Custo/peça</p>
                      <p className="font-semibold text-primary">{formatBRL(lote.unit_cost_brl)}</p>
                    </div>
                  )}
                </div>
                {(lote.min_price_40pct || lote.min_price_45pct) && (
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calculator className="h-3 w-3" />
                      Preço mínimo
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {lote.min_price_40pct && (
                        <div className="rounded bg-yellow-50 dark:bg-yellow-950 p-1.5">
                          <p className="text-muted-foreground">40% margem</p>
                          <p className="font-semibold">{formatBRL(lote.min_price_40pct)}</p>
                        </div>
                      )}
                      {lote.min_price_45pct && (
                        <div className="rounded bg-green-50 dark:bg-green-950 p-1.5">
                          <p className="text-muted-foreground">45% margem</p>
                          <p className="font-semibold">{formatBRL(lote.min_price_45pct)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {lote.items_description && (
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <ListChecks className="h-3 w-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-3">{lote.items_description}</span>
                    </p>
                  </div>
                )}
                {lote.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-2 line-clamp-2">
                    {lote.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {unlinkedTaxes.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-amber-600" />
            <h2 className="text-base font-semibold text-amber-600">Impostos não vinculados</h2>
          </div>
          <div className="space-y-3">
            {unlinkedTaxes.map((tax) => (
              <Card key={tax.id} className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tax.description || 'Imposto de importação'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tax.date)} · {formatBRL(Number(tax.amount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={taxLoteMap[tax.id] || ""}
                      onValueChange={(v) => setTaxLoteMap({ ...taxLoteMap, [tax.id]: v })}
                    >
                      <SelectTrigger className="w-52 h-9 text-xs">
                        <SelectValue placeholder="Selecione o lote" />
                      </SelectTrigger>
                      <SelectContent>
                        {lotes.map((lote) => (
                          <SelectItem key={lote.id} value={lote.id} className="text-xs">
                            {lote.quantity} peças
                            {lote.supplier ? ` — ${lote.supplier}` : ''}
                            {lote.arrival_date ? ` (${formatDate(lote.arrival_date)})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!taxLoteMap[tax.id] || linkingId === tax.id}
                      onClick={() => handleLinkTax(tax.id)}
                    >
                      {linkingId === tax.id ? 'Vinculando...' : 'Vincular'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Lote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Ex: 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival_date">Data de Chegada</Label>
                <Input
                  id="arrival_date"
                  type="date"
                  value={form.arrival_date}
                  onChange={(e) => setForm({ ...form, arrival_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_amount_usd">Valor USD *</Label>
                <Input
                  id="purchase_amount_usd"
                  type="number"
                  step="0.01"
                  value={form.purchase_amount_usd}
                  onChange={(e) => setForm({ ...form, purchase_amount_usd: e.target.value })}
                  placeholder="Ex: 500.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchange_rate">Câmbio *</Label>
                <Input
                  id="exchange_rate"
                  type="number"
                  step="0.01"
                  value={form.exchange_rate}
                  onChange={(e) => setForm({ ...form, exchange_rate: e.target.value })}
                  placeholder="Ex: 5.75"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_amount_brl">
                Valor BRL
                {computedBRL && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (calculado: R$ {computedBRL})
                  </span>
                )}
              </Label>
              <Input
                id="purchase_amount_brl"
                type="number"
                step="0.01"
                value={form.purchase_amount_brl}
                onChange={(e) => setForm({ ...form, purchase_amount_brl: e.target.value })}
                placeholder={computedBRL ? `R$ ${computedBRL}` : "Deixe em branco para calcular"}
              />
            </div>
            {previewCostPerUnit && (
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p className="font-medium flex items-center gap-1">
                  <Calculator className="h-3.5 w-3.5" />
                  Prévia do custo
                </p>
                <p>
                  Custo/peça:{" "}
                  <span className="font-semibold">{formatBRL(previewCostPerUnit)}</span>
                </p>
                <p>
                  Mín. 40%:{" "}
                  <span className="font-semibold">
                    {formatBRL(previewCostPerUnit / (1 - 0.4))}
                  </span>
                </p>
                <p>
                  Mín. 45%:{" "}
                  <span className="font-semibold">
                    {formatBRL(previewCostPerUnit / (1 - 0.45))}
                  </span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lote-notes">Observações</Label>
              <Textarea
                id="lote-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas sobre o lote"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking_code">Código de rastreio</Label>
              <Input
                id="tracking_code"
                value={form.tracking_code}
                onChange={(e) => setForm({ ...form, tracking_code: e.target.value })}
                placeholder="Ex: LZ415128335CN"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="items_description">Itens do lote</Label>
              <Textarea
                id="items_description"
                value={form.items_description}
                onChange={(e) => setForm({ ...form, items_description: e.target.value })}
                placeholder="Ex: Brasil jogador G (João), Corinthians torcedor M (Mateus)..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !form.quantity ||
                !form.purchase_amount_usd ||
                !form.exchange_rate
              }
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-arrival_date">Data de Chegada</Label>
              <Input
                id="edit-arrival_date"
                type="date"
                value={editForm.arrival_date}
                onChange={(e) => setEditForm({ ...editForm, arrival_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Fornecedor</Label>
              <Input
                id="edit-supplier"
                value={editForm.supplier}
                onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tracking_code">Código de rastreio</Label>
              <Input
                id="edit-tracking_code"
                value={editForm.tracking_code}
                onChange={(e) => setEditForm({ ...editForm, tracking_code: e.target.value })}
                placeholder="Ex: LZ415128335CN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-items_description">Itens do lote</Label>
              <Textarea
                id="edit-items_description"
                value={editForm.items_description}
                onChange={(e) => setEditForm({ ...editForm, items_description: e.target.value })}
                placeholder="Ex: Brasil jogador G (João), Corinthians torcedor M (Mateus)..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notas sobre o lote"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={isEditSubmitting}>
              {isEditSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
