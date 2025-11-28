-- Tasks tablosunun id alanını UUID'den BIGINT'e dönüştürme
-- Bu migration, UUID'yi direkt bigint'e çeviremediği için adım adım yapılır

-- ÖNEMLİ: Bu migration'ı çalıştırmadan önce:
-- 1. Veritabanınızın yedeğini alın
-- 2. Eğer başka tablolarda tasks.id'ye foreign key varsa, önce onları kontrol edin
-- 3. Migration'ı test ortamında deneyin

BEGIN;

-- 1. Önce yeni bir bigint kolon oluştur (geçici, NULL olabilir)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS id_new BIGINT;

-- 2. Eğer tasks tablosunda veri varsa, yeni kolona sıralı ID'ler ata
-- (UUID'ler sıralı olmadığı için yeni sıralı ID'ler oluşturulur)
DO $$
DECLARE
    rec RECORD;
    new_id BIGINT := 1;
BEGIN
    -- Mevcut verileri sırayla yeni ID'lere atar
    -- created_at varsa ona göre, yoksa id'ye göre sıralar
    FOR rec IN 
        SELECT id 
        FROM public.tasks 
        ORDER BY 
            COALESCE(created_at, '1970-01-01'::timestamp) ASC, 
            id::text ASC
    LOOP
        UPDATE public.tasks SET id_new = new_id WHERE id = rec.id;
        new_id := new_id + 1;
    END LOOP;
END $$;

-- 3. Foreign key constraint'leri geçici olarak kaldır (eğer varsa)
-- Bu kısmı ihtiyacınıza göre düzenleyin
-- Örnek: ALTER TABLE public.task_comments DROP CONSTRAINT IF EXISTS task_comments_task_id_fkey;

-- 4. Eski id kolonunu sil (önce primary key constraint'i kaldır)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey CASCADE;
ALTER TABLE public.tasks DROP COLUMN IF EXISTS id;

-- 5. Yeni kolonu id olarak yeniden adlandır
ALTER TABLE public.tasks RENAME COLUMN id_new TO id;

-- 6. id kolonunu NOT NULL yap
ALTER TABLE public.tasks ALTER COLUMN id SET NOT NULL;

-- 7. Primary key constraint'i ekle
ALTER TABLE public.tasks ADD PRIMARY KEY (id);

-- 8. Sequence oluştur ve bağla
CREATE SEQUENCE IF NOT EXISTS tasks_id_seq OWNED BY public.tasks.id;

-- 9. Sequence'i mevcut max ID'den sonra başlat
DO $$
DECLARE
    max_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM public.tasks;
    IF max_id > 0 THEN
        -- Sequence'i mevcut max ID'den sonra başlat
        PERFORM setval('tasks_id_seq', max_id, true);
    ELSE
        -- Eğer veri yoksa 1'den başlat
        PERFORM setval('tasks_id_seq', 1, false);
    END IF;
END $$;

-- 10. id kolonunu sequence'e bağla (default değer olarak)
ALTER TABLE public.tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq');

-- 11. Foreign key constraint'leri geri ekle (eğer varsa)
-- Bu kısmı ihtiyacınıza göre düzenleyin
-- Örnek:
-- ALTER TABLE public.task_comments 
--   ADD CONSTRAINT task_comments_task_id_fkey 
--   FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

COMMIT;

-- Not: Eğer başka tablolarda tasks.id'ye referans varsa (task_id kolonu),
-- önce o tablolarda task_id kolonunu da bigint'e çevirmeniz gerekebilir.
-- Örnek migration:
-- ALTER TABLE public.task_comments 
--   ADD COLUMN task_id_new BIGINT;
-- UPDATE public.task_comments tc
--   SET task_id_new = t.id_new
--   FROM public.tasks t
--   WHERE tc.task_id = t.id::text;
-- ALTER TABLE public.task_comments DROP COLUMN task_id;
-- ALTER TABLE public.task_comments RENAME COLUMN task_id_new TO task_id;

