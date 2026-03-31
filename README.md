# Dual Streaming Pipeline using API Ingestion for Real-Time Data Delivery

This is a capstone project demonstrating a **Real-Time Data Pipeline** where data is ingested from a live API, processed, and streamed simultaneously to multiple outputs.

## Project Architecture

1. **Ingestion Layer (CoinGecko API)**: Continuously polls live cryptocurrency market data (Bitcoin, Ethereum, etc.) every 5 seconds.
2. **Processing Layer**: Performs lightweight data cleaning: handling nulls, type coercion, and computing a new `trend` field layout.
3. **Dual Streaming Pipeline (The Core)**: Uses `Promise.allSettled()` to broadcast data to two isolated outputs simultaneously:
   - **Output A (MySQL Database)**: Bulk inserts processed records for historical storage.
   - **Output B (WebSockets)**: Broadcasts the processed payload directly to all connected frontend clients via Socket.io.
4. **Presentation Layer (React/Vite)**: A dynamic, real-time dashboard reflecting live database records, connection status, rolling price histories, volume distribution, and event logs.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server running locally on port 3306

### 2. Configure MySQL Database
Update the `backend/.env` file with your MySQL root password:
```env
DB_USER=root
DB_PASSWORD=your_password_here
```
*(The backend logic will automatically create the database `dual_streaming_db` and the required `crypto_prices` table on startup!)*

### 3. Start the Backend Server
Open a terminal in the `backend/` directory:
```bash
cd backend
npm install
npm run dev
```

### 4. Start the Frontend Dashboard
Open a second terminal in the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```

Open your browser to `http://localhost:5173`. You will see the pipeline in action, with the UI flashing as live WebSocket pushes arrive!

---

## 🧪 Testing the Pipeline

1. **Verify Simultaneous Processing**: Check the **Pipeline Event Log** in the UI. When a WebSocket push arrives, check your MySQL console (`SELECT * FROM crypto_prices ORDER BY id DESC LIMIT 10;`) — you will see the exact same records stored securely.
2. **Test Disconnection Resiliency**: Kill the backend process (`Ctrl+C`). Observe the UI immediately detect the failure (Status badge turns red offline, pulse stops). Restart the backend — Socket.io will automatically reconnect, and the stream will resume instantly!
3. **Database Resiliency**: The DB uses a connection pool. Even if inserting historical records is delayed for a few milliseconds, it does **not** block the WebSocket push to the React frontend.

---

## 🛠 Common Errors and Fixes

1. **"ECONNREFUSED / Access denied for user 'root'@'localhost'"**
   - **Fix:** Your MySQL server is either not running on port 3306, or the password in `backend/.env` is incorrect. Start MySQL and explicitly set your `DB_PASSWORD`.
   
2. **"API Rate Limit Exceeded (429)"**
   - **Fix:** CoinGecko free API allows ~30 calls/minute. The app polls every 5s (12/min), which is perfectly safe. If you get this, ensure you didn't run multiple backend instances simultaneously. Wait 1 min and restart.

3. **Frontend shows "Reconnecting..." indefinitely**
   - **Fix:** Verify the backend node server is running. The frontend relies on Socket.io to stream real-time events. Without the backend, it falls back to REST-only (if available).
