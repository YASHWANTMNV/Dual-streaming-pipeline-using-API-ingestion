import React, { useState } from 'react';

export default function Settings() {
    const [settings, setSettings] = useState({
        autoRefresh: true,
        refreshInterval: 5000,
        darkMode: true,
        notifications: true,
        dataRetention: 30,
        maxCoinDisplay: 25
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Settings</h1>
                <p>Application configuration and preferences</p>
            </div>

            <div className="settings-container">
                <div className="card">
                    <div className="card-header">
                        <h2>Display Settings</h2>
                    </div>
                    <div className="card-body">
                        <div className="settings-group">
                            <label className="setting-item">
                                <span className="setting-label">Dark Mode</span>
                                <input
                                    type="checkbox"
                                    name="darkMode"
                                    checked={settings.darkMode}
                                    onChange={handleChange}
                                />
                            </label>
                            <label className="setting-item">
                                <span className="setting-label">Maximum Coins to Display</span>
                                <input
                                    type="number"
                                    name="maxCoinDisplay"
                                    value={settings.maxCoinDisplay}
                                    onChange={handleChange}
                                    min="1"
                                    max="100"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Data Settings</h2>
                    </div>
                    <div className="card-body">
                        <div className="settings-group">
                            <label className="setting-item">
                                <span className="setting-label">Auto Refresh</span>
                                <input
                                    type="checkbox"
                                    name="autoRefresh"
                                    checked={settings.autoRefresh}
                                    onChange={handleChange}
                                />
                            </label>
                            <label className="setting-item">
                                <span className="setting-label">Refresh Interval (ms)</span>
                                <input
                                    type="number"
                                    name="refreshInterval"
                                    value={settings.refreshInterval}
                                    onChange={handleChange}
                                    min="1000"
                                    step="1000"
                                />
                            </label>
                            <label className="setting-item">
                                <span className="setting-label">Data Retention Days</span>
                                <input
                                    type="number"
                                    name="dataRetention"
                                    value={settings.dataRetention}
                                    onChange={handleChange}
                                    min="1"
                                    max="365"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Notifications</h2>
                    </div>
                    <div className="card-body">
                        <div className="settings-group">
                            <label className="setting-item">
                                <span className="setting-label">Enable Notifications</span>
                                <input
                                    type="checkbox"
                                    name="notifications"
                                    checked={settings.notifications}
                                    onChange={handleChange}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>System Information</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Version:</span>
                                <span>1.0.0</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Last Updated:</span>
                                <span>2024-01-15</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">API Version:</span>
                                <span>1.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button className="btn btn-primary" onClick={handleSave}>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
