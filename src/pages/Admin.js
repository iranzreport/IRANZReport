import React from 'react';
import { EVAL_COLORS, sessionKey } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const { course } = useAuth();
  return (
    <div>
      <div className="section-title">Admin Dashboard</div>

      <div className="card">
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Active Session</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{course || "No course selected"}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Firebase key: <code style={{ color: 'var(--amber)' }}>{sessionKey(course)}</code></div>
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Evaluator Colours</div>
        {Object.entries(EVAL_COLORS).map(([name, color]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 13 }}>{name}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Quick Links</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>🔥 Firebase Console</a>
          <a href="https://github.com/iranzreport/IRANZReport" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>💻 GitHub Repo</a>
        </div>
      </div>
    </div>
  );
}
