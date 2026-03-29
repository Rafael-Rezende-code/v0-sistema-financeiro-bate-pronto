-- Bate Pronto - Sistema de Gestão Financeira
-- Tabelas principais do sistema

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('torcedor', 'jogador', 'retro')),
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
  product_type TEXT NOT NULL UNIQUE CHECK (product_type IN ('torcedor', 'jogador', 'retro')),
  quantity INTEGER NOT NULL DEFAULT 0,
  avg_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  avg_price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Tabela de fluxo de caixa
CREATE TABLE IF NOT EXISTS cashflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida', 'retirada')),
  category TEXT NOT NULL CHECK (category IN ('venda', 'compra_estoque', 'taxa', 'retirada_socio', 'outro')),
  description TEXT,
  amount DECIMAL(10,2) NOT NULL
);

-- Tabela de retiradas dos sócios
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  partner_name TEXT NOT NULL CHECK (partner_name IN ('Rafael', 'João')),
  amount DECIMAL(10,2) NOT NULL
);

-- Inserir dados iniciais de estoque
INSERT INTO inventory (product_type, quantity, avg_cost, avg_price) 
VALUES 
  ('torcedor', 0, 83, 160),
  ('jogador', 0, 113, 200),
  ('retro', 0, 113, 180)
ON CONFLICT (product_type) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_product_type ON sales(product_type);
CREATE INDEX IF NOT EXISTS idx_cashflow_date ON cashflow(date);
CREATE INDEX IF NOT EXISTS idx_cashflow_type ON cashflow(type);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON withdrawals(date);
CREATE INDEX IF NOT EXISTS idx_withdrawals_partner ON withdrawals(partner_name);
