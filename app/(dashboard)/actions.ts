"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { DashboardStats, AdvancedStats, Sale, Cashflow, Withdrawal, Inventory, ProductType, Customer, PurchaseOrderWithCost } from "@/lib/types"
import { PRODUCT_CONFIG, PERSONALIZATION_COST, PERSONALIZATION_PRICE } from "@/lib/types"

export async function getDashboardStats(
  startDate?: string,
  endDate?: string
): Promise<DashboardStats> {
  const supabase = await createClient()

  // Buscar vendas (todo o histórico por padrão)
  let salesQuery = supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (startDate) {
    salesQuery = salesQuery.gte("date", startDate)
  }
  if (endDate) {
    salesQuery = salesQuery.lte("date", endDate)
  }

  const { data: sales } = await salesQuery

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

  // Buscar retiradas (todo o histórico para calcular disponível corretamente)
  let withdrawalsQuery = supabase
    .from("withdrawals")
    .select("*")

  if (startDate) {
    withdrawalsQuery = withdrawalsQuery.gte("date", startDate)
  }
  if (endDate) {
    withdrawalsQuery = withdrawalsQuery.lte("date", endDate)
  }

  const { data: withdrawalsData } = await withdrawalsQuery

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
  const channel = (formData.get("channel") as string) || null
  const team = (formData.get("team") as string) || null
  const size = (formData.get("size") as string) || null
  const saleType = (formData.get("sale_type") as string) || null
  const customerId = (formData.get("customer_id") as string) || null

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
    channel,
    team,
    size,
    sale_type: saleType,
    customer_id: customerId,
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

// Ajuste simples de quantidade (sem afetar cashflow ou custo médio)
export async function adjustInventoryQuantity(
  productType: ProductType,
  delta: number // +1 ou -1
) {
  const supabase = await createClient()

  const { data: current } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("product_type", productType)
    .single()

  const currentQty = current?.quantity || 0
  const newQty = Math.max(0, currentQty + delta)

  await supabase
    .from("inventory")
    .update({ quantity: newQty })
    .eq("product_type", productType)

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

export async function getAdvancedStats(): Promise<AdvancedStats> {
  const supabase = await createClient()
  
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysElapsed = today.getDate()
  
  // Primeiro dia do mês atual
  const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  
  // Primeiro dia do mês passado
  const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
  const lastDayLastMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
  
  // Buscar vendas do mês atual
  const { data: currentMonthSales } = await supabase
    .from("sales")
    .select("*")
    .gte("date", firstDayCurrentMonth)
    .lte("date", todayStr)
  
  // Buscar vendas do mês passado
  const { data: lastMonthSales } = await supabase
    .from("sales")
    .select("*")
    .gte("date", firstDayLastMonth)
    .lte("date", lastDayLastMonth)
  
  const currentMonthData = (currentMonthSales || []) as Sale[]
  const lastMonthData = (lastMonthSales || []) as Sale[]
  
  const currentMonthProfit = currentMonthData.reduce((sum, s) => sum + Number(s.profit), 0)
  const lastMonthProfit = lastMonthData.reduce((sum, s) => sum + Number(s.profit), 0)
  
  // Projeção de lucro mensal baseado no ritmo atual
  const dailyAvgProfit = daysElapsed > 0 ? currentMonthProfit / daysElapsed : 0
  const projectedMonthProfit = dailyAvgProfit * daysInMonth
  const projectionOptimistic = projectedMonthProfit * 1.1
  
  // Crescimento em relação ao mês passado
  const profitGrowthPercentage = lastMonthProfit > 0 
    ? ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 
    : currentMonthProfit > 0 ? 100 : 0
  
  // Semana atual vs semana passada
  const dayOfWeek = today.getDay()
  const startOfCurrentWeek = new Date(today)
  startOfCurrentWeek.setDate(today.getDate() - dayOfWeek)
  
  const startOfLastWeek = new Date(startOfCurrentWeek)
  startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7)
  const endOfLastWeek = new Date(startOfCurrentWeek)
  endOfLastWeek.setDate(startOfCurrentWeek.getDate() - 1)
  
  const { data: currentWeekSales } = await supabase
    .from("sales")
    .select("*")
    .gte("date", startOfCurrentWeek.toISOString().split('T')[0])
    .lte("date", todayStr)
  
  const { data: lastWeekSales } = await supabase
    .from("sales")
    .select("*")
    .gte("date", startOfLastWeek.toISOString().split('T')[0])
    .lte("date", endOfLastWeek.toISOString().split('T')[0])
  
  const currentWeekData = (currentWeekSales || []) as Sale[]
  const lastWeekData = (lastWeekSales || []) as Sale[]
  
  const currentWeekRevenue = currentWeekData.reduce((sum, s) => sum + Number(s.final_price), 0)
  const lastWeekRevenue = lastWeekData.reduce((sum, s) => sum + Number(s.final_price), 0)
  const weeklyGrowthPercentage = lastWeekRevenue > 0 
    ? ((currentWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 
    : currentWeekRevenue > 0 ? 100 : 0
  
  // Heatmap semanal - vendas por dia da semana (últimos 30 dias)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  const { data: last30DaysSales } = await supabase
    .from("sales")
    .select("*")
    .gte("date", thirtyDaysAgo.toISOString().split('T')[0])
  
  const last30Data = (last30DaysSales || []) as Sale[]
  
  const daysOfWeek = [
    { day: 'Domingo', dayShort: 'Dom' },
    { day: 'Segunda', dayShort: 'Seg' },
    { day: 'Terça', dayShort: 'Ter' },
    { day: 'Quarta', dayShort: 'Qua' },
    { day: 'Quinta', dayShort: 'Qui' },
    { day: 'Sexta', dayShort: 'Sex' },
    { day: 'Sábado', dayShort: 'Sab' },
  ]
  
  const weeklyHeatmap = daysOfWeek.map((d, index) => {
    const daySales = last30Data.filter(s => {
      const saleDate = new Date(s.date)
      return saleDate.getDay() === index
    })
    return {
      ...d,
      sales: daySales.length,
      revenue: daySales.reduce((sum, s) => sum + Number(s.final_price), 0),
    }
  })
  
  // Vendas de hoje
  const { data: todaySalesData } = await supabase
    .from("sales")
    .select("*")
    .eq("date", todayStr)
  
  const todayData = (todaySalesData || []) as Sale[]
  const todaySales = todayData.length
  const todayRevenue = todayData.reduce((sum, s) => sum + Number(s.final_price), 0)
  const todayProfit = todayData.reduce((sum, s) => sum + Number(s.profit), 0)
  
  // Meta mensal (fixa em R$ 3000 por enquanto, depois pode ser configurável)
  const monthlyGoal = 3000
  const currentMonthRevenue = currentMonthData.reduce((sum, s) => sum + Number(s.final_price), 0)
  const monthlyProgress = (currentMonthRevenue / monthlyGoal) * 100
  
  // Meta diária baseada na meta mensal
  const dailyGoal = monthlyGoal / daysInMonth
  
  // Gerar insights automáticos
  const insights: AdvancedStats['insights'] = []
  
  // Buscar todas as vendas para produto mais vendido
  const { data: allSales } = await supabase.from("sales").select("*")
  const allSalesData = (allSales || []) as Sale[]
  
  // Produto mais vendido
  const productCounts = { torcedor: 0, jogador: 0, retro: 0 }
  allSalesData.forEach(s => {
    if (s.product_type in productCounts) {
      productCounts[s.product_type as keyof typeof productCounts]++
    }
  })
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]
  if (topProduct && topProduct[1] > 0) {
    const labels: Record<string, string> = { torcedor: 'Torcedor', jogador: 'Jogador', retro: 'Retrô' }
    insights.push({
      type: 'info',
      message: `Produto mais vendido: Camisa ${labels[topProduct[0]]}`,
      icon: 'shirt',
    })
  }
  
  // Comparação com mês passado
  if (profitGrowthPercentage > 0) {
    insights.push({
      type: 'success',
      message: `Você está ${profitGrowthPercentage.toFixed(0)}% acima do mês passado!`,
      icon: 'trending-up',
    })
  } else if (profitGrowthPercentage < 0) {
    insights.push({
      type: 'warning',
      message: `Lucro ${Math.abs(profitGrowthPercentage).toFixed(0)}% abaixo do mês passado`,
      icon: 'trending-down',
    })
  }
  
  // Ticket médio
  const currentTicket = currentMonthData.length > 0 
    ? currentMonthData.reduce((sum, s) => sum + Number(s.final_price), 0) / currentMonthData.length 
    : 0
  const lastTicket = lastMonthData.length > 0 
    ? lastMonthData.reduce((sum, s) => sum + Number(s.final_price), 0) / lastMonthData.length 
    : 0
  
  if (lastTicket > 0 && currentTicket > 0) {
    const ticketChange = ((currentTicket - lastTicket) / lastTicket) * 100
    if (Math.abs(ticketChange) > 5) {
      insights.push({
        type: ticketChange > 0 ? 'success' : 'warning',
        message: `Ticket médio ${ticketChange > 0 ? 'subiu' : 'caiu'} ${Math.abs(ticketChange).toFixed(0)}% este mês`,
        icon: ticketChange > 0 ? 'arrow-up' : 'arrow-down',
      })
    }
  }
  
  // Melhor mês potencial
  if (projectedMonthProfit > lastMonthProfit && lastMonthProfit > 0) {
    insights.push({
      type: 'success',
      message: 'Este pode ser seu melhor mês!',
      icon: 'star',
    })
  }
  
  return {
    currentMonthProfit,
    projectedMonthProfit,
    daysElapsed,
    daysInMonth,
    projectionOptimistic,
    lastMonthProfit,
    profitGrowthPercentage,
    currentWeekRevenue,
    lastWeekRevenue,
    weeklyGrowthPercentage,
    weeklyHeatmap,
    insights: insights.slice(0, 3),
    monthlyGoal,
    monthlyProgress,
    todaySales,
    todayRevenue,
    todayProfit,
    dailyGoal,
  }
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true })
  if (error) throw new Error(`Erro ao buscar clientes: ${error.message}`)
  return (data || []) as Customer[]
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const whatsapp = (formData.get("whatsapp") as string) || null
  const team_1 = (formData.get("team_1") as string) || null
  const notes = (formData.get("notes") as string) || null
  const { error } = await supabase.from("customers").insert({ name, whatsapp, team_1, notes })
  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`)
  revalidatePath("/clientes")
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get("name") as string
  const whatsapp = (formData.get("whatsapp") as string) || null
  const team_1 = (formData.get("team_1") as string) || null
  const notes = (formData.get("notes") as string) || null
  const { error } = await supabase
    .from("customers")
    .update({ name, whatsapp, team_1, notes })
    .eq("id", id)
  if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`)
  revalidatePath("/clientes")
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("customers").delete().eq("id", id)
  if (error) throw new Error(`Erro ao excluir cliente: ${error.message}`)
  revalidatePath("/clientes")
}

export async function getPurchaseOrders(): Promise<PurchaseOrderWithCost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("v_purchase_cost")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(`Erro ao buscar lotes: ${error.message}`)
  return (data || []) as PurchaseOrderWithCost[]
}

export async function createPurchaseOrder(formData: FormData) {
  const supabase = await createClient()
  const quantity = Number(formData.get("quantity"))
  const purchase_amount_usd = Number(formData.get("purchase_amount_usd"))
  const exchange_rate = Number(formData.get("exchange_rate"))
  const arrival_date = (formData.get("arrival_date") as string) || null
  const purchase_amount_brl_raw = formData.get("purchase_amount_brl") as string
  const purchase_amount_brl = purchase_amount_brl_raw
    ? Number(purchase_amount_brl_raw)
    : purchase_amount_usd * exchange_rate
  const supplier = (formData.get("supplier") as string) || null
  const notes = (formData.get("notes") as string) || null
  const { error } = await supabase.from("purchase_orders").insert({
    quantity,
    purchase_amount_usd,
    exchange_rate,
    arrival_date,
    purchase_amount_brl,
    supplier,
    notes,
  })
  if (error) throw new Error(`Erro ao criar lote: ${error.message}`)
  revalidatePath("/lotes")
}

export async function linkTaxToPurchaseOrder(cashflowId: string, purchaseOrderId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("cashflow")
    .update({ purchase_order_id: purchaseOrderId })
    .eq("id", cashflowId)
  if (error) throw new Error(`Erro ao vincular taxa: ${error.message}`)
  revalidatePath("/lotes")
  revalidatePath("/caixa")
}

export async function getDRE() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("v_dre_mensal")
    .select("*")
    .order("mes", { ascending: false })
  if (error) throw new Error(`Erro ao buscar DRE: ${error.message}`)
  return data || []
}

export async function getEstoqueAlerta() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("v_estoque_alerta")
    .select("*")
  if (error) throw new Error(`Erro ao buscar estoque: ${error.message}`)
  return data || []
}

export async function getCustomersWithStats() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("v_customer_stats")
    .select("*")
    .order("name", { ascending: true })
  if (error) throw new Error(`Erro ao buscar clientes: ${error.message}`)
  return data || []
}

export async function getUnlinkedTaxes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cashflow')
    .select('id, date, description, amount')
    .eq('category', 'imposto_importacao')
    .is('purchase_order_id', null)
    .order('date', { ascending: false })
  if (error) throw new Error(`Erro: ${error.message}`)
  return data || []
}

export async function linkTaxToLote(cashflowId: string, purchaseOrderId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cashflow')
    .update({ purchase_order_id: purchaseOrderId })
    .eq('id', cashflowId)
  if (error) throw new Error(`Erro: ${error.message}`)
  revalidatePath('/lotes')
  revalidatePath('/caixa')
}
