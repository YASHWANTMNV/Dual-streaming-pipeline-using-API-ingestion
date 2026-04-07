import React from 'react';

export default function MySQLStorage() {
    return (
        <div className="page-content">
            <div className="page-header">
                <h1>MySQL Storage</h1>
                <p>Database streaming and storage pipeline</p>
            </div>

            <div className="pipeline-section">
                <div className="card">
                    <div className="card-header">
                        <h2>Database Connection</h2>
                    </div>
                    <div className="card-body">
                        <div className="config-grid">
                            <div className="config-item">
                                <span className="config-label">Host:</span>
                                <span className="config-value">localhost</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">Port:</span>
                                <span className="config-value">3306</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">Database:</span>
                                <span className="config-value">crypto_stream</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">Status:</span>
                                <span className="config-value connected">✓ Connected</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Storage Statistics</h2>
                    </div>
                    <div className="card-body">
                        <div className="metrics">
                            <div className="metric">
                                <span className="metric-label">Total Records:</span>
                                <span className="metric-value">~50,000+</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Inserts/sec:</span>
                                <span className="metric-value">~50</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Database Size:</span>
                                <span className="metric-value">~150 MB</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Query Time:</span>
                                <span className="metric-value">&lt;100ms</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Tables Information</h2>
                    </div>
                    <div className="card-body">
                        <table className="info-table">
                            <thead>
                                <tr>
                                    <th>Table Name</th>
                                    <th>Records</th>
                                    <th>Last Updated</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>crypto_prices</td>
                                    <td>45,000</td>
                                    <td>Just now</td>
                                    <td>✓ Active</td>
                                </tr>
                                <tr>
                                    <td>market_data</td>
                                    <td>5,000</td>
                                    <td>Just now</td>
                                    <td>✓ Active</td>
                                </tr>
                                <tr>
                                    <td>historical_data</td>
                                    <td>10,000</td>
                                    <td>1 min ago</td>
                                    <td>✓ Active</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
