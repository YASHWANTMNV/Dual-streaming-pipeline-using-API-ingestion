// src/App.jsx — Root Dashboard Component with Authentication
import './App.css';
import { useState, useEffect } from 'react';
import { useCryptoStream } from './hooks/useCryptoStream';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import CoinTable from './components/CoinTable';
import { MarketCapChart, VolumeChart, SparklineGrid } from './components/Charts';
import PipelineLog from './components/PipelineLog';
import DataImport from './components/DataImport';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const { coins, history, stats, connected, lastUpdate, totalUpdates } = useCryptoStream();
    const coinCount = Object.keys(coins).length;

    // Check if user is already authenticated on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
        
        setLoading(false);
    }, []);

    const handleLoginSuccess = (data) => {
        setUser(data.user);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div className="app-loading">
                <div className="loader">
                    <div className="spinner"></div>
                    <p>Loading CryptoFlow...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="app-layout">
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="app-main">
                <Header
                    coins={coins}
                    connected={connected}
                    lastUpdate={lastUpdate}
                    totalUpdates={totalUpdates}
                    user={user}
                    onLogout={handleLogout}
                />

                <main className="main">
                    <div className="container">

                        {/* ── Pipeline Hero Banner ── */}
                        <div className="hero-banner">
                            <div className="hero-text">
                                <h1 className="hero-title">
                                    Dual Streaming Pipeline
                                    <span className="hero-accent"> · Real-Time</span>
                                </h1>
                                <p className="hero-desc">
                                    Live crypto data ingested from <strong>CoinGecko API</strong> →
                                    processed → streamed simultaneously to <strong>MySQL</strong> and
                                    <strong> WebSocket</strong> clients with zero sequential delay.
                                </p>
                            </div>
                            <div className="hero-flow">
                                <div className="flow-node api">CoinGecko<br /><span>API</span></div>
                                <div className="flow-arrow">→</div>
                                <div className="flow-node proc">Data<br /><span>Processor</span></div>
                                <div className="flow-arrow">→</div>
                                <div className="flow-split">
                                    <div className="flow-node db">MySQL<br /><span>DB Stream</span></div>
                                    <div className="flow-node ws">WebSocket<br /><span>WS Stream</span></div>
                                </div>
                            </div>
                        </div>

                        {/* ── Section 1: Metric Cards ── */}
                        <MetricCards stats={stats} totalUpdates={totalUpdates} coinCount={coinCount} />

                        {/* ── Section 2: Sparklines ── */}
                        {coinCount > 0 && (
                            <div className="spark-section">
                                <p className="spark-section-title">Price Sparklines (rolling history)</p>
                                <SparklineGrid coins={coins} history={history} />
                            </div>
                        )}

                        {/* ── Section 3: Charts Row ── */}
                        <div className="charts-row">
                            <MarketCapChart coins={coins} />
                            <VolumeChart coins={coins} />
                        </div>

                        {/* ── Section 4: Live Table ── */}
                        <CoinTable coins={coins} />

                        {/* ── Section 5: Data Import & Analytics ── */}
                        <DataImport />

                        {/* ── Section 6: Pipeline Log ── */}
                        <PipelineLog />

                    </div>
                </main>
            </div>
        </div>
    );
}
}
