import React from 'react';

export default function RealTimeData({ coins, connected, lastUpdate, totalUpdates }) {

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Real-time Data</h1>
                <p>Live cryptocurrency data streaming</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Connection Status</h2>
                </div>
                <div className="card-body">
                    <div className="status-grid">
                        <div className="status-item">
                            <span className="status-label">Connection:</span>
                            <span className={`status-value ${connected ? 'connected' : 'disconnected'}`}>
                                {connected ? '🟢 Connected' : '🔴 Disconnected'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Last Update:</span>
                            <span className="status-value">{lastUpdate || 'Pending...'}</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Total Updates:</span>
                            <span className="status-value">{totalUpdates}</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Active Coins:</span>
                            <span className="status-value">{Object.keys(coins).length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Live Data Feed</h2>
                </div>
                <div className="card-body">
                    <div className="data-stream">
                        {Object.entries(coins).slice(0, 10).map(([symbol, data]) => (
                            <div key={symbol} className="data-item">
                                <div className="data-symbol">{symbol}</div>
                                <div className="data-price">${data.price?.toFixed(2)}</div>
                                <div className={`data-change ${data.change24h >= 0 ? 'positive' : 'negative'}`}>
                                    {data.change24h >= 0 ? '↑' : '↓'} {Math.abs(data.change24h).toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
