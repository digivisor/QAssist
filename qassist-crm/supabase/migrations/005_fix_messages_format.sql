-- Mesaj formatını düzelt: String mesajları object'e çevir
-- Bu script, yanlış formatta kaydedilmiş string mesajları temizler

CREATE OR REPLACE FUNCTION fix_conversation_messages_format()
RETURNS void AS $$
DECLARE
  conv_record RECORD;
  fixed_messages JSONB;
  msg JSONB;
BEGIN
  -- Tüm konuşmaları dolaş
  FOR conv_record IN SELECT id, messages FROM conversations WHERE messages IS NOT NULL
  LOOP
    fixed_messages := '[]'::jsonb;
    
    -- Her mesajı kontrol et
    FOR msg IN SELECT * FROM jsonb_array_elements(conv_record.messages)
    LOOP
      -- Eğer mesaj string ise, object'e çevir
      IF jsonb_typeof(msg) = 'string' THEN
        -- String mesajı object'e çevir
        fixed_messages := fixed_messages || jsonb_build_object(
          'id', EXTRACT(EPOCH FROM NOW())::bigint * 1000 + (random() * 1000)::int,
          'message', msg::text,
          'sender', 'customer',
          'direction', 'incoming',
          'status', 'sent',
          'timestamp', TO_CHAR(NOW(), 'HH24:MI'),
          'createdAt', NOW()
        );
      ELSIF jsonb_typeof(msg) = 'object' THEN
        -- Object mesajı olduğu gibi ekle
        fixed_messages := fixed_messages || msg;
      END IF;
    END LOOP;
    
    -- Düzeltilmiş mesajları kaydet
    UPDATE conversations
    SET messages = fixed_messages
    WHERE id = conv_record.id;
    
    RAISE NOTICE 'Conversation % fixed: % messages', conv_record.id, jsonb_array_length(fixed_messages);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Script'i çalıştır
SELECT fix_conversation_messages_format();

-- Fonksiyonu temizle
DROP FUNCTION fix_conversation_messages_format();

