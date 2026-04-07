import React, { useState } from 'react';
import './DatasetManagement.css';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export default function DatasetManagement() {
    const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState(null);
    const [datasetInfo, setDatasetInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Sample dataset
    const sampleDataset = {
        name: 'Cryptocurrency Market Data - April 2026',
        records: 1250,
        coins: 15,
        dateRange: '2026-04-01 to 2026-04-07',
        columns: [
            'coin_id',
            'coin_name',
            'symbol',
            'current_price',
            'price_change_pct_24h',
            'market_cap',
            'total_volume',
            'fetched_at',
        ],
        preview: [
            { coin: 'Bitcoin', symbol: 'BTC', price: 42850.50, change: 2.5, volume: '28.5B' },
            { coin: 'Ethereum', symbol: 'ETH', price: 2298.75, change: 1.8, volume: '12.3B' },
            { coin: 'Solana', symbol: 'SOL', price: 98.25, change: 5.2, volume: '850M' },
            { coin: 'Cardano', symbol: 'ADA', price: 0.65, change: -1.5, volume: '340M' },
            { coin: 'Polkadot', symbol: 'DOT', price: 7.45, change: 3.1, volume: '210M' },
        ],
    };

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('apiKey', apiKey);
            setMessage({ type: 'success', text: 'API key saved successfully' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: 'error', text: 'Please enter a valid API key' });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            setMessage({ type: 'error', text: 'Please upload a CSV file' });
            return;
        }

        setUploadFile(file);
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE}/api/dataset/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            if (response.data.success) {
                setDatasetInfo(response.data.data);
                setMessage({ type: 'success', text: 'Dataset uploaded successfully' });
                setUploadFile(null);
                setUploadProgress(0);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Upload failed. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSample = () => {
        const headers = sampleDataset.columns.join(',');
        const rows = sampleDataset.preview.map(r =>
            `${r.coin},${r.coin},${r.symbol},${r.price},${r.change},${r.price * 1e9},${r.volume},2026-04-07T12:00:00Z`
        );
        const csv = [headers, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample-crypto-data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="dataset-page">
            <div className="page-header">
                <div>
                    <h1>Dataset Management</h1>
                    <p>Upload cryptocurrency data, manage API connections, and control data operations</p>
                </div>
            </div>

            {message && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="dataset-grid">
                {/* API Key Management */}
                <div className="card">
                    <div className="card-header">
                        <h2>API Key Configuration</h2>
                        <p>Connect external data sources and APIs</p>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>CoinGecko API Key (Optional)</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste your API key here"
                                className="input"
                            />
                            <small>Get your free key at coingecko.com/api</small>
                        </div>
                        <button onClick={handleSaveApiKey} className="btn btn-primary">
                            Save API Key
                        </button>
                    </div>
                </div>

                {/* Sample Dataset */}
                <div className="card">
                    <div className="card-header">
                        <h2>Sample Dataset</h2>
                        <p>Pre-configured cryptocurrency market data</p>
                    </div>
                    <div className="card-body">
                        <div className="dataset-meta">
                            <div className="meta-item">
                                <span className="label">Dataset Name</span>
                                <span className="value">{sampleDataset.name}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Records</span>
                                <span className="value">{sampleDataset.records}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Coins Tracked</span>
                                <span className="value">{sampleDataset.coins}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Date Range</span>
                                <span className="value">{sampleDataset.dateRange}</span>
                            </div>
                        </div>
                        <div className="columns-info">
                            <strong>CSV Columns:</strong>
                            <div className="columns-list">
                                {sampleDataset.columns.map((col, i) => (
                                    <span key={i} className="column-tag">{col}</span>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleDownloadSample} className="btn btn-secondary">
                            Download Sample CSV
                        </button>
                    </div>
                </div>

                {/* File Upload */}
                <div className="card">
                    <div className="card-header">
                        <h2>Upload Dataset</h2>
                        <p>Import CSV files to analyze and process</p>
                    </div>
                    <div className="card-body">
                        <div className="upload-area">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                disabled={loading}
                                className="file-input"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="upload-label">
                                <div className="upload-content">
                                    <div className="upload-icon">+</div>
                                    <div>
                                        <p className="upload-title">Click to upload or drag and drop</p>
                                        <p className="upload-subtitle">CSV files up to 100MB</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {uploadProgress > 0 && (
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                >
                                    {uploadProgress}%
                                </div>
                            </div>
                        )}

                        {uploadFile && (
                            <div className="file-info">
                                <span>File: {uploadFile.name}</span>
                                <span>Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Dataset Info */}
                {datasetInfo && (
                    <div className="card">
                        <div className="card-header">
                            <h2>Active Dataset</h2>
                            <p>Currently loaded dataset information</p>
                        </div>
                        <div className="card-body">
                            <div className="dataset-meta">
                                <div className="meta-item">
                                    <span className="label">Records</span>
                                    <span className="value">{datasetInfo.recordCount}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Columns</span>
                                    <span className="value">{datasetInfo.columnCount}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Uploaded</span>
                                    <span className="value">{new Date(datasetInfo.uploadedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sample Data Preview */}
            <div className="card">
                <div className="card-header">
                    <h2>Sample Data Preview</h2>
                    <p>First 5 records from the dataset</p>
                </div>
                <div className="card-body overflow-x">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Coin</th>
                                <th>Symbol</th>
                                <th>Price (USD)</th>
                                <th>24h Change (%)</th>
                                <th>Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleDataset.preview.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.coin}</td>
                                    <td className="symbol">{row.symbol}</td>
                                    <td className="number">${row.price.toLocaleString()}</td>
                                    <td className={`number ${row.change > 0 ? 'positive' : 'negative'}`}>
                                        {row.change > 0 ? '+' : ''}{row.change}%
                                    </td>
                                    <td className="number">{row.volume}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
