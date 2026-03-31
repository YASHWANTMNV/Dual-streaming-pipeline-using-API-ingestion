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

export function useCryptoStream() {
    const [coins, setCoins] = useState({});         // { btc: {...}, eth: {...} }
    const [history, setHistory] = useState({});         // { btc: [{price,time},...] }
    const [stats, setStats] = useState(null);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [totalUpdates, setTotalUpdates] = useState(0);

    const historyRef = useRef({});

    // ── A. Fetch initial data via REST ─────────────────────────────────────────
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [latestRes, statsRes] = await Promise.all([
                    axios.get(`${API}/api/latest`),
                    axios.get(`${API}/api/stats`),
                ]);

                if (latestRes.data.success) {
                    const map = {};
                    latestRes.data.data.forEach(coin => { map[coin.coin_id] = coin; });
                    setCoins(map);
                }
                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
            } catch (err) {
                console.warn('REST initial load failed (pipeline may not have data yet):', err.message);
            }
        };
        fetchInitial();
    }, []);

    // ── B. Subscribe to WebSocket events ──────────────────────────────────────
    useEffect(() => {
        socket.on('connect', () => {
            console.log('🔌 WebSocket connected');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected');
            setConnected(false);
        });

        socket.on('connected', (msg) => {
            console.log('✅ Server welcome:', msg.message);
        });

        socket.on('crypto:update', (payload) => {
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
