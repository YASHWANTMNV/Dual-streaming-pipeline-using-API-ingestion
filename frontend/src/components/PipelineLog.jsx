// src/components/PipelineLog.jsx
// Live event log — shows the last N pipeline events as they arrive via WS
import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import './PipelineLog.css';

const MAX_LOG = 20;

function PipelineLog() {
    const [logs, setLogs] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        const handleUpdate = (payload) => {
            const entry = {
                id: Date.now(),
                time: new Date(payload.timestamp).toLocaleTimeString('en-US', { hour12: false }),
                count: payload.count,
                coins: payload.data.map(c => c.symbol).join(', '),
            };
            setLogs(prev => {
                const next = [entry, ...prev];
                return next.slice(0, MAX_LOG);
            });
        };

        socket.on('crypto:update', handleUpdate);
        return () => socket.off('crypto:update', handleUpdate);
    }, []);

    return (
        <div className="log-section">
            <div className="section-header">
                <span className="section-title">Pipeline Event Log</span>
                <span className="log-count">{logs.length} events</span>
            </div>
            <div className="log-card card">
                <div className="log-inner">
                    {logs.length === 0 ? (
                        <div className="log-empty">⏳ Waiting for pipeline events…</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={log.id} className={`log-row ${i === 0 ? 'log-row-new' : ''}`}>
                                <span className="log-time mono">{log.time}</span>
                                <span className="log-event">
                                    <span className="log-tag">WS</span> +DB
                                </span>
                                <span className="log-detail">
                                    Pushed <strong>{log.count}</strong> coins → <span className="log-coins">{log.coins}</span>
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
}

export default React.memo(PipelineLog);
