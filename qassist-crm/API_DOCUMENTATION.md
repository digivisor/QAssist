# API Dokümantasyonu

## Aktif Müşterileri Çekme

### Endpoint
```
GET /api/customers/active
```

### Açıklama
Aktif müşterileri JSON formatında döndürür. Aktif müşteri, `status='active'` ve `check_out` tarihi bugünden sonra veya bugün olan müşterilerdir.

### Kullanım

#### Next.js Uygulaması İçinden
```typescript
const response = await fetch('/api/customers/active');
const result = await response.json();
console.log(result.data); // Aktif müşteriler array'i
```

#### Doğrudan Supabase REST API (Harici Kullanım)
```bash
curl -X GET 'https://glulgpduhcalodgkujpy.supabase.co/rest/v1/customers?status=eq.active&check_out=gte.2024-01-01' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

#### JavaScript/Fetch ile
```javascript
const SUPABASE_URL = 'https://glulgpduhcalodgkujpy.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const today = new Date().toISOString().split('T')[0];

fetch(`${SUPABASE_URL}/rest/v1/customers?status=eq.active&check_out=gte.${today}&select=*`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Response Formatı

#### Başarılı Response
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "firstName": "Ahmet",
      "lastName": "Yılmaz",
      "name": "Ahmet Yılmaz",
      "phone": "+90 555 123 4567",
      "email": "ahmet@example.com",
      "address": "İstanbul",
      "roomNumber": "101",
      "roomType": "Standart Oda",
      "checkIn": "2024-01-15",
      "checkOut": "2024-01-20",
      "nights": 5,
      "totalGuests": 2,
      "status": "active",
      "totalReservations": 1,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Hata Response
```json
{
  "error": "Müşteriler yüklenirken hata oluştu",
  "details": "Error message details"
}
```

### Query Parametreleri (Doğrudan Supabase API)

- `status=eq.active` - Sadece aktif müşteriler
- `check_out=gte.YYYY-MM-DD` - Check-out tarihi bugünden sonra veya bugün
- `select=*` - Tüm kolonları getir
- `order=created_at.desc` - Oluşturulma tarihine göre sırala

### Örnek Kullanım Senaryoları

#### 1. Tüm Aktif Müşterileri Listele
```javascript
const response = await fetch('/api/customers/active');
const { data } = await response.json();
data.forEach(customer => {
  console.log(`${customer.name} - Oda ${customer.roomNumber}`);
});
```

#### 2. Belirli Bir Oda Numarasına Göre Filtrele
```javascript
const response = await fetch('/api/customers/active');
const { data } = await response.json();
const room101 = data.filter(c => c.roomNumber === '101');
```

#### 3. Bugün Check-out Olan Müşteriler
```javascript
const today = new Date().toISOString().split('T')[0];
const response = await fetch(`/api/customers/active`);
const { data } = await response.json();
const checkingOutToday = data.filter(c => c.checkOut === today);
```

### Notlar

- API endpoint'i Next.js API route olarak çalışır
- Supabase anon key otomatik olarak kullanılır
- CORS ayarları gerekirse yapılmalıdır
- Rate limiting için Supabase plan limitlerine dikkat edilmelidir

---

## Telefon Numarasına Göre Aktif Müşteri ve Tüm Verilerini Çekme

### Endpoint
```
GET /api/customers/by-phone?phone=TELEFON_NUMARASI
```

### Açıklama
Telefon numarasına göre aktif müşteriyi bulur ve o müşteriye ait TÜM ilişkili verileri (oda misafirleri, talepler, sorunlar, AI analizi, etkinlik rezervasyonları, restoran rezervasyonları) JSON formatında döndürür.

### Kullanım

#### Next.js Uygulaması İçinden
```typescript
const phone = '+905551234567';
const response = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(phone)}`);
const result = await response.json();
if (result.success) {
  console.log('Müşteri:', result.data);
  console.log('Oda Misafirleri:', result.data.roomGuests);
  console.log('Talepler:', result.data.requests);
  console.log('Sorunlar:', result.data.issues);
  console.log('AI Analizi:', result.data.aiAnalysis);
  console.log('Etkinlik Rezervasyonları:', result.data.eventReservations);
  console.log('Restoran Rezervasyonları:', result.data.restaurantReservations);
}
```

#### Doğrudan Supabase REST API (Harici Kullanım)
```bash
# Önce telefon numarasına göre müşteriyi bul
PHONE="+905551234567"
curl -X GET "https://glulgpduhcalodgkujpy.supabase.co/rest/v1/customers?phone=eq.${PHONE}&status=eq.active&select=*" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"

# Sonra customer_id ile ilişkili verileri çek
CUSTOMER_ID=1
curl -X GET "https://glulgpduhcalodgkujpy.supabase.co/rest/v1/room_guests?customer_id=eq.${CUSTOMER_ID}&select=*" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

#### JavaScript/Fetch ile
```javascript
const phone = '+905551234567';
const response = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(phone)}`);
const result = await response.json();

if (result.success) {
  const customer = result.data;
  console.log('Müşteri Bilgileri:', {
    name: customer.name,
    phone: customer.phone,
    room: customer.roomNumber,
    checkIn: customer.checkIn,
    checkOut: customer.checkOut
  });
  
  console.log('Oda Misafirleri:', customer.roomGuests);
  console.log('Talepler:', customer.requests);
  console.log('Sorunlar:', customer.issues);
  console.log('AI Analizi:', customer.aiAnalysis);
  console.log('Etkinlikler:', customer.eventReservations);
  console.log('Restoran Rezervasyonları:', customer.restaurantReservations);
} else {
  console.error('Hata:', result.error);
}
```

### Response Formatı

#### Başarılı Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "name": "Ahmet Yılmaz",
    "phone": "+90 555 123 4567",
    "email": "ahmet@example.com",
    "address": "İstanbul",
    "roomNumber": "101",
    "roomType": "Standart Oda",
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-20",
    "nights": 5,
    "totalGuests": 2,
    "status": "active",
    "totalReservations": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    
    "roomGuests": [
      {
        "id": 1,
        "firstName": "Ayşe",
        "lastName": "Yılmaz",
        "phone": "+90 555 123 4568",
        "email": "ayse@example.com",
        "relationship": "spouse",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    
    "requests": [
      {
        "id": 1,
        "type": "Ekstra Yatak",
        "description": "Odaya ekstra yatak eklenmesi",
        "date": "2024-01-16",
        "status": "completed",
        "createdAt": "2024-01-16T08:00:00Z"
      }
    ],
    
    "issues": [
      {
        "id": 1,
        "topic": "WiFi Bağlantı Sorunu",
        "description": "Oda WiFi'si çalışmıyor",
        "date": "2024-01-17",
        "resolved": true,
        "resolvedAt": "2024-01-17T14:00:00Z",
        "createdAt": "2024-01-17T10:00:00Z"
      }
    ],
    
    "aiAnalysis": {
      "id": 1,
      "behavior": "Sakin ve nazik bir müşteri. Talepleri makul ve ölçülü.",
      "preferences": ["Sessiz oda", "Yüksek kat", "Deniz manzarası"],
      "suggestions": ["VIP hizmet sunulabilir", "Tekrar ziyaret için özel fiyat teklifi"],
      "satisfaction": "high",
      "riskLevel": "low",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-18T10:00:00Z"
    },
    
    "eventReservations": [
      {
        "id": 1,
        "eventName": "Spa Masaj",
        "eventType": "spa",
        "eventDate": "2024-01-18",
        "eventTime": "14:00:00",
        "numberOfGuests": 1,
        "status": "confirmed",
        "notes": "Çift masaj tercih ediyor",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    
    "restaurantReservations": [
      {
        "id": 1,
        "restaurantName": "Grand Restaurant",
        "reservationDate": "2024-01-19",
        "reservationTime": "20:00:00",
        "numberOfGuests": 2,
        "tableNumber": "12",
        "status": "confirmed",
        "specialRequests": "Pencere kenarı masa",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Hata Response (Müşteri Bulunamadı)
```json
{
  "error": "Aktif müşteri bulunamadı",
  "details": "Bu telefon numarasına sahip aktif müşteri bulunamadı"
}
```

#### Hata Response (Parametre Eksik)
```json
{
  "error": "Telefon numarası parametresi gerekli",
  "details": "phone parametresi eksik"
}
```

### Query Parametreleri

- `phone` (zorunlu) - Aranacak telefon numarası

### Örnek Kullanım Senaryoları

#### 1. Telefon Numarasına Göre Müşteri Bilgilerini Çek
```javascript
const phone = '+905551234567';
const response = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(phone)}`);
const { data } = await response.json();
console.log(`${data.name} - Oda ${data.roomNumber}`);
```

#### 2. Müşterinin Tüm Taleplerini Listele
```javascript
const phone = '+905551234567';
const response = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(phone)}`);
const { data } = await response.json();
data.requests.forEach(request => {
  console.log(`${request.type}: ${request.description} - ${request.status}`);
});
```

#### 3. Müşterinin Etkinlik ve Restoran Rezervasyonlarını Göster
```javascript
const phone = '+905551234567';
const response = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(phone)}`);
const { data } = await response.json();

console.log('Etkinlik Rezervasyonları:');
data.eventReservations.forEach(event => {
  console.log(`- ${event.eventName} (${event.eventDate})`);
});

console.log('Restoran Rezervasyonları:');
data.restaurantReservations.forEach(reservation => {
  console.log(`- ${reservation.restaurantName} (${reservation.reservationDate} ${reservation.reservationTime})`);
});
```

#### 4. Müşterinin AI Analizini Kontrol Et
```javascript
const phone = '+905551234567';
const response = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(phone)}`);
const { data } = await response.json();

if (data.aiAnalysis) {
  console.log('Memnuniyet:', data.aiAnalysis.satisfaction);
  console.log('Risk Seviyesi:', data.aiAnalysis.riskLevel);
  console.log('Tercihler:', data.aiAnalysis.preferences);
  console.log('Öneriler:', data.aiAnalysis.suggestions);
}
```

### Notlar

- Telefon numarası tam eşleşme ile aranır (case-sensitive değil)
- Sadece aktif müşteriler döndürülür (status='active' ve check_out >= bugün)
- Tüm ilişkili veriler tek bir response'da döner
- Müşteri bulunamazsa 404 hatası döner
- Telefon numarası parametresi eksikse 400 hatası döner

