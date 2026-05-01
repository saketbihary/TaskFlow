/**
 * Project Detail Page
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

function StatusBadge({ status, dueDate }) {
  const overdue = status !== 'Done' && isPast(new Date(dueDate));
  if (overdue) return <span className="badge badge-overdue">Overdue</span>;
  if (status === 'Done') return <span className="badge badge-done">Done</span>;
  if (status === 'In-Progress') return <span className="badge badge-progress">In Progress</span>;
  return <span className="badge badge-todo">Todo</span>;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?project=${id}`),
        ]);
        setProject(projRes.data.project);
        setTasks(tasksRes.data.tasks);
        if (isAdmin) {
          const usersRes = await api.get('/users');
          setAllUsers(usersRes.data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAdmin]);

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data.project);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const addMember = async (userId) => {
    try {
      const res = await api.post(`/projects/${id}/members`, { userId });
      setProject(res.data.project);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!project) return <div className="card"><p>Project not found.</p></div>;

  const memberIds = project.members.map((m) => m._id);
  const nonMembers = allUsers.filter((u) => !memberIds.includes(u._id) && u.role !== 'ADMIN');

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="page-header">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <Link to="/projects" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Projects</Link> / {project.name}
          </div>
          <div className="page-title">{project.name}</div>
          {project.description && (
            <div className="page-subtitle">{project.description}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            padding: '5px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
            background: project.status === 'Active' ? 'var(--success-bg)' : 'var(--warning-bg)',
            color: project.status === 'Active' ? 'var(--success)' : 'var(--warning)',
          }}>{project.status}</span>
          {isAdmin && <Link to="/tasks" className="btn btn-primary btn-sm">+ Add Task</Link>}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Tasks */}
        <div>
          <div className="section-title">◧ Tasks ({tasks.length})</div>
          {tasks.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-icon">◧</div><p>No tasks in this project yet.</p></div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((task) => (
                <div key={task._id} className="card card-sm">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</span>
                    <StatusBadge status={task.status} dueDate={task.dueDate} />
                  </div>
                  {task.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{task.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>👤 {task.assignedTo?.name}</span>
                    <span>📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    <span style={{
                      color: task.priority === 'High' ? 'var(--danger)' : task.priority === 'Medium' ? 'var(--warning)' : 'var(--success)',
                    }}>● {task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members */}
        <div>
          <div className="section-title">👥 Team Members ({project.members.length})</div>
          <div className="card" style={{ marginBottom: 16 }}>
            {project.members.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No members added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {project.members.map((m) => (
                  <div key={m._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    background: 'var(--bg-primary)',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `hsl(${(m.name.charCodeAt(0) * 37) % 360}, 65%, 50%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                    }}>{m.name.slice(0,2).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                    {isAdmin && (
                      <button className="btn btn-sm btn-danger" onClick={() => removeMember(m._id)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAdmin && nonMembers.length > 0 && (
            <div className="card">
              <div className="section-title" style={{ marginBottom: 12 }}>Add Members</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {nonMembers.map((u) => (
                  <div key={u._id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius)',
                  }}>
                    <span style={{ flex: 1, fontSize: '0.875rem' }}>{u.name}</span>
                    <button className="btn btn-sm btn-primary" onClick={() => addMember(u._id)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
