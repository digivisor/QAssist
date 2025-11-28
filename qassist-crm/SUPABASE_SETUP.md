# Supabase Kurulum Rehberi

Bu proje müşteri yönetimi için Supabase kullanmaktadır. Aşağıdaki adımları takip ederek Supabase'i yapılandırın.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin ve bir hesap oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından **Project URL** ve **anon/public key** değerlerini kopyalayın

## 2. Environment Variables Ayarlama

1. Proje kök dizininde `.env.local` dosyası oluşturun (`.env.local.example` dosyasını referans alabilirsiniz)
2. Aşağıdaki değerleri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Veritabanı Tablolarını Oluşturma

1. Supabase Dashboard'a gidin
2. **SQL Editor** sekmesine tıklayın
3. `supabase/migrations/001_create_customers_table.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın ve **Run** butonuna tıklayın

Bu migration şu tabloları oluşturur:
- `customers` - Müşteri bilgileri
- `active_stays` - Aktif konaklamalar
- `customer_requests` - Müşteri talepleri
- `customer_complaints` - Müşteri şikayetleri
- `customer_ai_analysis` - AI analiz verileri

## 4. Row Level Security (RLS) Ayarları

Güvenlik için RLS politikalarını ayarlayın. SQL Editor'de şu komutları çalıştırın:

```sql
-- Tüm tablolarda RLS'yi etkinleştir
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ai_analysis ENABLE ROW LEVEL SECURITY;

-- Herkese okuma ve yazma izni ver (geliştirme için)
-- Production'da daha kısıtlayıcı politikalar kullanın
CREATE POLICY "Enable all operations for all users" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON active_stays
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON customer_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON customer_complaints
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON customer_ai_analysis
  FOR ALL USING (true) WITH CHECK (true);
```

## 5. Uygulamayı Çalıştırma

```bash
npm run dev
```

Artık müşteriler Supabase veritabanından yüklenecek ve yeni müşteriler Supabase'e kaydedilecektir.

## Notlar

- Production ortamında RLS politikalarını daha güvenli hale getirin
- API anahtarlarını asla public repository'lere commit etmeyin
- `.env.local` dosyası `.gitignore` içinde olmalıdır


