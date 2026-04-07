import React, { useRef, useEffect, useState } from 'react';
import './CoinTable.css';

const fmtPrice = (p) => {
    if (p == null) return '—';
    if (p >= 1000) return `$${Number(p).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${Number(p).toFixed(4)}`;
    return `$${Number(p).toFixed(6)}`;
};

const fmtBig = (n) => {
    if (n == null || n === 0) return '—';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${Number(n).toLocaleString()}`;
};

function RangeBar({ low, high, current }) {
    const range = high - low;
    const pct = range > 0 ? Math.min(100, ((current - low) / range) * 100) : 50;
    return (
        <div className="range-wrap">
            <div className="range-bar-outer">
                <div className="range-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="range-text">{fmtPrice(low)} — {fmtPrice(high)}</span>
        </div>
    );
}

function CoinTable({ coins }) {
    if (!coins || typeof coins !== 'object' || Object.keys(coins).length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#7aa8c7' }}>⏳ Waiting for coin data…</div>;
    }
    
    const coinList = Object.values(coins).sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
    const prevPrices = useRef({});
    const [flashIds, setFlashIds] = useState(new Set());

    // Detect price changes and trigger flash animation
    useEffect(() => {
        const changed = new Set();
        coinList.forEach(coin => {
            const prev = prevPrices.current[coin.coin_id];
            if (prev !== undefined && prev !== coin.current_price) {
                changed.add(coin.coin_id);
            }
            prevPrices.current[coin.coin_id] = coin.current_price;
        });

        if (changed.size > 0) {
            setFlashIds(changed);
            const t = setTimeout(() => setFlashIds(new Set()), 700);
            return () => clearTimeout(t);
        }
    }, [coins]);

    if (coinList.length === 0) {
        return (
            <div className="table-section">
                <div className="section-header">
                    <span className="section-title">Live Market Data</span>
                </div>
                <div className="table-wrap" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    ⏳ Waiting for first pipeline cycle…
                </div>
            </div>
        );
    }

    return (
        <div className="table-section">
            <div className="section-header">
                <span className="section-title">Live Market Data</span>
                <span className="live-badge">
                    <span className="pulse-dot" /> Streaming via WebSocket
                </span>
            </div>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Coin</th>
                            <th className="right">Price (USD)</th>
                            <th className="right">24h Change</th>
                            <th className="right">Market Cap</th>
                            <th className="right">24h Volume</th>
                            <th className="right">24h Range</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coinList.map((coin, idx) => {
                            const pct = Number(coin.price_change_pct_24h);
                            const trend = coin.trend || (pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'neutral');
                            const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●';

                            return (
                                <tr key={coin.coin_id} className={flashIds.has(coin.coin_id) ? 'flash' : ''}>
                                    <td><span className="rank">{idx + 1}</span></td>
                                    <td>
                                        <div className="coin-cell">
                                            {coin.image
                                                ? <img src={coin.image} alt={coin.coin_name} className="coin-img" />
                                                : <div className="coin-img" style={{ background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white' }}>
                                                    {coin.symbol?.charAt(0)}
                                                </div>
                                            }
                                            <div>
                                                <div className="coin-name">{coin.coin_name}</div>
                                                <div className="coin-symbol">{coin.symbol}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="right"><span className="price">{fmtPrice(coin.current_price)}</span></td>
                                    <td className="right">
                                        <span className={`change-pill ${trend}`}>
                                            {arrow} {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="right"><span className="big-num">{fmtBig(coin.market_cap)}</span></td>
                                    <td className="right"><span className="big-num">{fmtBig(coin.total_volume)}</span></td>
                                    <td className="right">
                                        <RangeBar low={coin.low_24h} high={coin.high_24h} current={coin.current_price} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default React.memo(CoinTable);
