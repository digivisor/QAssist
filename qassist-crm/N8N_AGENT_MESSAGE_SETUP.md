# n8n Mesaj Kaydetme Rehberi

## İçindekiler
1. [WhatsApp Müşteri Mesajı Kaydetme](#whatsapp-müşteri-mesajı-kaydetme) ⭐
2. [Agent Cevabını Kaydetme](#agent-cevabını-kaydetme)

---

## WhatsApp Müşteri Mesajı Kaydetme

WhatsApp'tan gelen müşteri mesajlarını kaydetmek için detaylı rehber: **[N8N_WHATSAPP_MESSAGE_SETUP.md](./N8N_WHATSAPP_MESSAGE_SETUP.md)**

### Hızlı Özet:

**n8n Akış:**
```
[WhatsApp Webhook] 
    ↓
[Conversation Oluştur/Bul] → POST /api/conversations
    ↓
[Müşteri Mesajını Kaydet] → POST /api/messages
    Body: {
      "conversationId": {{ conversation_id }},
      "message": {{ whatsapp_message }},
      "sender": "customer",
      "direction": "incoming"
    }
```

---

## Agent Cevabını Kaydetme

Agent cevap verdikten sonra, n8n'de agent cevabını veritabanına kaydetmek için aşağıdaki adımları izleyin:

### Yöntem 1: API Endpoint Kullan (Önerilen) ⭐

#### n8n Akış Yapısı:
```
[Agent Cevap Verdi] 
    ↓
[HTTP Request Node] → API'ye POST isteği gönder
    ↓
[Response Kontrol]
```

#### HTTP Request Node Ayarları:

**Method:** `POST`

**URL:** 
```
https://your-domain.com/api/messages
```
veya local için:
```
http://localhost:3000/api/messages
```

**⚠️ URL Seçenekleri:**

**Seçenek 1: Next.js API (Önerilen)**
- URL: `https://your-nextjs-app.com/api/messages` veya `http://localhost:3000/api/messages`
- Avantaj: Tüm validasyonlar ve otomatik işlemler

**Seçenek 2: Supabase REST API (Direkt)**
- URL: `https://glulgpduhcalodgkujpy.supabase.co/rest/v1/rpc/add_message_to_conversation`
- Avantaj: Next.js'e gerek yok, direkt veritabanı
- Detaylar için "Yöntem 2" bölümüne bakın

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**⚠️ SSL/Agent Options:** 
- **"Agent Options"** bölümünü **BOŞ BIRAKIN** veya kullanmayın
- `ca`, `cert`, `key` gibi SSL ayarlarına gerek yok
- Eğer görüyorsanız, **"Use Agent Options"** seçeneğini **KAPATIN**

**Body (JSON):**

n8n'de HTTP Request node'unda **"Specify Body"** seçeneğini **"JSON"** olarak ayarlayın.

**Body Content (Expression Mode):**
```json
{
  "conversationId": {{ $json.conversation_id }},
  "message": {{ $json.agent_response }},
  "sender": "ai",
  "direction": "outgoing",
  "status": "sent"
}
```

**ÖNEMLİ:** n8n'de expression kullanırken:
- String değerler için: `{{ $json.field }}` (otomatik tırnak ekler)
- Sabit string'ler için: `"ai"` (tırnak içinde)
- Sayılar için: `{{ $json.id }}` (tırnak yok)

#### Alternatif: Key-Value Pairs Kullan

Eğer expression sorun çıkarıyorsa, **"Specify Body"** yerine **"Key-Value Pairs"** kullanabilirsiniz:

| Key | Value |
|-----|-------|
| conversationId | `{{ $json.conversation_id }}` |
| message | `{{ $json.agent_response }}` |
| sender | `ai` |
| direction | `outgoing` |
| status | `sent` |

#### Expression Editor ile (Önerilen):

n8n'de **"Specify Body"** → **"JSON"** seçin, sonra **Expression Editor** açın ve şunu yazın:

```javascript
{
  "conversationId": {{ $json.conversation_id }},
  "message": {{ $json.agent_response }},
  "sender": "ai",
  "direction": "outgoing",
  "status": "sent"
}
```

**VEYA** eğer değerler başka node'lardan geliyorsa:

```javascript
{
  "conversationId": {{ $('Supabase').item.json.id }},
  "message": {{ $('AI Agent').item.json.response }},
  "sender": "ai",
  "direction": "outgoing",
  "status": "sent"
}
```

### Yöntem 2: Supabase REST API ile RPC Fonksiyonu (Direkt Veritabanı) ⭐

Eğer Next.js API'si yerine direkt Supabase'e istek atmak istiyorsanız:

#### HTTP Request Node ile Supabase RPC:

**Method:** `POST`

**URL:** 
```
https://glulgpduhcalodgkujpy.supabase.co/rest/v1/rpc/add_message_to_conversation
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWxncGR1aGNhbG9kZ2t1anB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDY5MzYsImV4cCI6MjA3ODUyMjkzNn0.wO1BY4owuxe34xZK0FE55TX1CEqTJOfmk2jhi2u-R1E",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWxncGR1aGNhbG9kZ2t1anB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDY5MzYsImV4cCI6MjA3ODUyMjkzNn0.wO1BY4owuxe34xZK0FE55TX1CEqTJOfmk2jhi2u-R1E"
}
```

**Body (JSON):**
```json
{
  "conv_id": {{ $json.conversation_id }},
  "msg_text": {{ $json.agent_response }},
  "msg_sender": "ai",
  "msg_direction": "outgoing",
  "msg_status": "sent"
}
```

#### Supabase Node ile (Daha Kolay):

**Operation:** `Execute Function`

**Function Name:** `add_message_to_conversation`

**Parameters:**
```json
{
  "conv_id": {{ $json.conversation_id }},
  "msg_text": {{ $json.agent_response }},
  "msg_sender": "ai",
  "msg_direction": "outgoing",
  "msg_status": "sent"
}
```

**⚠️ ÖNEMLİ:** Supabase Node kullanırsanız SSL hatası olmaz ve daha kolay!

### Tam n8n Akış Örneği:

```
1. [Webhook] - Müşteri mesajı geldi
   ↓
2. [Supabase] - Conversation oluştur/bul (customer_id ile)
   ↓
3. [Supabase] - Müşteri mesajını kaydet (customer olarak)
   ↓
4. [AI Agent] - Cevap üret
   ↓
5. [HTTP Request] - Agent cevabını kaydet ⭐
   Method: POST
   URL: /api/messages
   Body: {
     "conversationId": {{ $('Supabase').item.json.id }},
     "message": {{ $('AI Agent').item.json.response }},
     "sender": "ai",
     "direction": "outgoing",
     "status": "sent"
   }
   ↓
6. [Response] - Başarı kontrolü
```

### API Response Formatı:

**Başarılı:**
```json
{
  "success": true,
  "data": {
    "id": 1234567890123,
    "message": "Agent cevabı",
    "sender": "ai",
    "direction": "outgoing",
    "status": "sent",
    "timestamp": "14:30",
    "createdAt": "2025-01-15T14:30:00Z"
  }
}
```

**Hata:**
```json
{
  "error": "Hata mesajı",
  "details": "Detaylı hata açıklaması"
}
```

### Önemli Notlar:

1. **conversationId Gerekli:** Agent cevabını kaydetmek için mutlaka `conversationId` göndermelisiniz
2. **sender: "ai":** Agent cevapları için `sender` değeri `"ai"` olmalı
3. **Otomatik İşlemler:** API endpoint kullanırsanız:
   - `last_message` otomatik güncellenir
   - `last_message_time` otomatik güncellenir
   - `unread_count` otomatik sıfırlanır (ai mesajı olduğu için)
   - Mesaj limiti kontrol edilir (1000 mesaj)

### n8n'de JSON Hatası Çözümü

Eğer **"JSON parameter needs to be valid JSON"** hatası alıyorsanız:

#### Hatalı Format:
```json
{
  "conversationId": 1,
  "message": asasa,  // ❌ Tırnak yok!
  "sender": "ai"
}
```

#### Doğru Format (Expression ile):
```json
{
  "conversationId": {{ $json.conversation_id }},
  "message": {{ $json.agent_response }},  // ✅ Expression otomatik tırnak ekler
  "sender": "ai",
  "direction": "outgoing",
  "status": "sent"
}
```

#### Adım Adım Çözüm:

1. **HTTP Request Node** → **"Specify Body"** → **"JSON"** seçin
2. **Expression Editor** açın (sağ üstteki `</>` ikonu)
3. Şu formatı kullanın:
```json
{
  "conversationId": {{ $json.conversation_id }},
  "message": {{ $json.agent_response }},
  "sender": "ai",
  "direction": "outgoing",
  "status": "sent"
}
```

4. **Expression Editor'ı kapatın** ve **"Execute Node"** ile test edin

#### Key-Value Pairs Alternatifi:

Eğer hala sorun yaşıyorsanız:
1. **"Specify Body"** → **"Key-Value Pairs"** seçin
2. Her alanı ayrı ayrı ekleyin:
   - Key: `conversationId`, Value: `{{ $json.conversation_id }}`
   - Key: `message`, Value: `{{ $json.agent_response }}`
   - Key: `sender`, Value: `ai` (sabit değer)
   - Key: `direction`, Value: `outgoing`
   - Key: `status`, Value: `sent`

### SSL/PEM Hatası Çözümü

Eğer **"PEM routines::no start line"** hatası alıyorsanız:

#### Sorun:
1. **Yanlış URL:** Supabase URL'sine istek atıyorsunuz
2. **SSL Ayarları:** `agentOptions` içinde hatalı SSL sertifikaları var

#### Çözüm:

**1. URL'yi Düzelt:**
```
❌ YANLIŞ: https://glulgpduhcalodgkujpy.supabase.co/api/messages
✅ DOĞRU: https://your-nextjs-app.com/api/messages
```

**2. SSL Ayarlarını Kaldır:**

n8n HTTP Request Node'unda:
- **"Authentication"** → **"None"** seçin
- **"Agent Options"** bölümünü **KULLANMAYIN** veya **BOŞ BIRAKIN**
- **"Reject Unauthorized"** → **KAPATIN** (eğer self-signed certificate kullanıyorsanız)

**3. Basit Ayarlar:**

```
Method: POST
URL: https://your-domain.com/api/messages
Authentication: None
Specify Body: JSON
Body: {
  "conversationId": {{ $json.conversation_id }},
  "message": {{ $json.agent_response }},
  "sender": "ai",
  "direction": "outgoing",
  "status": "sent"
}
Headers: {
  "Content-Type": "application/json"
}
```

**4. Eğer Local Test Ediyorsanız:**

```
URL: http://localhost:3000/api/messages
(HTTPS değil, HTTP kullanın)
```

### Test İçin cURL Örneği:

```bash
curl -X POST https://your-domain.com/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "message": "Merhaba! Size nasıl yardımcı olabilirim?",
    "sender": "ai",
    "direction": "outgoing",
    "status": "sent"
  }'
```

