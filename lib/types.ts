export type ProductType = 'torcedor' | 'jogador' | 'retro'

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
