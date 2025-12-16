-- BU DOSYA MIGRATION HATASINI DÜZELTMEK İÇİN GÜNCELLENMİŞTİR
-- Tasks tablosunda Primary Key eksikliği giderildi ve diğer tablolar oluşturuldu.

BEGIN;

-- 0. TASKS Tablosu Düzeltmesi (Primary Key Ekleme)
DO $$
BEGIN
    -- Eğer tasks tablosunun id sütununda PK yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_pkey') THEN
        -- Eğer id sütunu unique değilse önce unique yapmayı dene, sonra PK
        -- Ancak doğrudan PK eklemek genellikle yeterlidir eğer duplicate yoksa
        ALTER TABLE tasks ADD PRIMARY KEY (id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Tasks tablosuna PK eklenirken hata oluştu veya zaten var: %', SQLERRM;
END $$;


-- 1. Employees Tablosu Güncellemeleri
-- Rol, Profil, Puanlama ve Token alanları

-- Önce role tipini oluştur (eğer yoksa)
DO $$ BEGIN
    CREATE TYPE employee_role AS ENUM ('admin', 'manager', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Employees tablosunu güncelle
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS role employee_role DEFAULT 'staff',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS completed_tasks_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;


-- 2. Tasks Tablosu Sütun Güncellemeleri
-- Personel atama ve kanıt alanları

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_to_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS completed_by_employee_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS proof_photos TEXT[],
ADD COLUMN IF NOT EXISTS issue_description TEXT;


-- 3. Personel İçi Mesajlaşma Tablosu (Staff Messages)
CREATE TABLE IF NOT EXISTS staff_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  receiver_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
  department_id BIGINT REFERENCES hotel_departments(id) ON DELETE SET NULL,
  task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL, -- Artık tasks(id) PK olduğu için hata vermemeli
  
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  media_url TEXT,
  
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mesajlar için performans indexleri
CREATE INDEX IF NOT EXISTS idx_staff_messages_sender ON staff_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_receiver ON staff_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_department ON staff_messages(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_task ON staff_messages(task_id);

COMMIT;
