# Production API Documentation - v2.0

## Overview
This document describes the API endpoints for the Dual Streaming Crypto Pipeline. The API supports real-time data streaming, CSV upload, dataset management, and API key configuration.

**Base URL:** `http://localhost:5000`  
**Rate Limit:** 500 req/min (development), 100 req/min (production)

---

## Authentication

### Login
Create a session and obtain an authentication token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "fullName": "Administrator",
      "role": "administrator"
    },
    "token": "base64_encoded_token",
    "expiresIn": "24h"
  },
  "message": "Login successful"
}
```

### Logout
Invalidate the current session.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Data Endpoints

### Get Latest Prices
Fetch the most recent cryptocurrency price data.

**Endpoint:** `GET /api/latest`

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "coin_id": "bitcoin",
      "coin_name": "Bitcoin",
      "symbol": "BTC",
      "current_price": 42850.50,
      "price_change_pct_24h": 2.5,
      "market_cap": 840500000000,
      "total_volume": 28500000000,
      "fetched_at": "2026-04-07T12:00:00Z"
    }
  ],
  "message": "Latest prices retrieved",
  "meta": {
    "source": "cache",
    "cached": true
  }
}
```

### Get Historical Data
Retrieve paginated historical cryptocurrency data.

**Endpoint:** `GET /api/history`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Results per page (1-500, default: 50) |
| `offset` | integer | Number of records to skip (default: 0) |
| `coin` | string | Filter by coin ID (optional) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [...],
  "message": "Historical data retrieved",
  "meta": {
    "total": 1250,
    "limit": 50,
    "offset": 0,
    "page": 1,
    "pages": 25
  }
}
```

### Get Statistics
Retrieve aggregate statistics about the dataset.

**Endpoint:** `GET /api/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_records": 1250,
    "unique_coins": 15,
    "avg_price_usd": 1245.75,
    "total_volume_usd": 125000000,
    "market_cap_total": 1200000000000,
    "last_updated": "2026-04-07T12:00:00Z"
  },
  "message": "Statistics retrieved"
}
```

---

## Dataset Management

### Upload CSV Dataset
Upload a cryptocurrency dataset in CSV format.

**Endpoint:** `POST /api/dataset/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `file` (file): CSV file with cryptocurrency data

**CSV Format:**
```
coin_id,coin_name,symbol,current_price,price_change_pct_24h,market_cap,total_volume,fetched_at
bitcoin,Bitcoin,BTC,42850.50,2.5,840500000000,28500000000,2026-04-07T12:00:00Z
ethereum,Ethereum,ETH,2298.75,1.8,276300000000,12300000000,2026-04-07T12:00:00Z
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "recordCount": 1250,
    "columnCount": 8,
    "uploadedAt": "2026-04-07T12:00:00Z",
    "fileName": "crypto-data.csv"
  },
  "message": "Dataset uploaded successfully"
}
```

### Save API Key
Store an API key for external data sources.

**Endpoint:** `POST /api/config/api-key`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "provider": "coingecko",
  "apiKey": "your_api_key_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API key saved successfully"
}
```

### Get API Key
Retrieve stored API key (masked for security).

**Endpoint:** `GET /api/config/api-key`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "provider": "coingecko",
    "apiKey": "****...****",
    "savedAt": "2026-04-07T12:00:00Z"
  },
  "message": "API key retrieved"
}
```

---

## CSV Export

### Download Sample CSV
Export sample cryptocurrency data as CSV.

**Endpoint:** `GET /api/csv/sample`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `rows` | integer | Number of rows to generate (1-5000, default: 100) |

**Response:** CSV file download

### Get Demo Analysis
Get sample data with analytical insights.

**Endpoint:** `GET /api/csv/demo`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rawData": [...],
    "summary": {
      "totalRecords": 100,
      "uniqueCoins": 10,
      "avgPrice": 1245.75,
      "avgVolume": 1200000000
    },
    "topGainers": [...],
    "topLosers": [...]
  },
  "message": "Demo data with analysis"
}
```

---

## Health & Status

### Server Health
Check server status and health metrics.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "uptime": 3600.5,
    "memory": {
      "rss": 50000000,
      "heapTotal": 30000000,
      "heapUsed": 20000000,
      "external": 1000000
    },
    "timestamp": "2026-04-07T12:00:00Z"
  },
  "message": "Server is healthy"
}
```

### API Root
Get API information and endpoint list.

**Endpoint:** `GET /`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "project": "Dual Streaming Pipeline",
    "status": "running",
    "version": "2.0.0",
    "features": [
      "Real-time WebSocket streaming",
      "REST API with validation",
      "CSV data export",
      "Rate limiting & caching",
      "Request logging"
    ],
    "endpoints": {
      "health": "/api/health",
      "latest": "/api/latest",
      "history": "/api/history",
      "stats": "/api/stats"
    },
    "websocket": "ws://localhost:5000"
  },
  "message": "Server is running"
}
```

---

## WebSocket Events

### Connect
Establish WebSocket connection.

**Event:** `connect`

**Payload:**
```javascript
// Server sends welcome message
{
  message: 'Connected to Dual Streaming Pipeline',
  server_time: '2026-04-07T12:00:00Z'
}
```

### Crypto Update
Receive live cryptocurrency updates.

**Event:** `crypto:update`

**Payload:**
```javascript
{
  timestamp: '2026-04-07T12:00:00Z',
  data: [
    {
      coin_id: 'bitcoin',
      coin_name: 'Bitcoin',
      symbol: 'BTC',
      current_price: 42850.50,
      price_change_pct_24h: 2.5,
      market_cap: 840500000000,
      total_volume: 28500000000,
      fetched_at: '2026-04-07T12:00:00Z'
    }
  ]
}
```

---

## Error Handling

### Error Response Format
All errors follow a standard format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes
| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Username or password incorrect |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

Response headers include rate limit information:

```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 2026-04-07T12:01:00Z
Retry-After: 30
```

When rate limited (429):
```json
{
  "success": false,
  "error": "Rate limit exceeded. Retry after 30s",
  "code": "RATE_LIMIT_EXCEEDED",
  "statusCode": 429
}
```

---

## Caching

### Cache Headers
Successful responses include cache information:

```
X-Cache: HIT       // Data from cache
X-Cache: MISS      // Data fetched fresh
```

### Cache TTL
| Endpoint | TTL |
|----------|-----|
| `/api/latest` | 30 seconds |
| `/api/stats` | 60 seconds |
| `/api/history` | No cache (real-time) |

---

## Example Usage

### JavaScript/Fetch

```javascript
// Login
const loginRes = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const { data: { token } } = await loginRes.json();

// Get latest prices
const pricesRes = await fetch('http://localhost:5000/api/latest', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const prices = await pricesRes.json();

// WebSocket
const socket = io('http://localhost:5000');
socket.on('crypto:update', (payload) => {
  console.log('Updated prices:', payload.data);
});
```

### Python/Requests

```python
import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder

# Login
response = requests.post('http://localhost:5000/auth/login', json={
    'username': 'admin',
    'password': 'admin123'
})
token = response.json()['data']['token']

headers = {'Authorization': f'Bearer {token}'}

# Upload dataset
with open('crypto-data.csv', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5000/api/dataset/upload',
                           files=files, headers=headers)

# Get latest prices
response = requests.get('http://localhost:5000/api/latest', headers=headers)
prices = response.json()['data']
```

---

## Support

For issues or questions:
1. Check the API response error message
2. Verify your authentication token
3. Check rate limit headers
4. Review server logs (terminal output)
5. Ensure backend is running on port 5000
