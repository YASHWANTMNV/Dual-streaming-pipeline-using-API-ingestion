import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user, onLogout }) {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <span className="brand-logo">☁️</span>
                <span className="brand-name">CloudStream Enterprise</span>
            </div>
            
            <nav className="sidebar-nav">
                <div className="nav-group">
                    <span className="nav-group-title">DASHBOARDS</span>
                    <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                        <span className="nav-icon">📊</span>
                        Overview
                    </Link>
                    <Link to="/real-time-data" className={`nav-item ${isActive('/real-time-data') ? 'active' : ''}`}>
                        <span className="nav-icon">📈</span>
                        Real-time Data
                    </Link>
                    <Link to="/market-trends" className={`nav-item ${isActive('/market-trends') ? 'active' : ''}`}>
                        <span className="nav-icon">🌍</span>
                        Market Trends
                    </Link>
                </div>

                <div className="nav-group">
                    <span className="nav-group-title">PIPELINE</span>
                    <Link to="/websocket-stream" className={`nav-item ${isActive('/websocket-stream') ? 'active' : ''}`}>
                        <span className="nav-icon">⚡</span>
                        WebSocket Stream
                    </Link>
                    <Link to="/mysql-storage" className={`nav-item ${isActive('/mysql-storage') ? 'active' : ''}`}>
                        <span className="nav-icon">🗄️</span>
                        MySQL Storage
                    </Link>
                </div>

                <div className="nav-group">
                    <span className="nav-group-title">MANAGEMENT</span>
                    <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                        <span className="nav-icon">⚙️</span>
                        Settings
                    </Link>
                    <Link to="/access-control" className={`nav-item ${isActive('/access-control') ? 'active' : ''}`}>
                        <span className="nav-icon">👥</span>
                        Access Control
                    </Link>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">{user?.name?.substring(0, 2).toUpperCase() || 'JD'}</div>
                    <div className="user-info">
                        <div className="user-name">{user?.name || 'User'}</div>
                        <div className="user-role">{user?.role || 'Administrator'}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={onLogout} title="Logout">
                    🚪
                </button>
            </div>
        </aside>
    );
}

export default React.memo(Sidebar);
