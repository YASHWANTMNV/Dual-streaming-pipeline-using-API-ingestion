import React from 'react';
import { MarketCapChart, VolumeChart } from '../components/Charts';

export default function MarketTrends({ coins, history, stats }) {

    const topGainers = Object.entries(coins)
        .sort((a, b) => (b[1].change24h || 0) - (a[1].change24h || 0))
        .slice(0, 5);

    const topLosers = Object.entries(coins)
        .sort((a, b) => (a[1].change24h || 0) - (b[1].change24h || 0))
        .slice(0, 5);

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Market Trends</h1>
                <p>Market analysis and trend indicators</p>
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <MarketCapChart data={history} />
                </div>
                <div className="chart-container">
                    <VolumeChart data={history} />
                </div>
            </div>

            <div className="trends-grid">
                <div className="card">
                    <div className="card-header">
                        <h2>Top Gainers (24h)</h2>
                    </div>
                    <div className="card-body">
                        <div className="trends-list">
                            {topGainers.map(([symbol, data]) => (
                                <div key={symbol} className="trend-item positive">
                                    <span className="trend-symbol">{symbol}</span>
                                    <span className="trend-change">+{(data.change24h || 0).toFixed(2)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Top Losers (24h)</h2>
                    </div>
                    <div className="card-body">
                        <div className="trends-list">
                            {topLosers.map(([symbol, data]) => (
                                <div key={symbol} className="trend-item negative">
                                    <span className="trend-symbol">{symbol}</span>
                                    <span className="trend-change">{(data.change24h || 0).toFixed(2)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Market Statistics</h2>
                </div>
                <div className="card-body">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Total Market Cap</span>
                            <span className="stat-value">${(stats?.totalMarketCap || 0).toFixed(0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">24h Volume</span>
                            <span className="stat-value">${(stats?.volume24h || 0).toFixed(0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">BTC Dominance</span>
                            <span className="stat-value">{(stats?.btcDominance || 0).toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
