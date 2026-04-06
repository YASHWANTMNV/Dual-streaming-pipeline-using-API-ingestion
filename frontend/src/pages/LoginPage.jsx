// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';

export default function LoginPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/auth/login', {
                username,
                password,
            });

            if (response.data.success) {
                // Store token in localStorage
                localStorage.setItem('authToken', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                
                // Callback to parent component
                onLoginSuccess(response.data.data);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMsg);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setUsername('admin');
        setPassword('admin123');
        // Auto-submit after state update
        setTimeout(() => {
            document.getElementById('loginForm').dispatchEvent(
                new Event('submit', { bubbles: true })
            );
        }, 0);
    };

    return (
        <div className="login-page">
            {/* Left side - Branding */}
            <div className="login-branding">
                <div className="branding-content">
                    <div className="logo-circle">
                        <span className="logo-icon">📊</span>
                    </div>
                    <h1 className="brand-title">CryptoFlow</h1>
                    <p className="brand-subtitle">Real-time Cryptocurrency Data Pipeline</p>
                    
                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <span className="feature-text">Live Data Streaming</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🔄</span>
                            <span className="feature-text">Dual Pipeline</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">📈</span>
                            <span className="feature-text">Real-time Analytics</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🔐</span>
                            <span className="feature-text">Secure & Reliable</span>
                        </div>
                    </div>

                    <div className="branding-footer">
                        <p>Monitoring cryptocurrency prices across multiple exchanges</p>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}

                    <form id="loginForm" className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    id="username"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-wrapper password-wrapper">
                                <span className="input-icon">🔐</span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <button
                        className="demo-button"
                        onClick={handleDemoLogin}
                        disabled={loading}
                    >
                        <span className="demo-icon">🚀</span>
                        Try Demo Login
                    </button>

                    <div className="login-footer">
                        <p className="footer-text">
                            Demo credentials: <code>admin</code> / <code>admin123</code>
                        </p>
                        <p className="footer-note">
                            Change default credentials in production environment
                        </p>
                    </div>
                </div>

                <div className="login-support">
                    <p>🔒 Secure authentication • No data stored • Session-based access</p>
                </div>
            </div>
        </div>
    );
}
