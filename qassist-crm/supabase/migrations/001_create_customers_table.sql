-- Ana müşteriler tablosu (tüm bilgiler burada)
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  room_number TEXT,
  room_type TEXT,
  check_in DATE,
  check_out DATE,
  nights INTEGER,
  total_guests INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_reservations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aynı odada kalan diğer misafirler (ilişkili)
CREATE TABLE IF NOT EXISTS room_guests (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relationship TEXT, -- 'spouse', 'child', 'friend', 'colleague', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müşteri sorunları/şikayetleri
CREATE TABLE IF NOT EXISTS customer_issues (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müşteri talepleri
CREATE TABLE IF NOT EXISTS customer_requests (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'in-progress')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analizi
CREATE TABLE IF NOT EXISTS customer_ai_analysis (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
  behavior TEXT NOT NULL,
  preferences TEXT[] DEFAULT '{}',
  suggestions TEXT[] DEFAULT '{}',
  satisfaction TEXT NOT NULL CHECK (satisfaction IN ('high', 'medium', 'low')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Etkinlik rezervasyonları
CREATE TABLE IF NOT EXISTS event_reservations (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  number_of_guests INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restoran rezervasyonları
CREATE TABLE IF NOT EXISTS restaurant_reservations (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  number_of_guests INTEGER DEFAULT 1,
  table_number TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_check_out ON customers(check_out);
CREATE INDEX IF NOT EXISTS idx_customers_room_number ON customers(room_number);
CREATE INDEX IF NOT EXISTS idx_room_guests_customer_id ON room_guests(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_issues_customer_id ON customer_issues(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_requests_customer_id ON customer_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_event_reservations_customer_id ON event_reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_event_reservations_event_date ON event_reservations(event_date);
CREATE INDEX IF NOT EXISTS idx_restaurant_reservations_customer_id ON restaurant_reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reservations_reservation_date ON restaurant_reservations(reservation_date);

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'lar
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_ai_analysis_updated_at BEFORE UPDATE ON customer_ai_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_reservations_updated_at BEFORE UPDATE ON event_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_reservations_updated_at BEFORE UPDATE ON restaurant_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Check-out tarihine göre status'u otomatik güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_customer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check-out tarihi geçmişse veya null ise inactive yap
  IF NEW.check_out IS NOT NULL AND NEW.check_out < CURRENT_DATE THEN
    NEW.status = 'inactive';
  ELSIF NEW.check_out IS NOT NULL AND NEW.check_out >= CURRENT_DATE THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Status güncelleme trigger'ı
CREATE TRIGGER update_customer_status_trigger
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_status();
