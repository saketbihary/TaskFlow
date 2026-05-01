/**
 * Projects Page — List and manage projects
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

function ProjectModal({ project, users, onClose, onSave }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Active',
    members: project?.members?.map((m) => m._id) || [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMember = (userId) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter((id) => id !== userId)
        : [...f.members, userId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setLoading(true);
    try {
      if (project) {
        await api.put(`/projects/${project._id}`, form);
      } else {
        await api.post('/projects', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{project ? 'Edit Project' : 'New Project'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input className="form-input" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Website Redesign" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the project..." />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Active</option>
            <option>On Hold</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Team Members</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
            {users.filter(u => u.role !== 'ADMIN').map((u) => (
              <label key={u._id} style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '8px 12px', borderRadius: 'var(--radius)',
                background: form.members.includes(u._id) ? 'var(--accent-light)' : 'var(--bg-primary)',
                border: `1px solid ${form.members.includes(u._id) ? 'rgba(108,99,255,0.3)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <input type="checkbox" checked={form.members.includes(u._id)}
                  onChange={() => toggleMember(u._id)} style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{u.email}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const load = useCallback(async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: { users: [] } }),
      ]);
      setProjects(projRes.data.projects);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((p) => p.filter((proj) => proj._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openEdit = (proj) => { setEditProject(proj); setShowModal(true); };
  const openCreate = () => { setEditProject(null); setShowModal(true); };
  const handleSave = () => { setShowModal(false); load(); };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <p>{isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map((proj) => (
            <div key={proj._id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                  borderRadius: 4,
                  background: proj.status === 'Active' ? 'var(--success-bg)' : proj.status === 'Completed' ? 'var(--accent-light)' : 'var(--warning-bg)',
                  color: proj.status === 'Active' ? 'var(--success)' : proj.status === 'Completed' ? 'var(--accent)' : 'var(--warning)',
                }}>
                  {proj.status}
                </span>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(proj)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(proj._id)}>Delete</button>
                  </div>
                )}
              </div>
              <Link to={`/projects/${proj._id}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {proj.name}
                </h3>
              </Link>
              {proj.description && (
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  {proj.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                <span>👥 {proj.members?.length} member{proj.members?.length !== 1 ? 's' : ''}</span>
                <span>📅 {format(new Date(proj.createdAt), 'MMM d, yyyy')}</span>
              </div>
              {proj.members?.length > 0 && (
                <div style={{ display: 'flex', gap: -6 }}>
                  {proj.members.slice(0, 5).map((m, i) => (
                    <div key={m._id} title={m.name} style={{
                      width: 28, height: 28,
                      borderRadius: '50%', background: `hsl(${(m.name.charCodeAt(0) * 37) % 360}, 65%, 50%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                      border: '2px solid var(--bg-card)',
                      marginLeft: i > 0 ? -8 : 0,
                    }}>
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {proj.members.length > 5 && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--bg-hover)', border: '2px solid var(--bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: -8,
                    }}>+{proj.members.length - 5}</div>
                  )}
                </div>
              )}
              <Link to={`/projects/${proj._id}`} className="btn btn-secondary btn-sm"
                style={{ marginTop: 14, justifyContent: 'center' }}>
                View Project →
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          users={users}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
