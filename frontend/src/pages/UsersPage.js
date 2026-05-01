/**
 * Users Page — Admin-only user management
 */

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((u) => u.filter((usr) => usr._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/users/${userId}`, { role: newRole });
      setUsers((u) => u.map((usr) => usr._id === userId ? res.data.user : usr));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `hsl(${(user.name.charCodeAt(0) * 37) % 360}, 65%, 50%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td>
                    <select
                      className="form-select"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">📊 Role Summary</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>
              {users.filter((u) => u.role === 'ADMIN').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admins</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--info)' }}>
              {users.filter((u) => u.role === 'MEMBER').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Members</div>
          </div>
        </div>
      </div>
    </div>
  );
}
