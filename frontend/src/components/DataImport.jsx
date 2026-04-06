// src/components/DataImport.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './DataImport.css';

const API_BASE = 'http://localhost:5000/api';

function DataImport() {
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Download Sample CSV
  const handleDownloadCSV = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE}/csv/sample?rows=200`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crypto-data-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setDownloadProgress(100);
      setTimeout(() => setDownloadProgress(0), 2000);
    } catch (err) {
      setError('Failed to download CSV: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Demo Data & Analytics
  const handleLoadDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE}/csv/demo`);
      setDemoData(response.data);
    } catch (err) {
      setError('Failed to load demo data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="data-import-section">
      {/* Header */}
      <div className="di-header">
        <h2 className="di-title">📊 Data Import & Analytics</h2>
        <p className="di-subtitle">Download sample crypto data, process it, and view insights</p>
      </div>

      {/* Action Buttons */}
      <div className="di-actions">
        <button 
          className="btn-primary"
          onClick={handleDownloadCSV}
          disabled={loading}
        >
          <span className="btn-icon">⬇️</span>
          Download Sample CSV
        </button>
        
        <button 
          className="btn-secondary"
          onClick={handleLoadDemo}
          disabled={loading}
        >
          <span className="btn-icon">🚀</span>
          Load Demo & Analyze
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="di-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="di-loading">
          <div className="spinner"></div>
          <p>Processing data...</p>
        </div>
      )}

      {/* Demo Data Display */}
      {demoData && !loading && (
        <div className="di-results">
          {/* Summary Stats */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Records</div>
              <div className="summary-value">{demoData.raw_records}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Unique Coins</div>
              <div className="summary-value">{demoData.analytics.summary.unique_coins}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Avg Price (USD)</div>
              <div className="summary-value">${demoData.analytics.summary.overall_avg_price}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Avg 24h Change</div>
              <div className={`summary-value ${parseFloat(demoData.analytics.summary.global_market_avg_change) >= 0 ? 'positive' : 'negative'}`}>
                {demoData.analytics.summary.global_market_avg_change}%
              </div>
            </div>
          </div>

          {/* Top Gainers & Losers */}
          <div className="gainers-losers-grid">
            <div className="gainers-card">
              <h3 className="card-title">🚀 Top Gainers</h3>
              <div className="gainers-list">
                {demoData.analytics.top_gainers.map((coin, idx) => (
                  <div key={idx} className="gainer-item">
                    <div className="gainer-header">
                      <span className="gainer-rank">#{idx + 1}</span>
                      <span className="gainer-name">{coin.symbol}</span>
                    </div>
                    <div className="gainer-change positive">
                      +{coin.avg_change_24h}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="losers-card">
              <h3 className="card-title">📉 Top Losers</h3>
              <div className="losers-list">
                {demoData.analytics.top_losers.map((coin, idx) => (
                  <div key={idx} className="loser-item">
                    <div className="loser-header">
                      <span className="loser-rank">#{idx + 1}</span>
                      <span className="loser-name">{coin.symbol}</span>
                    </div>
                    <div className="loser-change negative">
                      {coin.avg_change_24h}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Coin Stats Table */}
          <div className="coin-stats-section">
            <h3 className="section-title">📈 Coin Performance Metrics</h3>
            <div className="stats-table-wrap">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th>Symbol</th>
                    <th>Records</th>
                    <th>Avg Price</th>
                    <th>Min - Max</th>
                    <th>Volatility</th>
                    <th>Avg 24h Change</th>
                    <th>Total Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {demoData.analytics.coin_stats.map((coin, idx) => (
                    <tr key={idx}>
                      <td className="coin-name">{coin.coin_name}</td>
                      <td className="coin-symbol">{coin.symbol}</td>
                      <td className="records">{coin.records_count}</td>
                      <td className="price">${coin.avg_price}</td>
                      <td className="range">${coin.min_price} - ${coin.max_price}</td>
                      <td className={`volatility ${parseFloat(coin.price_volatility) > 5 ? 'high' : 'normal'}`}>
                        {coin.price_volatility}%
                      </td>
                      <td className={`change ${parseFloat(coin.avg_change_24h) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(coin.avg_change_24h) >= 0 ? '↑' : '↓'} {coin.avg_change_24h}%
                      </td>
                      <td className="volume">${parseFloat(coin.total_volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Data Preview */}
          <div className="raw-data-section">
            <h3 className="section-title">📋 Raw Data Preview (First 10 Records)</h3>
            <div className="raw-data-table-wrap">
              <table className="raw-data-table">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th>Price (USD)</th>
                    <th>24h Change</th>
                    <th>Market Cap</th>
                    <th>Volume</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {demoData.data.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      <td className="coin">{row.symbol}</td>
                      <td className="price">${row.current_price}</td>
                      <td className={`change ${parseFloat(row.price_change_pct_24h) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(row.price_change_pct_24h) >= 0 ? '+' : ''}{row.price_change_pct_24h}%
                      </td>
                      <td className="market-cap">${parseFloat(row.market_cap).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="volume">${parseFloat(row.total_volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="timestamp">{new Date(row.fetched_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!demoData && !loading && (
        <div className="di-empty">
          <div className="empty-icon">📁</div>
          <p className="empty-text">Click buttons above to download CSV or load demo data with analytics</p>
          <p className="empty-hint">Demo data includes: raw records, coin statistics, top gainers/losers, and market analytics</p>
        </div>
      )}
    </section>
  );
}

export default DataImport;
