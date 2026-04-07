// src/App.jsx — Root Dashboard Component with Authentication & Routing
import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCryptoStream } from './hooks/useCryptoStream';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
// Import all page components
import Overview from './pages/Overview';
import RealTimeData from './pages/RealTimeData';
import MarketTrends from './pages/MarketTrends';
import WebSocketStream from './pages/WebSocketStream';
import MySQLStorage from './pages/MySQLStorage';
import Settings from './pages/Settings';
import AccessControl from './pages/AccessControl';
import DatasetManagement from './pages/DatasetManagement';

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
        <Router>
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
                            <Routes>
                                {/* DASHBOARDS Section */}
                                <Route path="/" element={
                                    <Overview coins={coins} history={history} stats={stats} connected={connected} lastUpdate={lastUpdate} totalUpdates={totalUpdates} />
                                } />
                                <Route path="/overview" element={
                                    <Overview coins={coins} history={history} stats={stats} connected={connected} lastUpdate={lastUpdate} totalUpdates={totalUpdates} />
                                } />
                                <Route path="/real-time-data" element={
                                    <RealTimeData coins={coins} connected={connected} lastUpdate={lastUpdate} totalUpdates={totalUpdates} />
                                } />
                                <Route path="/market-trends" element={
                                    <MarketTrends coins={coins} history={history} stats={stats} />
                                } />

                                {/* PIPELINE Section */}
                                <Route path="/websocket-stream" element={<WebSocketStream />} />
                                <Route path="/mysql-storage" element={<MySQLStorage />} />
                                <Route path="/dataset-management" element={<DatasetManagement />} />

                                {/* MANAGEMENT Section */}
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/access-control" element={<AccessControl />} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </div>
        </Router>
    );
}

