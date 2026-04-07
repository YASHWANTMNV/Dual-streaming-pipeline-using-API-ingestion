import React from 'react';

export default function WebSocketStream() {
    return (
        <div className="page-content">
            <div className="page-header">
                <h1>WebSocket Stream</h1>
                <p>Real-time WebSocket data streaming pipeline</p>
            </div>

            <div className="pipeline-section">
                <div className="card">
                    <div className="card-header">
                        <h2>WebSocket Configuration</h2>
                    </div>
                    <div className="card-body">
                        <div className="config-grid">
                            <div className="config-item">
                                <span className="config-label">Server URL:</span>
                                <span className="config-value">ws://localhost:3000</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">Protocol:</span>
                                <span className="config-value">Socket.IO</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">Reconnect Time:</span>
                                <span className="config-value">Auto</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">Message Format:</span>
                                <span className="config-value">JSON</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Stream Performance</h2>
                    </div>
                    <div className="card-body">
                        <div className="metrics">
                            <div className="metric">
                                <span className="metric-label">Messages/sec:</span>
                                <span className="metric-value">~150</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Avg Latency:</span>
                                <span className="metric-value">&lt;50ms</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Packet Loss:</span>
                                <span className="metric-value">0%</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Bandwidth Usage:</span>
                                <span className="metric-value">~2.5 MB/min</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Active Connections</h2>
                    </div>
                    <div className="card-body">
                        <div className="connection-status">
                            <div className="status-indicator connected">●</div>
                            <span>Connected clients: 1</span>
                        </div>
                        <div className="connection-log">
                            <p>✓ WebSocket client connected</p>
                            <p>✓ Initial handshake completed</p>
                            <p>✓ Streaming crypto data in real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
