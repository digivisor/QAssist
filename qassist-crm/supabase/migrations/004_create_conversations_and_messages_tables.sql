-- Konuşmalar tablosu (müşteri ile AI agent arasındaki konuşmalar)
-- Mesajlar JSONB array olarak bu tabloda tutulacak (performans için)
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  messages JSONB DEFAULT '[]'::jsonb, -- Tüm mesajlar burada JSON array olarak tutulur
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_phone ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_time ON conversations(last_message_time);
-- JSONB index'leri (mesaj aramaları için)
CREATE INDEX IF NOT EXISTS idx_conversations_messages ON conversations USING GIN (messages);

-- Updated_at trigger'ı conversations için
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Yeni mesaj ekleyen fonksiyon (JSONB array'e ekler)
CREATE OR REPLACE FUNCTION add_message_to_conversation(
  conv_id BIGINT,
  msg_text TEXT,
  msg_sender TEXT,
  msg_direction TEXT,
  msg_status TEXT DEFAULT 'sent'
)
RETURNS void AS $$
DECLARE
  new_message JSONB;
  msg_time TIMESTAMP WITH TIME ZONE;
BEGIN
  msg_time := NOW();
  
  -- Yeni mesaj objesi oluştur (unique ID için timestamp + random kullan)
  new_message := jsonb_build_object(
    'id', EXTRACT(EPOCH FROM msg_time)::bigint * 1000 + (random() * 1000)::int,
    'message', msg_text,
    'sender', msg_sender,
    'direction', msg_direction,
    'status', msg_status,
    'timestamp', TO_CHAR(msg_time, 'HH24:MI'),
    'createdAt', msg_time
  );
  
  -- Mesajı JSONB array'e ekle (sona ekle)
  UPDATE conversations
  SET 
    messages = COALESCE(messages, '[]'::jsonb) || new_message,
    last_message = msg_text,
    last_message_time = msg_time,
    updated_at = msg_time
  WHERE id = conv_id;
  
  -- Eğer mesaj müşteriden geliyorsa unread_count'u artır
  IF msg_sender = 'customer' THEN
    UPDATE conversations
    SET unread_count = COALESCE(unread_count, 0) + 1
    WHERE id = conv_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Unread count'u sıfırlayan fonksiyon (mesajlar okunduğunda)
CREATE OR REPLACE FUNCTION reset_conversation_unread_count(conv_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE conversations
  SET unread_count = 0
  WHERE id = conv_id;
END;
$$ language 'plpgsql';

-- Mesaj sayısını sınırlayan fonksiyon (performans için son 1000 mesajı tut)
-- NOT: Bu fonksiyon tablo oluşturulduktan SONRA çalıştırılmalı
CREATE OR REPLACE FUNCTION limit_conversation_messages(conv_id BIGINT, max_messages INTEGER DEFAULT 1000)
RETURNS void AS $$
DECLARE
  current_messages JSONB;
  limited_messages JSONB;
  msg_count INTEGER;
BEGIN
  -- Mevcut mesajları al (tablo adını tam olarak belirt)
  SELECT c.messages INTO current_messages
  FROM conversations c
  WHERE c.id = conv_id;
  
  -- Mesaj sayısını kontrol et
  IF current_messages IS NULL THEN
    current_messages := '[]'::jsonb;
    RETURN;
  END IF;
  
  -- Array uzunluğunu al
  msg_count := jsonb_array_length(current_messages);
  
  -- Eğer mesaj sayısı limit'ten fazlaysa, son max_messages kadarını tut
  IF msg_count > max_messages THEN
    -- Son max_messages mesajı al ve sırala
    WITH sorted_messages AS (
      SELECT msg
      FROM jsonb_array_elements(current_messages) AS msg
      ORDER BY (msg->>'createdAt')::timestamp DESC
      LIMIT max_messages
    )
    SELECT jsonb_agg(msg ORDER BY (msg->>'createdAt')::timestamp)
    INTO limited_messages
    FROM sorted_messages;
    
    -- Güncelle
    UPDATE conversations
    SET messages = limited_messages
    WHERE id = conv_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
