import React, { useState } from 'react';

export default function AccessControl() {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Administrator', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Analyst', status: 'Active' },
    ]);

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Access Control</h1>
                <p>Manage user permissions and access roles</p>
            </div>

            <div className="access-control-container">
                <div className="card">
                    <div className="card-header">
                        <h2>User Management</h2>
                        <button className="btn btn-small btn-primary">Add User</button>
                    </div>
                    <div className="card-body">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td><span className="status-badge active">{user.status}</span></td>
                                        <td>
                                            <button className="btn-action edit">Edit</button>
                                            <button className="btn-action delete">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>User Roles & Permissions</h2>
                    </div>
                    <div className="card-body">
                        <div className="roles-grid">
                            <div className="role-card">
                                <h3>Administrator</h3>
                                <ul className="permissions-list">
                                    <li>✓ Full system access</li>
                                    <li>✓ Manage users</li>
                                    <li>✓ Configure pipeline</li>
                                    <li>✓ View all data</li>
                                    <li>✓ System settings</li>
                                </ul>
                            </div>
                            <div className="role-card">
                                <h3>Analyst</h3>
                                <ul className="permissions-list">
                                    <li>✓ View dashboard</li>
                                    <li>✓ Export data</li>
                                    <li>✗ Manage users</li>
                                    <li>✗ Configure pipeline</li>
                                    <li>✗ System settings</li>
                                </ul>
                            </div>
                            <div className="role-card">
                                <h3>Viewer</h3>
                                <ul className="permissions-list">
                                    <li>✓ View dashboard</li>
                                    <li>✗ Export data</li>
                                    <li>✗ Manage users</li>
                                    <li>✗ Configure pipeline</li>
                                    <li>✗ System settings</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Security Settings</h2>
                    </div>
                    <div className="card-body">
                        <div className="security-items">
                            <div className="security-item">
                                <span className="security-label">Two-Factor Authentication:</span>
                                <span className="security-status">Enabled</span>
                            </div>
                            <div className="security-item">
                                <span className="security-label">Session Timeout:</span>
                                <span className="security-status">30 minutes</span>
                            </div>
                            <div className="security-item">
                                <span className="security-label">Password Policy:</span>
                                <span className="security-status">Strong (8+ chars, numbers, special)</span>
                            </div>
                            <div className="security-item">
                                <span className="security-label">Last Security Audit:</span>
                                <span className="security-status">2024-01-10</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
