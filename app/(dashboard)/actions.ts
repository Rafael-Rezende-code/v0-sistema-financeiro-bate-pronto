"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { DashboardStats, Sale, Cashflow, Withdrawal, Inventory, ProductType } from "@/lib/types"
import { PRODUCT_CONFIG, PERSONALIZATION_COST, PERSONALIZATION_PRICE } from "@/lib/types"

export async function getDashboardStats(
  startDate?: string,
  endDate?: string
): Promise<DashboardStats> {
  const supabase = await createClient()
  
  const today = new Date()
  const start = startDate || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const end = endDate || today.toISOString().split('T')[0]

  // Buscar vendas do período
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("created_at", { ascending: false })

  const salesData = (sales || []) as Sale[]

  // Calcular estatísticas
  const totalSales = salesData.length
  const totalRevenue = salesData.reduce((sum, s) => sum + Number(s.final_price), 0)
  const totalCost = salesData.reduce((sum, s) => sum + Number(s.total_cost), 0)
  const totalProfit = salesData.reduce((sum, s) => sum + Number(s.profit), 0)
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0

  // Vendas por produto
  const salesByProduct = ['torcedor', 'jogador', 'retro'].map((type) => {
    const filtered = salesData.filter(s => s.product_type === type)
    return {
      type: type as ProductType,
      count: filtered.length,
      revenue: filtered.reduce((sum, s) => sum + Number(s.final_price), 0),
    }
  })

  // Buscar fluxo de caixa para saldo (calculado EXCLUSIVAMENTE pela tabela cashflow)
  const { data: cashflowData } = await supabase
    .from("cashflow")
    .select("*")

  const cashflow = (cashflowData || []) as Cashflow[]
  const totalEntradas = cashflow
    .filter(c => c.type === 'entrada')
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const totalSaidas = cashflow
    .filter(c => c.type === 'saida')
    .reduce((sum, c) => sum + Number(c.amount), 0)
  
  // Saldo = entradas - saídas (vendas já estão incluídas como "entrada" no cashflow)
  const cashBalance = totalEntradas - totalSaidas

  // Buscar retiradas
  const { data: withdrawalsData } = await supabase
    .from("withdrawals")
    .select("*")
    .gte("date", start)
    .lte("date", end)

  const withdrawals = (withdrawalsData || []) as Withdrawal[]
  const withdrawalsByPartner = [
    {
      partner: "Rafael",
      total: withdrawals
        .filter(w => w.partner_name === "Rafael")
        .reduce((sum, w) => sum + Number(w.amount), 0),
    },
    {
      partner: "João",
      total: withdrawals
        .filter(w => w.partner_name === "Joao")
        .reduce((sum, w) => sum + Number(w.amount), 0),
    },
  ]

  return {
    totalSales,
    totalRevenue,
    totalProfit,
    totalCost,
    profitMargin,
    avgTicket,
    salesByProduct,
    recentSales: salesData.slice(0, 5),
    cashBalance,
    withdrawalsByPartner,
  }
}

export async function createSale(formData: FormData) {
  const supabase = await createClient()

  const productType = formData.get("product_type") as ProductType
  const personalized = formData.get("personalized") === "true"
  const customerName = formData.get("customer_name") as string || null
  const customPrice = formData.get("custom_price") as string
  const jogadorPriceVariant = formData.get("jogador_price_variant") as string

  const config = PRODUCT_CONFIG[productType]
  
  let basePrice = config.basePrice
  
  // Se for camisa jogador e tiver variante de preço
  if (productType === 'jogador' && jogadorPriceVariant) {
    basePrice = Number(jogadorPriceVariant)
  }
  
  // Se tiver preço customizado
  if (customPrice) {
    basePrice = Number(customPrice)
  }

  const extraPersonalization = personalized ? PERSONALIZATION_PRICE : 0
  const personalizationCost = personalized ? PERSONALIZATION_COST : 0
  
  const finalPrice = basePrice + extraPersonalization
  const baseCost = config.baseCost
  const totalCost = baseCost + personalizationCost
  const profit = finalPrice - totalCost

  const { error } = await supabase.from("sales").insert({
    customer_name: customerName,
    product_type: productType,
    personalized,
    base_price: basePrice,
    extra_personalization: extraPersonalization,
    final_price: finalPrice,
    base_cost: baseCost,
    personalization_cost: personalizationCost,
    total_cost: totalCost,
    profit,
    jogador_price_variant: jogadorPriceVariant ? Number(jogadorPriceVariant) : null,
  })

  if (error) {
    throw new Error(`Erro ao criar venda: ${error.message}`)
  }

  // Registrar no fluxo de caixa
  await supabase.from("cashflow").insert({
    type: "entrada",
    category: "venda",
    description: `Venda de camisa ${config.label}${personalized ? " (personalizada)" : ""}`,
    amount: finalPrice,
  })

  revalidatePath("/")
  revalidatePath("/vendas")
  revalidatePath("/caixa")
}

export async function getSales(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase.from("sales").select("*").order("created_at", { ascending: false })

  if (startDate) {
    query = query.gte("date", startDate)
  }
  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar vendas: ${error.message}`)
  }

  return (data || []) as Sale[]
}

export async function deleteSale(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("sales").delete().eq("id", id)

  if (error) {
    throw new Error(`Erro ao excluir venda: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/vendas")
}

export async function getInventory() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("inventory").select("*")

  if (error) {
    throw new Error(`Erro ao buscar estoque: ${error.message}`)
  }

  return (data || []) as Inventory[]
}

export async function updateInventory(productType: ProductType, quantity: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("inventory")
    .update({ quantity })
    .eq("product_type", productType)

  if (error) {
    throw new Error(`Erro ao atualizar estoque: ${error.message}`)
  }

  revalidatePath("/estoque")
}

export async function addInventoryPurchase(
  productType: ProductType,
  quantity: number,
  totalCost: number
) {
  const supabase = await createClient()

  // Buscar estoque atual
  const { data: current } = await supabase
    .from("inventory")
    .select("*")
    .eq("product_type", productType)
    .single()

  if (current) {
    const currentQty = current.quantity || 0
    const currentAvgCost = current.avg_cost || 0
    
    // Calcular novo custo médio
    const totalCurrentValue = currentQty * currentAvgCost
    const newTotalValue = totalCurrentValue + totalCost
    const newQty = currentQty + quantity
    const newAvgCost = newQty > 0 ? newTotalValue / newQty : totalCost / quantity

    await supabase
      .from("inventory")
      .update({
        quantity: newQty,
        avg_cost: newAvgCost,
      })
      .eq("product_type", productType)

    // Registrar no fluxo de caixa
    await supabase.from("cashflow").insert({
      type: "saida",
      category: "compra_estoque",
      description: `Compra de ${quantity} camisas ${PRODUCT_CONFIG[productType].label}`,
      amount: totalCost,
    })
  }

  revalidatePath("/estoque")
  revalidatePath("/caixa")
  revalidatePath("/")
}

export async function removeInventoryItem(
  productType: ProductType,
  quantity: number
) {
  const supabase = await createClient()

  // Buscar estoque atual
  const { data: current } = await supabase
    .from("inventory")
    .select("*")
    .eq("product_type", productType)
    .single()

  if (current) {
    const currentQty = current.quantity || 0
    const avgCost = current.avg_cost || 0
    
    // Garantir que não fique negativo
    const removeQty = Math.min(quantity, currentQty)
    const newQty = Math.max(0, currentQty - removeQty)

    if (removeQty > 0) {
      await supabase
        .from("inventory")
        .update({
          quantity: newQty,
        })
        .eq("product_type", productType)

      // Registrar no fluxo de caixa como saída
      const totalCostRemoved = removeQty * avgCost
      await supabase.from("cashflow").insert({
        type: "saida",
        category: "ajuste_estoque",
        description: `Retirada manual de estoque: ${removeQty} camisa(s) ${PRODUCT_CONFIG[productType].label}`,
        amount: totalCostRemoved,
      })
    }
  }

  revalidatePath("/estoque")
  revalidatePath("/caixa")
  revalidatePath("/")
}

export async function getCashflow(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  let query = supabase.from("cashflow").select("*").order("created_at", { ascending: false })

  if (startDate) {
    query = query.gte("date", startDate)
  }
  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar fluxo de caixa: ${error.message}`)
  }

  return (data || []) as Cashflow[]
}

export async function addCashflowEntry(formData: FormData) {
  const supabase = await createClient()

  const type = formData.get("type") as "entrada" | "saida"
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = Number(formData.get("amount"))

  const { error } = await supabase.from("cashflow").insert({
    type,
    category,
    description,
    amount,
  })

  if (error) {
    throw new Error(`Erro ao adicionar entrada: ${error.message}`)
  }

  revalidatePath("/caixa")
  revalidatePath("/")
}

export async function getWithdrawals(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  let query = supabase.from("withdrawals").select("*").order("created_at", { ascending: false })

  if (startDate) {
    query = query.gte("date", startDate)
  }
  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar retiradas: ${error.message}`)
  }

  return (data || []) as Withdrawal[]
}

export async function addWithdrawal(formData: FormData) {
  const supabase = await createClient()

  const partnerName = formData.get("partner_name") as "Rafael" | "Joao"
  const amount = Number(formData.get("amount"))

  const { error } = await supabase.from("withdrawals").insert({
    partner_name: partnerName,
    amount,
  })

  if (error) {
    throw new Error(`Erro ao adicionar retirada: ${error.message}`)
  }

  // Registrar no fluxo de caixa
  await supabase.from("cashflow").insert({
    type: "saida",
    category: "retirada_socio",
    description: `Retirada de ${partnerName}`,
    amount,
  })

  revalidatePath("/retiradas")
  revalidatePath("/caixa")
  revalidatePath("/")
}
