-- Bate Pronto - Sistema de Gestão Financeira

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT,
  product_type TEXT NOT NULL,
  personalized BOOLEAN DEFAULT FALSE,
  base_price DECIMAL(10,2) NOT NULL,
  extra_personalization DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  base_cost DECIMAL(10,2) NOT NULL,
  personalization_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  jogador_price_variant DECIMAL(10,2) DEFAULT NULL
);

-- Tabela de estoque
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  product_type TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  avg_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  avg_price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Tabela de fluxo de caixa
CREATE TABLE IF NOT EXISTS cashflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL
);

-- Tabela de retiradas dos sócios
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  partner_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL
);
