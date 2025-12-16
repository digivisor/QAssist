# n8n WhatsApp Müşteri Mesajı Kaydetme Rehberi

## WhatsApp'tan Gelen Müşteri Mesajlarını Kaydetme

WhatsApp webhook'undan gelen müşteri mesajlarını veritabanına kaydetmek için aşağıdaki adımları izleyin.

### Tam n8n Akış Yapısı:

```
1. [Webhook] - WhatsApp mesajı geldi
   ↓
2. [Function/Set] - Mesaj verilerini hazırla
   ↓
3. [HTTP Request] - Conversation oluştur/bul
   ↓
4. [Function/Set] - Conversation ID'yi al
   ↓
5. [HTTP Request] - Müşteri mesajını kaydet ⭐
   ↓
6. [AI Agent] - Cevap üret (opsiyonel)
   ↓
7. [HTTP Request] - Agent cevabını kaydet
```

## Adım Adım Kurulum

### 1. WhatsApp Webhook Node

**Trigger:** Webhook  
**Settings:**
- **HTTP Method:** POST
- **Path:** `whatsapp-message` (istediğiniz path)
- **Response Mode:** Respond to Webhook

**Webhook'tan gelen veri örneği:**
```json
{
  "messages": [
    {
      "from": "905551957476",
      "text": {
        "body": "Merhaba, oda rezervasyonu yapmak istiyorum"
      }
    }
  ],
  "contacts": [
    {
      "profile": {
        "name": "Fazıl"
      },
      "wa_id": "905551957476"
    }
  ]
}
```

### 2. Conversation Oluştur/Bul

**Node:** HTTP Request  
**Method:** `POST`  
**URL:** `https://your-domain.com/api/conversations`  
veya Supabase için:  
`https://glulgpduhcalodgkujpy.supabase.co/rest/v1/conversations`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "your-supabase-anon-key",
  "Authorization": "Bearer your-supabase-anon-key"
}
```

**Body (JSON - Expression Editor'da):**
```json
{
  "customerName": {{ $('WhatsApp Trigger').item.json.contacts[0].profile.name }},
  "customerPhone": {{ $('WhatsApp Trigger').item.json.messages[0].from }},
  "customerId": null
}
```

**VEYA Key-Value Pairs:**
| Key | Value |
|-----|-------|
| customerName | `{{ $('WhatsApp Trigger').item.json.contacts[0].profile.name }}` |
| customerPhone | `{{ $('WhatsApp Trigger').item.json.messages[0].from }}` |
| customerId | (boş bırakın) |

**Response:** Conversation ID döner
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerName": "Fazıl",
    "customerPhone": "905551957476"
  }
}
```

### 3. Müşteri Mesajını Kaydet ⭐

**Node:** HTTP Request  
**Method:** `POST`  
**URL:** `https://glulgpduhcalodgkujpy.supabase.co/rest/v1/rpc/add_message_to_conversation`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWxncGR1aGNhbG9kZ2t1anB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDY5MzYsImV4cCI6MjA3ODUyMjkzNn0.wO1BY4owuxe34xZK0FE55TX1CEqTJOfmk2jhi2u-R1E",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWxncGR1aGNhbG9kZ2t1anB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDY5MzYsImV4cCI6MjA3ODUyMjkzNn0.wO1BY4owuxe34xZK0FE55TX1CEqTJOfmk2jhi2u-R1E"
}
```

**Body (JSON - Expression Editor'da):**
```json
{
  "conv_id": {{ $('HTTP Request').item.json.data.id }},
  "msg_text": {{ $('WhatsApp Trigger').item.json.messages[0].text.body }},
  "msg_sender": "customer",
  "msg_direction": "incoming",
  "msg_status": "sent"
}
```

**⚠️ ÖNEMLİ n8n Ayarları:**

1. **"Specify Body"** → **"JSON"** seçin
2. **Expression Editor** açın (sağ üstteki `</>` ikonu)
3. Expression'ları **TIRNAK İÇİNDE YAZMAYIN** - n8n otomatik ekler

**YANLIŞ:**
```json
{
  "msg_text": "{{ $json.message }}"  // ❌ Tırnak içinde expression
}
```

**DOĞRU:**
```json
{
  "msg_text": {{ $json.message }}  // ✅ Tırnak yok, n8n otomatik ekler
}
```

**Alternatif: Key-Value Pairs Kullan:**

Eğer expression sorun çıkarıyorsa:
1. **"Specify Body"** → **"Key-Value Pairs"** seçin
2. Her alanı ayrı ekleyin:

| Key | Value |
|-----|-------|
| conv_id | `{{ $('HTTP Request').item.json.data.id }}` |
| msg_text | `{{ $('WhatsApp Trigger').item.json.messages[0].text.body }}` |
| msg_sender | `customer` |
| msg_direction | `incoming` |
| msg_status | `sent` |

### 4. Tam n8n Akış Örneği

#### Node 1: WhatsApp Webhook
```json
{
  "messages": [{
    "from": "905551957476",
    "text": { "body": "Merhaba" }
  }],
  "contacts": [{
    "profile": { "name": "Fazıl" },
    "wa_id": "905551957476"
  }]
}
```

#### Node 2: HTTP Request - Conversation Oluştur/Bul
**URL:** `https://your-domain.com/api/conversations`  
**Body (Expression Editor):**
```json
{
  "customerName": {{ $('WhatsApp Trigger').item.json.contacts[0].profile.name }},
  "customerPhone": {{ $('WhatsApp Trigger').item.json.messages[0].from }},
  "customerId": null
}
```

#### Node 3: HTTP Request - Müşteri Mesajını Kaydet
**URL:** `https://glulgpduhcalodgkujpy.supabase.co/rest/v1/rpc/add_message_to_conversation`  
**Body (Expression Editor):**
```json
{
  "conv_id": {{ $('HTTP Request').item.json.data.id }},
  "msg_text": {{ $('WhatsApp Trigger').item.json.messages[0].text.body }},
  "msg_sender": "customer",
  "msg_direction": "incoming",
  "msg_status": "sent"
}
```

## Sorun Giderme

### "JSON parameter needs to be valid JSON" Hatası

**Sorun:** Expression'lar tırnak içinde yazılmış veya yanlış formatlanmış.

**Çözüm 1: Expression Editor Kullan**
1. **"Specify Body"** → **"JSON"** seçin
2. **Expression Editor** açın (`</>` ikonu)
3. Expression'ları **TIRNAK İÇİNDE YAZMAYIN**:
   ```json
   {
     "msg_text": {{ $json.message }}  // ✅ Doğru
   }
   ```
   ```json
   {
     "msg_text": "{{ $json.message }}"  // ❌ Yanlış
   }
   ```

**Çözüm 2: Key-Value Pairs Kullan**
1. **"Specify Body"** → **"Key-Value Pairs"** seçin
2. Her alanı ayrı ayrı ekleyin
3. Value kısmında expression'ı tırnak olmadan yazın: `{{ $json.message }}`

**Çözüm 3: Function Node ile Hazırla**
Önce bir Function node ile veriyi hazırlayın:
```javascript
return {
  json: {
    conv_id: $('HTTP Request').item.json.data.id,
    msg_text: $('WhatsApp Trigger').item.json.messages[0].text.body,
    msg_sender: 'customer',
    msg_direction: 'incoming',
    msg_status: 'sent'
  }
};
```

Sonra HTTP Request'te:
```json
{
  "conv_id": {{ $json.conv_id }},
  "msg_text": {{ $json.msg_text }},
  "msg_sender": {{ $json.msg_sender }},
  "msg_direction": {{ $json.msg_direction }},
  "msg_status": {{ $json.msg_status }}
}
```

## Test İçin cURL Örneği

```bash
curl -X POST https://glulgpduhcalodgkujpy.supabase.co/rest/v1/rpc/add_message_to_conversation \
  -H "Content-Type: application/json" \
  -H "apikey: your-supabase-anon-key" \
  -H "Authorization: Bearer your-supabase-anon-key" \
  -d '{
    "conv_id": 1,
    "msg_text": "Merhaba, oda rezervasyonu yapmak istiyorum",
    "msg_sender": "customer",
    "msg_direction": "incoming",
    "msg_status": "sent"
  }'
```
