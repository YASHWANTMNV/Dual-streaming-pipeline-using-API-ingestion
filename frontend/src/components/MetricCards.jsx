// src/components/MetricCards.jsx
import React from 'react';
import './MetricCards.css';

const fmt = (n) => {
    if (n == null || isNaN(n)) return '—';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${Number(n).toLocaleString()}`;
};

function MetricCards({ stats, totalUpdates, coinCount }) {
    const metrics = [
        {
            icon: '📦',
            iconClass: 'blue',
            label: 'Total DB Records',
            value: stats?.total_records ? Number(stats.total_records).toLocaleString() : '—',
            valueClass: 'blue',
            sub: 'Rows stored in MySQL',
        },
        {
            icon: '🔄',
            iconClass: 'cyan',
            label: 'Pipeline Updates',
            value: totalUpdates ? Number(totalUpdates).toLocaleString() : '—',
            valueClass: 'cyan',
            sub: 'WebSocket pushes received',
        },
        {
            icon: '🪙',
            iconClass: 'purple',
            label: 'Coins Tracked',
            value: coinCount ? Number(coinCount).toLocaleString() : '—',
            valueClass: 'purple',
            sub: 'Live market feeds',
        },
        {
            icon: '💹',
            iconClass: 'green',
            label: 'Total Volume',
            value: stats?.total_volume_usd ? fmt(stats.total_volume_usd) : '—',
            valueClass: 'green',
            sub: '24h aggregated (USD)',
        },
        {
            icon: '📊',
            iconClass: 'amber',
            label: 'Avg Price',
            value: stats?.avg_price_usd ? `$${Number(stats.avg_price_usd).toFixed(2)}` : '—',
            valueClass: 'amber',
            sub: 'Across all tracked coins',
        },
    ];

    return (
        <div className="metrics-section">
            <p className="metrics-title">Pipeline Overview</p>
            <div className="metrics-grid">
                {metrics.map((m, i) => (
                    <div key={i} className="card metric-card">
                        <div className={`metric-icon ${m.iconClass}`}>{m.icon}</div>
                        <div className="metric-body">
                            <div className="metric-label">{m.label}</div>
                            <div className={`metric-value ${m.valueClass}`}>{m.value}</div>
                            <div className="metric-sub">{m.sub}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default React.memo(MetricCards);
