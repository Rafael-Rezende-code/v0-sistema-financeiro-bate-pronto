"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getInventory, addInventoryPurchase } from "../actions"
import { PRODUCT_CONFIG, type ProductType, type Inventory } from "@/lib/types"
import { Package, Plus, Shirt, Check } from "lucide-react"
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

export default function EstoquePage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [quantity, setQuantity] = useState("")
  const [totalCost, setTotalCost] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    const data = await getInventory()
    setInventory(data)
  }

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity || !totalCost) return
    
    setIsSubmitting(true)
    
    try {
      await addInventoryPurchase(
        selectedProduct,
        Number(quantity),
        Number(totalCost)
      )
      await loadInventory()
      setSelectedProduct(null)
      setQuantity("")
      setTotalCost("")
      setDialogOpen(false)
    } catch (error) {
      console.error("Erro ao registrar compra:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const unitCost = quantity && totalCost 
    ? Number(totalCost) / Number(quantity) 
    : 0

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque de camisas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Compra de Estoque</DialogTitle>
              <DialogDescription>
                Adicione novas camisas ao estoque
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Tipo de Camisa</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(PRODUCT_CONFIG) as ProductType[]).map((type) => {
                    const config = PRODUCT_CONFIG[type]
                    const isSelected = selectedProduct === type
                    
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedProduct(type)}
                        className={cn(
                          "relative flex flex-col items-center rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <Shirt className="h-5 w-5 text-primary mb-1" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Ex: 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCost">Custo Total (R$)</Label>
                  <Input
                    id="totalCost"
                    type="number"
                    placeholder="Ex: 830"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                  />
                </div>
              </div>

              {quantity && totalCost && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo unitário:</span>
                    <span className="font-medium">{formatCurrency(unitCost)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!selectedProduct || !quantity || !totalCost || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Registrando..." : "Registrar Compra"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.keys(PRODUCT_CONFIG) as ProductType[]).map((type) => {
          const config = PRODUCT_CONFIG[type]
          const item = inventory.find(i => i.product_type === type)
          const qty = item?.quantity || 0
          const avgCost = item?.avg_cost || config.baseCost

          return (
            <Card key={type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Shirt className="h-5 w-5 text-primary" />
                    </div>
                    {config.label}
                  </CardTitle>
                </div>
                <CardDescription>
                  Preço de venda: {formatCurrency(config.basePrice)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Quantidade</span>
                    </div>
                    <span className={cn(
                      "text-2xl font-bold",
                      qty === 0 && "text-destructive",
                      qty > 0 && qty <= 5 && "text-yellow-600",
                      qty > 5 && "text-green-600"
                    )}>
                      {qty}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Custo Médio</p>
                      <p className="text-lg font-semibold">{formatCurrency(avgCost)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Valor em Estoque</p>
                      <p className="text-lg font-semibold">{formatCurrency(qty * avgCost)}</p>
                    </div>
                  </div>

                  {qty === 0 && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
                      Estoque zerado
                    </div>
                  )}
                  {qty > 0 && qty <= 5 && (
                    <div className="rounded-lg bg-yellow-100 p-3 text-center text-sm text-yellow-700">
                      Estoque baixo
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
