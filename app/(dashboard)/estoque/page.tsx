"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItemStatus,
  deleteInventoryItem,
} from "../actions"
import { Plus, Trash2, ArrowLeftRight, Package, Truck, DollarSign } from "lucide-react"

interface InventoryItem {
  id: string
  product_type: string
  team: string | null
  size: string | null
  personalized: boolean
  status: string
  sale_price: number | null
  notes: string | null
  created_at: string
}

const PRODUCT_LABELS: Record<string, string> = {
  torcedor: "Torcedor",
  jogador: "Jogador",
  retro: "Retrô",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function StatusBadge({ status }: { status: string }) {
  if (status === "em_maos")
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Em Mãos</Badge>
  if (status === "a_caminho")
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">A Caminho</Badge>
  return <Badge variant="secondary">Vendida</Badge>
}

function ItemCard({
  item,
  onToggle,
  onDelete,
}: {
  item: InventoryItem
  onToggle: (id: string, status: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {PRODUCT_LABELS[item.product_type] ?? item.product_type}
            </span>
            {item.team && (
              <span className="text-xs text-muted-foreground">{item.team}</span>
            )}
            {item.size && (
              <Badge variant="outline" className="text-xs">{item.size}</Badge>
            )}
            {item.personalized && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-xs">
                Personalizada
              </Badge>
            )}
          </div>
          <StatusBadge status={item.status} />
        </div>

        {item.sale_price != null && (
          <p className="text-sm font-medium text-green-700 mb-1">
            {formatCurrency(item.sale_price)}
          </p>
        )}
        {item.notes && (
          <p className="text-xs text-muted-foreground mb-2 italic">{item.notes}</p>
        )}

        <div className="flex gap-2 mt-3">
          {item.status !== "vendida" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => onToggle(item.id, item.status)}
            >
              <ArrowLeftRight className="h-3 w-3 mr-1" />
              {item.status === "em_maos" ? "→ A Caminho" : "→ Em Mãos"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive h-8 w-8 p-0"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EstoquePage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productType, setProductType] = useState("torcedor")
  const [team, setTeam] = useState("")
  const [size, setSize] = useState("")
  const [personalized, setPersonalized] = useState("false")
  const [status, setStatus] = useState("em_maos")
  const [salePrice, setSalePrice] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    const data = await getInventoryItems()
    setItems(data as InventoryItem[])
  }

  const handleAdd = async () => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("product_type", productType)
      formData.set("team", team)
      formData.set("size", size)
      formData.set("personalized", personalized)
      formData.set("status", status)
      if (salePrice) formData.set("sale_price", salePrice)
      formData.set("notes", notes)
      await addInventoryItem(formData)
      await loadItems()
      setDialogOpen(false)
      setProductType("torcedor")
      setTeam("")
      setSize("")
      setPersonalized("false")
      setStatus("em_maos")
      setSalePrice("")
      setNotes("")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const next = currentStatus === "em_maos" ? "a_caminho" : "em_maos"
    await updateInventoryItemStatus(id, next)
    await loadItems()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta peça?")) return
    await deleteInventoryItem(id)
    await loadItems()
  }

  const emMaos = items.filter((i) => i.status === "em_maos")
  const aCaminho = items.filter((i) => i.status === "a_caminho")
  const valorPotencial = emMaos.reduce((sum, i) => sum + (i.sale_price ?? 0), 0)

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Estoque por Peça</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Peças individuais em mãos e a caminho
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Peça
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Peça</DialogTitle>
              <DialogDescription>
                Cadastre uma nova peça no estoque individual
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="torcedor">Torcedor</SelectItem>
                      <SelectItem value="jogador">Jogador</SelectItem>
                      <SelectItem value="retro">Retrô</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em_maos">Em Mãos</SelectItem>
                      <SelectItem value="a_caminho">A Caminho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team">Time</Label>
                  <Input
                    id="team"
                    placeholder="Ex: Flamengo"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Tamanho</Label>
                  <Input
                    id="size"
                    placeholder="Ex: G, GG"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Personalizada</Label>
                  <Select value={personalized} onValueChange={setPersonalized}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Não</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Preço (R$)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    placeholder="Ex: 120"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  placeholder="Ex: para cliente João"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button onClick={handleAdd} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Salvando..." : "Adicionar Peça"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Em Mãos</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{emMaos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">A Caminho</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{aCaminho.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Valor Potencial</span>
            </div>
            <p className="text-base md:text-xl font-bold">{formatCurrency(valorPotencial)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Em Mãos */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Em Mãos</h2>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
            {emMaos.length}
          </Badge>
        </div>
        {emMaos.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
            Nenhuma peça em mãos
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {emMaos.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* A Caminho */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">A Caminho</h2>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
            {aCaminho.length}
          </Badge>
        </div>
        {aCaminho.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
            Nenhuma peça a caminho
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {aCaminho.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
