-- Günlük bilgiler tablosu (Bugün otelde ne var)
CREATE TABLE IF NOT EXISTS daily_info (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE, -- Tarih (her gün için tek kayıt)
  events JSONB DEFAULT '[]'::jsonb, -- Etkinlikler array'i
  restaurants JSONB DEFAULT '[]'::jsonb, -- Restoranlar ve açılış saatleri
  menus JSONB DEFAULT '{}'::jsonb, -- Menüler (kahvaltı, öğle, akşam, vb.)
  notes TEXT, -- Ek notlar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_daily_info_date ON daily_info(date);
CREATE INDEX IF NOT EXISTS idx_daily_info_created_at ON daily_info(created_at);

-- Updated_at trigger'ı daily_info için
CREATE TRIGGER update_daily_info_updated_at BEFORE UPDATE ON daily_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



