/**
 * Tasks Page — Full task management with filters
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

// ─── Status Badge ────────────────────────────────
function StatusBadge({ status, dueDate }) {
  const overdue = status !== 'Done' && isPast(new Date(dueDate));
  if (overdue) return <span className="badge badge-overdue">Overdue</span>;
  if (status === 'Done') return <span className="badge badge-done">Done</span>;
  if (status === 'In-Progress') return <span className="badge badge-progress">In Progress</span>;
  return <span className="badge badge-todo">Todo</span>;
}

// ─── Task Modal (Create / Edit) ───────────────────
function TaskModal({ task, projects, users, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Todo',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : today,
    project: task?.project?._id || task?.project || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.project) { setError('Project is required'); return; }
    if (!form.assignedTo) { setError('Assigned user is required'); return; }
    if (!form.dueDate) { setError('Due date is required'); return; }
    setLoading(true);
    try {
      if (task) {
        await api.put(`/tasks/${task._id}`, form);
      } else {
        await api.post('/tasks', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task title" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Task details..." />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Todo">Todo</option>
              <option value="In-Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date *</label>
          <input className="form-input" type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Project *</label>
          <select className="form-select" value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}>
            <option value="">Select project</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Assign To *</label>
          <select className="form-select" value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Select user</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Update Modal (for Members) ───────────
function StatusModal({ task, onClose, onSave }) {
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/tasks/${task._id}`, { status });
      onSave();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Update Status</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          {task.title}
        </p>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Todo">Todo</option>
            <option value="In-Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────
export default function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusTask, setStatusTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', project: '', assignedTo: '' });

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.project) params.append('project', filters.project);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);

      const [tasksRes, projRes] = await Promise.all([
        api.get(`/tasks?${params}`),
        api.get('/projects'),
      ]);
      setTasks(tasksRes.data.tasks);
      setProjects(projRes.data.projects);

      if (isAdmin) {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((t) => t.filter((task) => task._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditTask(null);
    setStatusTask(null);
    load();
  };

  const clearFilters = () => setFilters({ status: '', project: '', assignedTo: '' });

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            + New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="form-select" value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In-Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <select className="form-select" value={filters.project}
          onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        {isAdmin && (
          <select className="form-select" value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}>
            <option value="">All Users</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        )}

        {(filters.status || filters.project || filters.assignedTo) && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear Filters ✕</button>
        )}
      </div>

      {/* Task Table */}
      {tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◧</div>
            <p>{isAdmin ? 'No tasks found. Create one to get started.' : 'No tasks assigned to you yet.'}</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const overdue = task.status !== 'Done' && isPast(new Date(task.dueDate));
                  return (
                    <tr key={task._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {task.description.slice(0, 60)}{task.description.length > 60 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="tag">{task.project?.name || '—'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: `hsl(${(task.assignedTo?.name?.charCodeAt(0) * 37) % 360}, 65%, 50%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                          }}>{task.assignedTo?.name?.slice(0,2).toUpperCase()}</div>
                          <span style={{ fontSize: '0.875rem' }}>{task.assignedTo?.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 700,
                          color: task.priority === 'High' ? 'var(--danger)' : task.priority === 'Medium' ? 'var(--warning)' : 'var(--success)',
                        }}>
                          ● {task.priority}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: overdue ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={task.status} dueDate={task.dueDate} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {isAdmin ? (
                            <>
                              <button className="btn btn-sm btn-secondary"
                                onClick={() => { setEditTask(task); setShowModal(true); }}>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(task._id)}>
                                Delete
                              </button>
                            </>
                          ) : (
                            <button className="btn btn-sm btn-secondary"
                              onClick={() => setStatusTask(task)}>
                              Update
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Create/Edit Modal */}
      {showModal && isAdmin && (
        <TaskModal
          task={editTask}
          projects={projects}
          users={users}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}

      {/* Member Status Update Modal */}
      {statusTask && !isAdmin && (
        <StatusModal
          task={statusTask}
          onClose={() => setStatusTask(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
