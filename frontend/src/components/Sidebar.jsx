import React from 'react';
import './Sidebar.css';

function Sidebar() {
    return (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <span className="brand-logo">☁️</span>
                <span className="brand-name">CloudStream Enterprise</span>
            </div>
            
            <nav className="sidebar-nav">
                <div className="nav-group">
                    <span className="nav-group-title">DASHBOARDS</span>
                    <a href="#" className="nav-item active">
                        <span className="nav-icon">📊</span>
                        Overview
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">📈</span>
                        Real-time Data
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">🌍</span>
                        Market Trends
                    </a>
                </div>

                <div className="nav-group">
                    <span className="nav-group-title">PIPELINE</span>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">⚡</span>
                        WebSocket Stream
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">🗄️</span>
                        MySQL Storage
                    </a>
                </div>

                <div className="nav-group">
                    <span className="nav-group-title">MANAGEMENT</span>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        Settings
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">👥</span>
                        Access Control
                    </a>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">JD</div>
                    <div className="user-info">
                        <div className="user-name">John Doe</div>
                        <div className="user-role">Administrator</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default React.memo(Sidebar);
