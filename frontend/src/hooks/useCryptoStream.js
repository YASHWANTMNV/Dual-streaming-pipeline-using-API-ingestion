// src/hooks/useCryptoStream.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom React hook that manages WebSocket subscription + REST initial load.
//
// Returns:
//   coins      — latest snapshot (one entry per coin, keyed by coin_id)
//   history    — last N updates as flat array (for sparkline charts)
//   stats      — pipeline stats from REST
//   connected  — WebSocket connection status
//   lastUpdate — ISO timestamp of latest server push
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const MAX_HISTORY = 50; // Keep last 50 data points per coin for sparklines

// Global request deduplication to prevent multiple simultaneous calls
let requestPromises = {};

export function useCryptoStream() {
    const [coins, setCoins] = useState({});         // { btc: {...}, eth: {...} }
    const [history, setHistory] = useState({});         // { btc: [{price,time},...] }
    const [stats, setStats] = useState(null);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [totalUpdates, setTotalUpdates] = useState(0);

    const historyRef = useRef({});
    const mounted = useRef(true);

    // ── A. Fetch initial data via REST (with deduplication) ──────────────────
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // Deduplicate: if request already in flight, reuse it
                const key = 'initial-load';
                
                if (!requestPromises[key]) {
                    requestPromises[key] = Promise.all([
                        axios.get(`${API}/api/latest`, { timeout: 5000 }),
                        axios.get(`${API}/api/stats`, { timeout: 5000 }),
                    ]);
                }

                const [latestRes, statsRes] = await requestPromises[key];

                // Only update if component is still mounted
                if (!mounted.current) return;

                if (latestRes.data.success) {
                    const map = {};
                    latestRes.data.data.forEach(coin => { map[coin.coin_id] = coin; });
                    setCoins(map);
                }
                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }

                // Clear promise after use
                delete requestPromises[key];
            } catch (err) {
                console.warn('REST initial load failed (pipeline may not have data yet):', err.message);
                // Clear promise on error
                delete requestPromises['initial-load'];
            }
        };
        fetchInitial();

        return () => {
            mounted.current = false;
        };
    }, []);

    // ── B. Subscribe to WebSocket events (main data source) ──────────────────
    useEffect(() => {
        socket.on('connect', () => {
            console.log('🔌 WebSocket connected - using real-time data');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected - falling back to cache');
            setConnected(false);
        });

        socket.on('connected', (msg) => {
            console.log('✅ Server welcome:', msg.message);
        });

        socket.on('crypto:update', (payload) => {
            if (!mounted.current) return;

            const { timestamp, data } = payload;

            setLastUpdate(timestamp);
            setTotalUpdates(prev => prev + 1);

            // Update latest coin snapshot (map by coin_id)
            setCoins(prev => {
                const updated = { ...prev };
                data.forEach(coin => { updated[coin.coin_id] = coin; });
                return updated;
            });

            // Maintain rolling history per coin for sparkline charts
            data.forEach(coin => {
                if (!historyRef.current[coin.coin_id]) {
                    historyRef.current[coin.coin_id] = [];
                }
                historyRef.current[coin.coin_id].push({
                    price: coin.current_price,
                    time: timestamp,
                });
                // Trim to last MAX_HISTORY entries
                if (historyRef.current[coin.coin_id].length > MAX_HISTORY) {
                    historyRef.current[coin.coin_id].shift();
                }
            });

            setHistory({ ...historyRef.current });
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connected');
            socket.off('crypto:update');
        };
    }, []);

    return { coins, history, stats, connected, lastUpdate, totalUpdates };
}
