export type ProductType = 'torcedor' | 'jogador' | 'retro'
export type SaleChannel = 'bar' | 'direto' | 'whatsapp' | 'indicacao' | 'instagram'
export type SaleType = 'normal' | 'liquidacao' | 'desconto'
export type SaleSize = 'P' | 'M' | 'G' | 'GG' | 'XG' | '2XL' | '3XL' | '4XL'

export interface Customer {
  id: string
  created_at: string
  name: string
  whatsapp?: string | null
  team_1?: string | null
  notes?: string | null
}

export interface PurchaseOrder {
  id: string
  created_at: string
  quantity: number
  purchase_amount_usd: number
  exchange_rate: number
  arrival_date?: string | null
  purchase_amount_brl?: number | null
  supplier?: string | null
  notes?: string | null
  tracking_code?: string | null
  items_description?: string | null
  product_type?: ProductType | null
}

export interface PurchaseOrderWithCost extends PurchaseOrder {
  unit_cost_brl?: number | null
  min_price_40pct?: number | null
  min_price_45pct?: number | null
  product_type?: ProductType | null
}

export interface Sale {
  id: string
  created_at: string
  date: string
  customer_name: string | null
  product_type: ProductType
  personalized: boolean
  base_price: number
  extra_personalization: number
  final_price: number
  base_cost: number
  personalization_cost: number
  total_cost: number
  profit: number
  jogador_price_variant: number | null
  channel?: SaleChannel | null
  team?: string | null
  size?: SaleSize | null
  sale_type?: SaleType | null
  customer_id?: string | null
}

export interface Inventory {
  id: string
  created_at: string
  product_type: ProductType
  quantity: number
  avg_cost: number
  avg_price: number
}

export interface Cashflow {
  id: string
  created_at: string
  date: string
  type: 'entrada' | 'saida'
  category: string
  description: string | null
  amount: number
  purchase_order_id?: string | null
}

export interface Withdrawal {
  id: string
  created_at: string
  date: string
  partner_name: 'Rafael' | 'Joao'
  amount: number
}

export interface DashboardStats {
  totalSales: number
  totalRevenue: number
  totalProfit: number
  totalCost: number
  profitMargin: number
  avgTicket: number
  salesByProduct: { type: ProductType; count: number; revenue: number }[]
  recentSales: Sale[]
  cashBalance: number
  withdrawalsByPartner: { partner: string; total: number }[]
}

export interface AdvancedStats {
  // Previsão de lucro mensal
  currentMonthProfit: number
  projectedMonthProfit: number
  daysElapsed: number
  daysInMonth: number
  projectionOptimistic: number // +10%
  lastMonthProfit: number
  profitGrowthPercentage: number
  
  // Comparativo semanal
  currentWeekRevenue: number
  lastWeekRevenue: number
  weeklyGrowthPercentage: number
  
  // Heatmap semanal (vendas por dia da semana)
  weeklyHeatmap: { day: string; dayShort: string; sales: number; revenue: number }[]
  
  // Insights
  insights: { type: 'success' | 'warning' | 'info'; message: string; icon: string }[]
  
  // Meta mensal
  monthlyGoal: number
  monthlyProgress: number
  
  // Foco do dia
  todaySales: number
  todayRevenue: number
  todayProfit: number
  dailyGoal: number
}

// Preços configuráveis
export const PRODUCT_CONFIG = {
  torcedor: {
    label: 'Torcedor',
    baseCost: 83,
    basePrice: 160,
    personalizationCost: 0,
  },
  jogador: {
    label: 'Jogador',
    baseCost: 113,
    basePrice: 200,
    personalizationCost: 0,
  },
  retro: {
    label: 'Retrô',
    baseCost: 113,
    basePrice: 180,
    personalizationCost: 0,
  },
} as const

export const PERSONALIZATION_COST = 20
export const PERSONALIZATION_PRICE = 30

export const CHANNEL_LABELS: Record<SaleChannel, string> = {
  bar: 'Bar',
  direto: 'Direto',
  whatsapp: 'WhatsApp',
  indicacao: 'Indicação',
  instagram: 'Instagram',
}

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  normal: 'Normal',
  liquidacao: 'Liquidação',
  desconto: 'Desconto',
}

export const SIZE_OPTIONS: SaleSize[] = ['P', 'M', 'G', 'GG', 'XG', '2XL', '3XL', '4XL']

export interface Setting {
  key: string
  value: string
  label: string | null
  description: string | null
}
