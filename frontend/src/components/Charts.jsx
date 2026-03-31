// src/components/Charts.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Three chart panels using Recharts:
//   1. Market Cap Bar Chart — Compare market caps across all tracked coins
//   2. Price Sparklines     — Mini line chart for each coin using rolling history
//   3. Volume Pie Chart     — 24h volume distribution across coins
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import './Charts.css';

// Accent colors for pie/bar segments
const COLORS = [
    '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#a855f7',
];

const fmtB = (v) =>
    v >= 1e12 ? `${(v / 1e12).toFixed(1)}T`
        : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B`
            : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M`
                : String(v);

const fmtPrice = (p) =>
    p >= 1000 ? `$${(p / 1000).toFixed(1)}k` : `$${Number(p).toFixed(4)}`;

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: <strong>{fmtB(p.value)}</strong>
                </p>
            ))}
        </div>
    );
};

// ── 1. Market Cap Bar Chart ───────────────────────────────────────────────────
const MarketCapChartComponent = ({ coins }) => {
    const data = Object.values(coins)
        .sort((a, b) => b.market_cap - a.market_cap)
        .map(c => ({ name: c.symbol, value: c.market_cap }));

    if (!data.length) return <div className="chart-empty">Waiting for data…</div>;

    return (
        <div className="chart-card card">
            <div className="chart-header">
                <span className="chart-title">Market Cap Comparison</span>
                <span className="chart-sub">USD · Live</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#7aa8c7', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtB} tick={{ fill: '#7aa8c7', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                    <Bar dataKey="value" name="Market Cap" radius={[4, 4, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export const MarketCapChart = React.memo(MarketCapChartComponent);

// ── 2. Price Sparklines Grid ──────────────────────────────────────────────────
const SparklineGridComponent = ({ coins, history }) => {
    const coinList = Object.values(coins).slice(0, 6); // Top 6

    if (!coinList.length) return null;

    return (
        <div className="spark-grid">
            {coinList.map((coin, i) => {
                const points = (history[coin.coin_id] || []).map((h, j) => ({
                    t: j,
                    price: h.price,
                }));
                const trend = coin.trend;
                const lineColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#7aa8c7';

                return (
                    <div key={coin.coin_id} className="spark-card card" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="spark-header">
                            <div className="spark-coin">
                                {coin.image && <img src={coin.image} alt={coin.symbol} className="spark-img" />}
                                <div>
                                    <div className="spark-name">{coin.symbol}</div>
                                    <div className="spark-price">{fmtPrice(coin.current_price)}</div>
                                </div>
                            </div>
                            <span className={`change-badge ${trend}`}>
                                {coin.price_change_pct_24h >= 0 ? '+' : ''}{Number(coin.price_change_pct_24h).toFixed(2)}%
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={64}>
                            <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke={lineColor}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );
            })}
        </div>
    );
}

export const SparklineGrid = React.memo(SparklineGridComponent);

// ── 3. Volume Pie Chart ───────────────────────────────────────────────────────
const VolumeChartComponent = ({ coins }) => {
    const data = Object.values(coins)
        .filter(c => c.total_volume > 0)
        .sort((a, b) => b.total_volume - a.total_volume)
        .map(c => ({ name: c.symbol, value: c.total_volume }));

    if (!data.length) return <div className="chart-empty">Waiting for data…</div>;

    return (
        <div className="chart-card card">
            <div className="chart-header">
                <span className="chart-title">24h Volume Distribution</span>
                <span className="chart-sub">USD · Live</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        dataKey="value"
                        paddingAngle={3}
                    >
                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                        formatter={(v) => [`$${fmtB(v)}`, '24h Volume']}
                        contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,179,237,0.2)', borderRadius: '8px', color: '#e8f4fd', fontSize: '12px' }}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ color: '#7aa8c7', fontSize: '11px' }}>{v}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export const VolumeChart = React.memo(VolumeChartComponent);
