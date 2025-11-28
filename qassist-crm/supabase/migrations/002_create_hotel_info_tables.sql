-- Otel bilgileri tablosu (tek kayıt)
CREATE TABLE IF NOT EXISTS hotel_info (
  id BIGSERIAL PRIMARY KEY,
  -- Temel Bilgiler
  name TEXT NOT NULL,
  category TEXT,
  type TEXT,
  description TEXT,
  year_established INTEGER,
  total_floors INTEGER,
  total_employees INTEGER,
  
  -- İletişim Bilgileri
  address TEXT,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Oda Bilgileri
  total_rooms INTEGER,
  single_rooms INTEGER,
  double_rooms INTEGER,
  suite_rooms INTEGER,
  deluxe_rooms INTEGER,
  check_in_time TIME,
  check_out_time TIME,
  
  -- Özellikler (JSONB olarak saklanacak)
  features JSONB DEFAULT '{}',
  accepted_payments JSONB DEFAULT '{}',
  
  -- Diğer
  languages TEXT[] DEFAULT '{}',
  currency TEXT DEFAULT 'TRY',
  timezone TEXT DEFAULT 'Europe/Istanbul',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departmanlar tablosu
CREATE TABLE IF NOT EXISTS hotel_departments (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  manager TEXT,
  employee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restoranlar tablosu
CREATE TABLE IF NOT EXISTS hotel_restaurants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('a-la-carte', 'breakfast', 'dinner', 'buffet')),
  breakfast_hours_start TIME,
  breakfast_hours_end TIME,
  dinner_hours_start TIME,
  dinner_hours_end TIME,
  menu TEXT,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Etkinlikler tablosu
CREATE TABLE IF NOT EXISTS hotel_events (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('animation', 'aquapark', 'sports', 'entertainment', 'kids', 'other')),
  description TEXT,
  schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_hotel_info_id ON hotel_info(id);
CREATE INDEX IF NOT EXISTS idx_hotel_departments_name ON hotel_departments(name);
CREATE INDEX IF NOT EXISTS idx_hotel_restaurants_name ON hotel_restaurants(name);
CREATE INDEX IF NOT EXISTS idx_hotel_restaurants_type ON hotel_restaurants(type);
CREATE INDEX IF NOT EXISTS idx_hotel_events_name ON hotel_events(name);
CREATE INDEX IF NOT EXISTS idx_hotel_events_type ON hotel_events(type);

-- Updated_at trigger fonksiyonu (zaten varsa hata vermez)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'lar
CREATE TRIGGER update_hotel_info_updated_at BEFORE UPDATE ON hotel_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_departments_updated_at BEFORE UPDATE ON hotel_departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_restaurants_updated_at BEFORE UPDATE ON hotel_restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_events_updated_at BEFORE UPDATE ON hotel_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- İlk otel bilgisi kaydını oluştur (eğer yoksa)
-- Not: id=1 ile başlatmak için sequence'i ayarla
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM hotel_info WHERE id = 1) THEN
    INSERT INTO hotel_info (id, name) VALUES (1, 'Grand Hotel Istanbul');
    -- Sequence'i 1'den sonra başlat
    PERFORM setval('hotel_info_id_seq', 1, false);
  END IF;
END $$;

