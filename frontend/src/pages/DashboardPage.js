/**
 * Dashboard Page — Summary cards + recent tasks
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes, projRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/tasks'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data.stats);
        setTasks(tasksRes.data.tasks.slice(0, 8));
        setProjects(projRes.data.projects.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</div>
          <div className="page-subtitle">Here's what's happening with your team today.</div>
        </div>
        {isAdmin && (
          <Link to="/tasks" className="btn btn-primary">+ New Task</Link>
        )}
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.todo}</div>
            <div className="stat-label">Todo</div>
          </div>
          <div className="stat-card overdue">
            <div className="stat-number">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Recent Tasks */}
        <div className="card">
          <div className="section-title">
            ◧ Recent Tasks
            <Link to="/tasks" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◧</div>
              <p>No tasks yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((task) => (
                <div key={task._id} style={{
                  padding: '12px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{task.title}</div>
                    <StatusBadge status={task.status} dueDate={task.dueDate} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>📁 {task.project?.name}</span>
                    <span>👤 {task.assignedTo?.name}</span>
                    <span>📅 {format(new Date(task.dueDate), 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="card">
          <div className="section-title">
            ⬡ Active Projects
            <Link to="/projects" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⬡</div>
              <p>No projects yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map((proj) => (
                <Link key={proj._id} to={`/projects/${proj._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{proj.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {proj.members?.length} member{proj.members?.length !== 1 ? 's' : ''} ·{' '}
                      <span style={{ color: proj.status === 'Active' ? 'var(--success)' : 'var(--warning)' }}>
                        {proj.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
