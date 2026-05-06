# Vehicle Tracking — Real-Time API Documentation

> Backend bilan ishlashda foydalaniladigan barcha API'lar va WebSocket eventlari.
> Boshqa frontend loyihada ishlatish uchun tayyorlangan.

---

## 1. Asosiy URL'lar

| Nom | Development | Production |
|-----|-------------|------------|
| REST API | `http://localhost:8085` | `https://tmk.bgs.uz/api` |
| WebSocket | `ws://localhost:8085/tracking` | `wss://tmk.bgs.uz/tracking` |
| Upload | `http://localhost:8085` | `https://tmk.bgs.uz/upload` |

**Muhit o'zgaruvchilari (`.env`):**
```
REACT_APP_API_URL=http://localhost:8085
REACT_APP_API_URL_UPLOAD=https://tmk.bgs.uz/upload
```

---

## 2. Autentifikatsiya

Barcha so'rovlarda JWT token kerak.

### Login
```
POST /auth/login
```

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Token ishlatish:**
```
Authorization: Bearer {token}
```

Token `localStorage`da saqlanadi: `localStorage.getItem("token")`

**Axios interceptor** har bir so'rovga avtomatik qo'shadi:
- `Authorization: Bearer {token}` header
- `?lang=uz` (yoki `ru`, `en`) query parametr

---

## 3. Real-Time Transport Ma'lumotlari (REST Polling)

Hozirgi tizimda **5 soniyada bir** REST API orqali so'rov yuboriladi (WebSocket o'rniga polling ishlatilgan).

### 3.1 Transportlar ro'yxati (real-time pozitsiyalar)

```
GET /api/vehicles/realtime
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "name": "Transport nomi",
      "className": "truck",
      "position": {
        "latitude": 41.299500,
        "longitude": 69.240100,
        "speed": 60,
        "course": 180,
        "altitude": 450,
        "satellites": 8,
        "time": 1714900000,
        "lastUpdate": "2024-05-05T10:30:00Z"
      },
      "status": {
        "isOnline": true,
        "connectionTime": 1714890000,
        "lastMessage": 1714900000
      },
      "sensors": {
        "ignition": true,
        "voltage": 12.5,
        "fuel": 75,
        "temperature": 25,
        "gsmSignal": 4,
        "gpsAccuracy": 2.5,
        "externalPower": 12.8,
        "internalPower": 4.1,
        "satellites": 8
      },
      "parameters": {},
      "additional": {
        "muteMode": 0,
        "accessLevel": 1,
        "lastMessageId": 987654
      }
    }
  ]
}
```

> **Eslatma:** Response `{ success, data }` formatida yoki to'g'ridan-to'g'ri array bo'lishi mumkin. Ikkalasini ham handle qiling:
> ```js
> const list = response.data?.success ? response.data.data : response.data;
> ```

---

### 3.2 Statistika

```
GET /api/vehicles/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "online": 87
  }
}
```

---

## 4. TypeScript Interfeyslari

```typescript
interface Vehicle {
  id: number;
  name: string;
  className: string;
  position: {
    latitude: number;
    longitude: number;
    speed: number;          // km/h
    course: number;         // daraja (0-360)
    altitude: number;       // metr
    satellites: number;
    time: number;           // Unix timestamp
    lastUpdate: string | null; // ISO 8601
  };
  status: {
    isOnline: boolean;
    connectionTime: number; // Unix timestamp
    lastMessage: number;    // Unix timestamp
  };
  sensors: {
    ignition?: boolean;
    voltage?: number;       // Volt
    fuel?: number;          // foiz (0-100)
    temperature?: number;   // Celsius
    gsmSignal?: number;     // 0-5
    gpsAccuracy?: number;   // metr
    externalPower?: number; // Volt
    internalPower?: number; // Volt
    satellites?: number;
  };
  parameters?: Record<string, any>;
  additional?: {
    muteMode: number;
    accessLevel: number;
    lastMessageId: number;
  };
}

interface VehicleStats {
  total: number;
  online: number;
}
```

---

## 5. WebSocket (Socket.IO)

WebSocket hook mavjud (`src/hooks/useWebSocket.ts`) lekin hozircha **asosiy komponentda ishlatilmaydi** — u polling bilan almashtirilgan. Ammo hook tayyor va ishlatsa bo'ladi.

### Ulash

```typescript
import { io } from "socket.io-client";

const socket = io("ws://localhost:8085/tracking", {
  transports: ["websocket", "polling"],
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});
```

---

### 5.1 Client → Server (Emit)

| Event | Payload | Maqsad |
|-------|---------|--------|
| `enableRealTimeTracking` | `{ interval: 1000, includePosition: true, includeStatus: true, realTime: true }` | 1 soniyalik real-time yangilanishni yoqish |
| `disableRealTimeTracking` | yo'q | Real-time yangilanishni o'chirish |
| `requestVehicleDetails` | `{ vehicleId: number }` | Bitta transport haqida batafsil ma'lumot |
| `syncVehicles` | yo'q | Transport ro'yxatini server bilan sinxronlash |
| `checkStatus` | yo'q | Ulanish holatini tekshirish |

**Misol:**
```typescript
socket.emit("enableRealTimeTracking", {
  interval: 1000,
  includePosition: true,
  includeStatus: true,
  realTime: true,
});
```

---

### 5.2 Server → Client (Listen)

#### `vehicleUpdates`
Asosiy event — barcha transportlar ma'lumoti.

```typescript
interface VehicleUpdateData {
  status: "success" | "no_data" | "error";
  vehicles?: Vehicle[];
  count?: number;
  timestamp?: string;     // ISO 8601
  message?: string;
  error?: string;
}

socket.on("vehicleUpdates", (data: VehicleUpdateData) => {
  if (data.status === "success" && data.vehicles) {
    // data.vehicles — yangilangan transport ro'yxati
  } else if (data.status === "no_data") {
    // Ma'lumot yo'q (Wialon API muammosi)
  } else if (data.status === "error") {
    // Xatolik
  }
});
```

#### `realTimeVehicleUpdate`
Real-time pozitsiya yangilanishlari.

```typescript
socket.on("realTimeVehicleUpdate", (data: {
  vehicles: Vehicle[];
  totalCount: number;
}) => {
  // data.vehicles — yangilangan pozitsiyalar
});
```

#### Ulanish eventlari

```typescript
socket.on("connect", () => {
  // Ulandi — enableRealTimeTracking yuborish mumkin
});

socket.on("disconnect", (reason: string) => {
  // Uzildi
});

socket.on("connect_error", (error: Error) => {
  // Ulanib bo'lmadi — REST API fallback ishlatish kerak
});
```

---

### 5.3 To'liq WebSocket hook (tayyor ishlatish uchun)

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export const useWebSocket = (wsUrl = "ws://localhost:8085/tracking") => {
  const [isConnected, setIsConnected] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(wsUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      setTimeout(() => {
        socketRef.current?.emit("enableRealTimeTracking", {
          interval: 1000,
          includePosition: true,
          includeStatus: true,
          realTime: true,
        });
      }, 1000);
    });

    socketRef.current.on("vehicleUpdates", (data) => {
      if (data.status === "success" && data.vehicles) {
        setVehicles(data.vehicles);
        setLastUpdate(new Date(data.timestamp || Date.now()));
        setError(null);
      }
    });

    socketRef.current.on("realTimeVehicleUpdate", (data) => {
      if (data?.vehicles) {
        setVehicles(data.vehicles);
        setLastUpdate(new Date());
      }
    });

    socketRef.current.on("disconnect", () => setIsConnected(false));
    socketRef.current.on("connect_error", () =>
      setError("WebSocket ulanmadi — REST API fallback ishlatiladi")
    );

    return () => {
      socketRef.current?.disconnect();
    };
  }, [wsUrl]);

  return { isConnected, vehicles, lastUpdate, error };
};
```

---

## 6. Haydovchi (Driver) API

### 6.1 Haydovchi yaratish

```
POST /drivers
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Ism",
  "lastName": "Familiya",
  "phoneNumber": "+998901234567",
  "licenseNumber": "AA123456",
  "licenseCategory": "B",
  "licenseExpiryDate": "2026-12-31",
  "experienceYears": "5",
  "status": "active",
  "email": "driver@example.com"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 42
  }
}
```

**Driver status qiymatlari:** `"active"` | `"inactive"` | `"suspended"`

---

### 6.2 Haydovchini yangilash

```
PUT /drivers/{driverId}
Authorization: Bearer {token}
```

**Body:** Yaratish bilan bir xil struktura.

---

### 6.3 Haydovchini transportga biriktirish

```
POST /drivers/{driverId}/assign-vehicle/{vehicleId}
Authorization: Bearer {token}
```

**Response (200 yoki 201):** muvaffaqiyat

---

## 7. Xarita (MapLibre GL)

Xaritada MapLibre GL ishlatilgan, tile'lar MapTiler'dan olinadi.

```typescript
import maplibregl from "maplibre-gl";

const map = new maplibregl.Map({
  container: mapContainerRef.current,
  style: "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6",
  center: [69.324, 41.299], // Toshkent
  zoom: 12,
});
```

Transport markerlari uchun `/image/carmarker.png` rasmi ishlatiladi.

---

## 8. Analytics Dashboard

Metabase public dashboard iframe orqali ko'rsatiladi:

```
https://tmk.bgs.uz/metabase/public/dashboard/6ce32ea1-343b-44bd-81b9-81b5d13246f0
```

---

## 9. Polling strategiyasi (hozirgi tizim)

```
Dastlabki yuklash:
  → GET /api/vehicles/realtime  (timeout: 1000ms)
  → GET /api/vehicles/stats     (timeout: 1000ms)
  → Natija cache'ga yoziladi (TTL: 30 soniya)

Har 5 soniyada (real-time yoqilganda):
  → GET /api/vehicles/realtime  (timeout: 5000ms)
  → GET /api/vehicles/stats     (timeout: 5000ms)
  → State va cache yangilanadi

Cache ustunligi:
  → Agar cache 30 soniyadan yangi bo'lsa — API chaqirilmaydi
  → Eski cache bor bo'lsa — avval ko'rsatiladi, keyin API yangilanadi
```

---

## 10. Xatoliklarni boshqarish

| Holat | Nima qilish |
|-------|-------------|
| WebSocket ulanmadi | REST API polling'ga o'tish |
| API timeout | Loading state'ni o'chirish, cache'dagi ma'lumotni ko'rsatish |
| 401 Unauthorized | `localStorage`dan tokenni o'chirish, login sahifasiga yo'naltirish |
| Driver API xatoligi | `error.response?.data?.message` ni foydalanuvchiga ko'rsatish |

---

## 11. Tezkor boshlash (Quick Start)

```typescript
// 1. Token oling
const loginRes = await axios.post(`${API_URL}/auth/login`, {
  email: "user@example.com",
  password: "password",
});
const token = loginRes.data.data.token;
localStorage.setItem("token", token);

// 2. Axios interceptor qo'shing
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 3. Transportlarni oling
const res = await axios.get(`${API_URL}/api/vehicles/realtime`);
const vehicles = res.data?.success ? res.data.data : res.data;

// 4. Har 5 soniyada polling
const interval = setInterval(async () => {
  const [vRes, sRes] = await Promise.all([
    axios.get(`${API_URL}/api/vehicles/realtime`),
    axios.get(`${API_URL}/api/vehicles/stats`),
  ]);
  // yangilang...
}, 5000);
```
