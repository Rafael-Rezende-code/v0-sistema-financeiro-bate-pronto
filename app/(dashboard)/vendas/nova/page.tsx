"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createSale } from "../../actions"
import { PRODUCT_CONFIG, PERSONALIZATION_PRICE, type ProductType } from "@/lib/types"
import { ShoppingCart, Shirt, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const JOGADOR_VARIANTS = [
  { price: 200, label: "R$ 200" },
  { price: 220, label: "R$ 220" },
  { price: 230, label: "R$ 230" },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function NovaVendaPage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [personalized, setPersonalized] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [jogadorVariant, setJogadorVariant] = useState<number | null>(null)
  const [customPrice, setCustomPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const calculatePrice = () => {
    if (!selectedProduct) return { price: 0, cost: 0, profit: 0 }
    
    const config = PRODUCT_CONFIG[selectedProduct]
    let basePrice = config.basePrice
    
    if (selectedProduct === 'jogador' && jogadorVariant) {
      basePrice = jogadorVariant
    }
    
    if (customPrice) {
      basePrice = Number(customPrice)
    }
    
    const finalPrice = basePrice + (personalized ? PERSONALIZATION_PRICE : 0)
    const totalCost = config.baseCost + (personalized ? 20 : 0)
    const profit = finalPrice - totalCost
    
    return { price: finalPrice, cost: totalCost, profit }
  }

  const { price, cost, profit } = calculatePrice()

  const handleSubmit = async () => {
    if (!selectedProduct) return
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.set("product_type", selectedProduct)
      formData.set("personalized", personalized.toString())
      formData.set("customer_name", customerName)
      
      if (selectedProduct === 'jogador' && jogadorVariant) {
        formData.set("jogador_price_variant", jogadorVariant.toString())
      }
      
      if (customPrice) {
        formData.set("custom_price", customPrice)
      }
      
      await createSale(formData)
      setSuccess(true)
      
      setTimeout(() => {
        setSelectedProduct(null)
        setPersonalized(false)
        setCustomerName("")
        setJogadorVariant(null)
        setCustomPrice("")
        setSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Erro ao criar venda:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Venda Registrada!</h2>
            <p className="mt-2 text-muted-foreground">
              Lucro: {formatCurrency(profit)}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Nova Venda</h1>
        <p className="text-muted-foreground">
          Registre uma nova venda de camisa
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5 text-primary" />
                Tipo de Camisa
              </CardTitle>
              <CardDescription>
                Selecione o modelo vendido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {(Object.keys(PRODUCT_CONFIG) as ProductType[]).map((type) => {
                  const config = PRODUCT_CONFIG[type]
                  const isSelected = selectedProduct === type
                  
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedProduct(type)
                        setJogadorVariant(null)
                        setCustomPrice("")
                      }}
                      className={cn(
                        "relative flex flex-col items-center rounded-xl border-2 p-6 transition-all hover:border-primary/50",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Shirt className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="mt-1 text-lg font-bold text-primary">
                        {formatCurrency(config.basePrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Custo: {formatCurrency(config.baseCost)}
                      </p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {selectedProduct === 'jogador' && (
            <Card>
              <CardHeader>
                <CardTitle>Variante de Preço</CardTitle>
                <CardDescription>
                  Selecione o preço da camisa jogador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {JOGADOR_VARIANTS.map((variant) => (
                    <button
                      key={variant.price}
                      onClick={() => {
                        setJogadorVariant(variant.price)
                        setCustomPrice("")
                      }}
                      className={cn(
                        "rounded-lg border-2 p-4 text-center transition-all hover:border-primary/50",
                        jogadorVariant === variant.price
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <span className="text-lg font-bold">{variant.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="personalized" className="text-base font-medium">
                    Personalização
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Adiciona +{formatCurrency(PERSONALIZATION_PRICE)} ao preço
                  </p>
                </div>
                <Switch
                  id="personalized"
                  checked={personalized}
                  onCheckedChange={setPersonalized}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
                <Input
                  id="customerName"
                  placeholder="Digite o nome do cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPrice">Preço Personalizado (opcional)</Label>
                <Input
                  id="customPrice"
                  type="number"
                  placeholder="Ex: 150"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para usar o preço padrão
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProduct ? (
                <>
                  <div className="space-y-3 rounded-lg bg-muted p-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produto</span>
                      <span className="font-medium">
                        {PRODUCT_CONFIG[selectedProduct].label}
                      </span>
                    </div>
                    {selectedProduct === 'jogador' && jogadorVariant && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Variante</span>
                        <span className="font-medium">
                          {formatCurrency(jogadorVariant)}
                        </span>
                      </div>
                    )}
                    {personalized && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Personalização</span>
                        <span className="font-medium">
                          +{formatCurrency(PERSONALIZATION_PRICE)}
                        </span>
                      </div>
                    )}
                    {customPrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço Custom</span>
                        <span className="font-medium">
                          {formatCurrency(Number(customPrice))}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(price)}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Custo</span>
                      <span>{formatCurrency(cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lucro</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(profit)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? "Registrando..." : "Registrar Venda"}
                  </Button>
                </>
              ) : (
                <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
                  Selecione um produto para ver o resumo
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
