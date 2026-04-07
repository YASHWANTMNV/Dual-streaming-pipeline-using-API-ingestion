import React from 'react';
import MetricCards from '../components/MetricCards';
import { MarketCapChart, VolumeChart, SparklineGrid } from '../components/Charts';
import CoinTable from '../components/CoinTable';

export default function Overview({ coins, history, stats, connected, lastUpdate, totalUpdates }) {
    const coinCount = Object.keys(coins || {}).length;

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Overview</h1>
                <p>Real-time cryptocurrency market overview</p>
            </div>

            <MetricCards stats={stats} totalUpdates={totalUpdates} coinCount={coinCount} />

            <div className="charts-grid">
                <div className="chart-container">
                    <MarketCapChart data={history} />
                </div>
                <div className="chart-container">
                    <VolumeChart data={history} />
                </div>
            </div>

            <div className="table-section">
                <h2>Top Cryptocurrencies</h2>
                <CoinTable coins={coins} />
            </div>

            <SparklineGrid coins={coins} />
        </div>
    );
}
