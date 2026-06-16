import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_ROSTER, COACH_ROSTER, SECTIONS, COACH_SECTIONS, playerKey, sessionKey, decodeEval, getEvalColor, isCoachCourse } from '../lib/constants';

export default function Players() {
  const { profile, course } = useAuth();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState({ players: {} });
  const [syncing, setSyncing] = useState(false);
  const isCoach = isCoachCourse(course);
  const activeRoster = isCoach ? COACH_ROSTER : DEFAULT_ROSTER;
  const activeSections = isCoach ? COACH_SECTIONS : SECTIONS;

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const snap = await get(ref(db, sessionKey(course)));
      if (!snap.exists()) { setSyncing(false); return; }
      const data = snap.val();
      if (!data.players) { setSyncing(false); return; }
      const players = {};
      Object.keys(data.players).forEach(pk => {
        players[pk] = { evaluators: {}, photo: data.players[pk].photo || null };
        const revs = data.players[pk].evaluators || {};
        Object.keys(revs).forEach(en => {
          players[pk].evaluators[decodeEval(en)] = revs[en];
        });
      });
      setSessionData({ players });
      document.getElementById('syncDot')?.classList.add('live');
      if (document.getElementById('syncStatus')) document.getElementById('syncStatus').textContent = 'Synced ' + new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { console.error(e); }
    setSyncing(false);
  }, []);

  useEffect(() => {
    sync();
    const interval = setInterval(sync, 10000);
    return () => clearInterval(interval);
  }, [sync]);

  const totalMetrics = activeSections.filter(s => s.id !== 'fitness' && s.type !== 'notes' && s.type !== 'playbook').reduce((a, s) => a + s.metrics.length, 0);
  const evalSet = new Set();
  activeRoster.forEach(p => {
    Object.keys((sessionData.players[playerKey(p)] || {}).evaluators || {}).forEach(n => evalSet.add(n));
  });
  const myScored = activeRoster.filter(p => {
    const myD = (sessionData.players[playerKey(p)]?.evaluators || {})[profile?.name] || {};
    return Object.values(myD.scores || {}).filter(v => parseInt(v) > 0).length > 0;
  }).length;

  async function handlePhoto(file, pk) {
    if (!file) return;
    window.showToast?.('Uploading photo...');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const compressed = await compressImage(e.target.result, 400, 0.7, true);
      await set(ref(db, sessionKey(course) + '/players/' + pk + '/photo'), compressed);
      window.showToast?.('Photo saved!');
      sync();
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="section-title" style={{ marginBottom: 2 }}>{isCoach ? 'Coach List' : 'Player List'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{isCoach ? 'Advanced Coaches Course' : 'IRANZ Southwest USA Skill Camp'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={sync} disabled={syncing}>
            {syncing ? '...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { num: activeRoster.length, label: isCoach ? 'Coaches' : 'Players' },
          { num: evalSet.size, label: 'Evaluators' },
          { num: myScored, label: "You've Scored" },
          { num: Math.round(myScored / DEFAULT_ROSTER.length * 100) + '%', label: 'Progress' },
        ].map(({ num, label }) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: 'var(--green)' }}>{num}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Player list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeRoster.map(p => {
          const pk = playerKey(p);
          const pd = sessionData.players[pk] || { evaluators: {} };
          const evNames = Object.keys(pd.evaluators || {});
          const myD = (pd.evaluators || {})[profile?.name] || {};
          const myCount = Object.values(myD.scores || {}).filter(v => parseInt(v) > 0).length;
          const pct = Math.round(myCount / totalMetrics * 100);
          const ini = (p.first?.[0] || '') + (p.last?.[0] || '');
          const photo = pd.photo;

          return (
            <div key={pk} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s', padding: '16px 20px' }}
              onClick={() => navigate('/evaluate/' + pk)}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
              {/* Avatar */}
              <div style={{ width: 52, height: 52, borderRadius: 10, background: '#1a1a1a', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: 'var(--green)', flexShrink: 0, overflow: 'hidden' }}>
                {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ini}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{p.first} {p.last}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{[p.primaryPos, p.weight ? p.weight + 'kg' : '', p.height ? p.height + 'cm' : ''].filter(Boolean).join(' · ') || 'Tap to evaluate'}</div>
                {p.club && <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 2, fontWeight: 500 }}>{p.club}</div>}
                <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--green)', borderRadius: 2, width: pct + '%', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {evNames.slice(0, 4).map((n, i) => (
                    <span key={n} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, border: `1px solid ${getEvalColor(n, i)}`, color: getEvalColor(n, i), fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{n.split(' ')[0]}</span>
                  ))}
                  {evNames.length > 4 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, border: '1px solid var(--muted)', color: 'var(--muted)', fontWeight: 600 }}>+{evNames.length - 4}</span>}
                  {myCount > 0 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, border: '1px solid var(--green)', color: 'var(--green)', fontWeight: 600 }}>You: {pct}%</span>}
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1.5px solid var(--border)', color: 'var(--muted)', background: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}
                  onClick={() => navigate('/report/' + pk)}>📊</button>
                <label style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1.5px solid var(--border)', color: 'var(--muted)', background: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>
                  📷<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhoto(e.target.files[0], pk)} />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function compressImage(url, maxSz, q, crop) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      if (crop) { const sz = Math.min(img.width, img.height), sx = (img.width - sz) / 2, out = Math.min(sz, maxSz); c.width = out; c.height = out; c.getContext('2d').drawImage(img, sx, 0, sz, sz, 0, 0, out, out); }
      else { let w = img.width, h = img.height; if (w > h) { if (w > maxSz) { h = h * maxSz / w; w = maxSz; } } else { if (h > maxSz) { w = w * maxSz / h; h = maxSz; } } c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); }
      res(c.toDataURL('image/jpeg', q));
    };
    img.src = url;
  });
}
