// src/components/Header.jsx
import React from 'react';
import './Header.css';

const fmtPrice = (p) =>
    p >= 1000 ? `$${Number(p).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        : p >= 1 ? `$${Number(p).toFixed(4)}`
            : `$${Number(p).toFixed(6)}`;

function Header({ coins, connected, lastUpdate, totalUpdates }) {
    const coinList = Object.values(coins);
    const doubled = [...coinList, ...coinList]; // Duplicate for seamless loop

    const timeStr = lastUpdate
        ? new Date(lastUpdate).toLocaleTimeString('en-US', { hour12: false })
        : '—';

    return (
        <header className="header">
            <div className="header-inner">
                {/* Search Bar / Breadcrumbs */}
                <div className="header-nav">
                    <span className="breadcrumb">Dashboards</span>
                    <span className="breadcrumb-div">/</span>
                    <span className="breadcrumb active">Overview</span>
                </div>
                
                <div className="header-search">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search resources, services, and docs..." className="search-input" />
                </div>

                {/* Status & Meta */}
                <div className="header-right">
                    <div className={`status-badge ${connected ? 'online' : 'offline'}`}>
                        <span className={`pulse-dot ${connected ? '' : 'offline'}`} />
                        {connected ? 'Connected' : 'Reconnecting…'}
                    </div>

                    <div className="header-meta">
                        <div className="header-meta-item">
                            <span className="header-meta-label">Updated at</span>
                            <span className="header-meta-value">{timeStr}</span>
                        </div>
                        <div className="header-meta-item">
                            <span className="header-meta-label">Total Pushes</span>
                            <span className="header-meta-value">{totalUpdates.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticker Banner - Always helpful for crypto streams */}
            {coinList.length > 0 && (
                <div className="ticker-wrapper">
                    <div className="ticker-track">
                        {doubled.map((coin, i) => (
                            <span key={`${coin.coin_id}-${i}`} className="ticker-item">
                                <span className="ticker-symbol">{coin.symbol}</span>
                                <span className="ticker-price">{fmtPrice(coin.current_price)}</span>
                                <span className={`ticker-change ${coin.trend === 'up' ? 'text-up' : coin.trend === 'down' ? 'text-down' : 'text-neutral'}`}>
                                    {coin.price_change_pct_24h >= 0 ? '+' : ''}{Number(coin.price_change_pct_24h).toFixed(2)}%
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}

export default React.memo(Header);
