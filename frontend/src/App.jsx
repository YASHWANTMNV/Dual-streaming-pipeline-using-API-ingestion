// src/App.jsx — Root Dashboard Component
import './App.css';
import { useCryptoStream } from './hooks/useCryptoStream';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import CoinTable from './components/CoinTable';
import { MarketCapChart, VolumeChart, SparklineGrid } from './components/Charts';
import PipelineLog from './components/PipelineLog';
import DataImport from './components/DataImport';

export default function App() {
    const { coins, history, stats, connected, lastUpdate, totalUpdates } = useCryptoStream();
    const coinCount = Object.keys(coins).length;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                <Header
                    coins={coins}
                    connected={connected}
                    lastUpdate={lastUpdate}
                    totalUpdates={totalUpdates}
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
