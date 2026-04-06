# CryptoFlow - Application Usage Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Features & How to Use](#features--how-to-use)
5. [Troubleshooting](#troubleshooting)
6. [Architecture](#architecture)

---

## Getting Started

### Prerequisites
- **Node.js** v16+ installed
- **npm** package manager
- **MySQL** server (optional - app runs in demo mode without it)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
# or
node src/server.js
```

**Server runs at:** `http://localhost:5000`

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs at:** `http://localhost:5173` (or 5174 if 5173 is busy)

---

## Authentication

### Default Credentials
```
Username: admin
Password: admin123
```

⚠️ **IMPORTANT**: Change these credentials in production!

### How to Login

1. **Navigate** to the frontend URL (`http://localhost:5173`)
2. **You'll see** the beautiful CryptoFlow login page
3. **Enter credentials**:
   - Username: `admin`
   - Password: `admin123`
4. **Click** "Sign In" or use "Try Demo Login" button
5. **Access** the full dashboard

### Session Management

- Sessions are stored in browser's **localStorage**
- Sessions last for **one browser session** (until logout)
- Multiple logins from different browsers are supported
- Click **logout button** (in header) to end session

---

## Dashboard Overview

### Main Sections

#### 1. **Header** (Top Navigation)
- **Connection Status**: Shows WebSocket connection status
- **User Profile**: Displays logged-in user name
- **Last Update**: Shows when data was last refreshed
- **Total Updates**: Counter of data updates received
- **Logout Button**: Sign out of the application

#### 2. **Sidebar** (Left Navigation)
- **Logo & Branding**: CryptoFlow identity
- **User Info**: Current user details
- **Navigation**: Links to different sections (coming soon)
- **Collapsible**: Can be minimized for more space

#### 3. **Hero Banner**
- Explains the **Dual Streaming Pipeline** architecture
- Shows data flow: CoinGecko API → Processing → MySQL + WebSocket
- Visual representation of the system design

#### 4. **Metric Cards** (Key Statistics)
- **Total Active Coins**: Number of cryptocurrencies being tracked
- **Total Updates**: Cumulative data updates
- **Average Price**: Mean cryptocurrency price
- **Market Change**: Overall 24h market movement
- Color-coded (Blue/Cyan/Green/Orange/Red) for quick visual reference

#### 5. **Price Sparklines**
- Mini charts for each cryptocurrency
- Show 50-point rolling history
- Fast visual trend analysis
- Updates in real-time

#### 6. **Analytics Charts**
- **Market Cap Chart**: Distribution of market capitalization
- **Trading Volume Chart**: 24h trading volumes per coin
- Interactive visualizations from Recharts library

#### 7. **Live Coin Table**
- All cryptocurrencies with current data
- Columns: Name, Symbol, Price, 24h Change, Market Cap, Volume
- Color-coded price changes (↑ green, ↓ red)
- Sortable data
- Real-time updates

#### 8. **Data Import & Analytics Section**
- **Download Sample CSV**: Export crypto data for analysis
- **Load Demo & Analyze**: View sample analytics dashboard
- **Summary Stats**: Key metrics (records, coins, prices)
- **Top Gainers/Losers**: Best and worst performers
- **Detailed Table**: Complete coin metrics
- **Raw Data Preview**: First 10 records

#### 9. **Pipeline Log**
- Real-time system logs
- Shows data flow and updates
- Database and WebSocket streaming status

---

## Features & How to Use

### 1. Real-Time Crypto Price Tracking

**What it does**: Continuously fetches and displays cryptocurrency prices from CoinGecko API

**How to use it**:
- Prices update automatically every 5 seconds
- Watch the metric cards for changes
- See live updates in the coin table
- Observe sparklines for trend analysis

### 2. Download Sample Data (CSV)

**What it does**: Generates realistic cryptocurrency sample data that you can download

**How to use it**:
1. Scroll to "Data Import & Analytics" section
2. Click **"Download Sample CSV"** button
3. Choose number of rows (default: 100, max: 5000)
4. CSV file downloads to your downloads folder
5. Import into Excel, Google Sheets, or data analysis tools

**CSV Columns**:
- coin_id, coin_name, symbol
- current_price, price_change_pct_24h
- market_cap, total_volume
- fetched_at (timestamp)

### 3. View Demo Analytics

**What it does**: Shows processed analytics from sample crypto data

**How to use it**:
1. Click **"Load Demo & Analyze"** button
2. Wait for analytics to process (instant)
3. View summary cards:
   - Total Records: Number of data points
   - Unique Coins: How many different cryptocurrencies
   - Avg Price: Average cryptocurrency price
   - Avg 24h Change: Overall market movement
4. **Top Gainers**: Best performing coins
5. **Top Losers**: Worst performing coins
6. **Detailed Stats**: Per-coin metrics
7. **Raw Data Preview**: Sample transaction data

### 4. Real-Time WebSocket Streaming

**What it does**: Continuously pushes live data updates via WebSocket

**How to see it**:
- Look at update counter in header
- Watch metric cards change values
- Observe new entries in tables
- Streaming icon shows connection status

**Technical Details**:
- Connects automatically on page load
- Auto-reconnects if connection drops
- Shows 0 delay between data fetch and display

### 5. Analyze Coin Performance

**What it does**: Provides detailed metrics for each cryptocurrency

**Available Metrics**:
- **Records Count**: Number of data points for that coin
- **Average Price**: Mean price over dataset
- **Min/Max Price**: Price range
- **Volatility**: Price variation percentage
- **24h Change**: Average 24-hour change
- **Volume**: Total and average trading volume

**How to use it**:
1. Look at the detailed stats table in Data Import section
2. Compare coins side-by-side
3. Identify volatility patterns
4. Analyze volume trends
5. Export to spreadsheet for further analysis

### 6. Rate Limiting & API Safety

**What it does**: Protects the API from abuse

**How it affects you**:
- **100 requests per minute** per IP address
- If exceeded, receive 429 "Too Many Requests" response
- Rate limit headers show:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests left
  - `X-RateLimit-Reset`: When limit resets

### 7. Server Caching

**What it does**: Improves performance by caching API responses

**How it benefits you**:
- **Faster page loads**: Cached data served instantly
- **Reduced database hit**s: Less strain on system
- **Cache TTL**:
  - Latest prices: 30 seconds
  - Statistics: 60 seconds
  - CSV download: Generated fresh
- **Cache Headers**: Response shows `X-Cache: HIT/MISS`

---

## Troubleshooting

### Issue: Cannot Login

**Solution 1**: Check credentials
- Username should be: `admin`
- Password should be: `admin123`
- Case-sensitive!

**Solution 2**: Clear browser cache
- Open DevTools (F12)
- Clear localStorage & cookies
- Refresh page
- Try login again

**Solution 3**: Check backend
- Ensure backend is running: `http://localhost:5000`
- Check for error messages in browser console (F12 → Console)
- Restart backend if needed

### Issue: Data Not Updating

**Solution 1**: Check WebSocket connection
- Look for "🔌 Connected" indicator in header
- If red/disconnected, page is in demo mode using cache
- Refresh page to reconnect

**Solution 2**: Check network
- Open DevTools Network tab
- Look for WebSocket connection under WS tab
- If blocked, check firewall/proxy settings

**Solution 3**: Database fallback
- App works without MySQL in demo mode
- Uses in-memory cache instead
- All features still available

### Issue: CSV Download Not Working

**Solution 1**: Check browser settings
- Pop-ups/downloads not blocked
- Check Downloads folder
- Browser's download manager active

**Solution 2**: File size
- Try smaller row count (start with 100)
- Check browser console for errors
- Try different browser if persists

### Issue: Performance Issues

**Solution 1**: Reduce data volume
- Limit displayed coins
- Reduce update frequency
- Close unused browser tabs

**Solution 2**: Check resources
- System RAM usage
- CPU usage
- Close background applications

**Solution 3**: Optimize frontend
- Clear browser cache
- Disable unnecessary extensions
- Update browser to latest version

---

## API Endpoints Reference

### Authentication Endpoints

```
POST /auth/login
  Body: { username, password }
  Response: { user, token }

POST /auth/logout
  Header: Authorization: Bearer <token>
  
GET /auth/me
  Header: Authorization: Bearer <token>
  Response: { user, sessionCreated, sessionDuration }
```

### Data Endpoints

```
GET /api/latest
  Response: Array of latest crypto prices

GET /api/history?limit=50&offset=0&coin=bitcoin
  Query: limit (1-500), offset, coin (optional)
  Response: Paginated historical data

GET /api/stats
  Response: Aggregate market statistics

GET /api/csv/sample?rows=100
  Query: rows (1-5000)
  Response: CSV file download

GET /api/csv/demo
  Response: JSON with raw data + analytics
```

---

## Architecture

### Technology Stack

**Frontend**:
- React 19 with Vite
- Recharts for visualizations
- Axios for HTTP requests
- Socket.io for real-time updates
- Custom CSS with design tokens

**Backend**:
- Node.js + Express
- Socket.io server
- MySQL (optional)
- CoinGecko API integration

**Design System**:
- Primary Color: `#2563eb` (Professional Blue)
- Accent Color: `#06b6d4` (Modern Cyan)
- Success: `#10b981`, Error: `#ef4444`, Warning: `#f59e0b`
- Dark theme for comfortable viewing

### Data Flow

```
User Browser
    ↓
[React App]
    ↓
[Express Server] ← CoinGecko API
    ↓
[Data Processor]
    ↓
[WebSocket Stream] → [Browser Updates]
[Database Stream] → [MySQL] (optional)
```

### Key Features

✅ Real-time data streaming via WebSocket
✅ Fallback caching when database unavailable  
✅ Rate limiting for API protection
✅ Input validation & sanitization
✅ Standardized error responses
✅ Request logging & monitoring
✅ CSV data export & analytics
✅ Beautiful, human-friendly UI
✅ Professional color palette
✅ Responsive design (mobile/tablet/desktop)

---

## Best Practices

### For Users

1. **Always logout** when done using the app
2. **Keep credentials private** - don't share admin password
3. **Monitor rate limits** - don't spam API requests
4. **Use demo mode** for testing before production
5. **Check logs** if something seems wrong

### For Developers

1. **Change default credentials** in production
2. **Use environment variables** for sensitive data
3. **Monitor database performance** if using MySQL
4. **Set up proper logging** for production
5. **Implement proper authentication** (JWT/OAuth2)
6. **Add database encryption** for sensitive data
7. **Set up monitoring & alerts** for downtime

### For Operations

1. **Regular backups** of cryptocurrency data
2. **Monitor API rate limits** from CoinGecko
3. **Set up load balancing** for high traffic
4. **Use Redis** for session management in production
5. **Enable HTTPS** for secure data transmission
6. **Set up CDN** for static assets
7. **Monitor server resources** (CPU, RAM, disk)

---

## Support & Contact

For issues or questions:
1. Check this guide first
2. Review error messages in browser console
3. Check backend logs
4. Review API documentation at `/api-docs`
5. Restart both frontend and backend

---

## Version Info

- **Application**: CryptoFlow v2.0.0
- **Release Date**: April 2026
- **Status**: Production Ready
- **Features**: Real-time streaming, CSV export, Analytics, Multi-user

---

**Enjoy tracking cryptocurrency data with CryptoFlow! 📊🚀**
