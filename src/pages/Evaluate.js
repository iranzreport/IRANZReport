import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { COACH_ROSTER, SECTIONS, COACH_SECTIONS, playerKey, sessionKey, encodeEval, decodeEval, getEvalColor, isCoachCourse, getRosterForCourse } from '../lib/constants';

export default function Evaluate() {
  const { playerKey: pk } = useParams();
  const { profile, course } = useAuth();
  const navigate = useNavigate();
  const isCoach = isCoachCourse(course);
  const activeSections = isCoach ? COACH_SECTIONS : SECTIONS;
  const activeRoster = isCoach ? COACH_ROSTER : getRosterForCourse(course);

  const [sessionData, setSessionData] = useState({ players: {} });
  const [currentSection, setCurrentSection] = useState(0);
  const [viewingEval, setViewingEval] = useState(profile?.name);
  const [saved, setSaved] = useState(false);
  const [pushTimer, setPushTimer] = useState(null);

  const p = activeRoster.find(r => playerKey(r) === pk) || {};
  const ini = (p.first?.[0] || '') + (p.last?.[0] || '');

  const loadData = useCallback(async () => {
    try {
      const snap = await get(ref(db, sessionKey(course) + '/players/' + pk));
      if (!snap.exists()) return;
      const data = snap.val();
      const evs = {};
      Object.keys(data.evaluators || {}).forEach(en => { evs[decodeEval(en)] = data.evaluators[en]; });
      setSessionData(prev => ({ players: { ...prev.players, [pk]: { ...data, evaluators: evs } } }));
    } catch (e) { console.error(e); }
  }, [pk, course]);

  // Load data only when player or course changes, not on every render
  useEffect(() => {
    loadData();
    setCurrentSection(0);
  }, [pk, course]);

  // Update viewingEval when profile loads (separate from data loading)
  useEffect(() => {
    if (profile?.name) setViewingEval(profile.name);
  }, [profile?.name]);

  function getMyData() {
    return (sessionData.players[pk]?.evaluators || {})[profile?.name] || { scores: {}, comments: {}, overallComment: '' };
  }

  function getViewData() {
    return (sessionData.players[pk]?.evaluators || {})[viewingEval] || { scores: {}, comments: {}, overallComment: '' };
  }

  async function schedulePush(newData) {
    setSaved(false);
    clearTimeout(pushTimer);
    // Save immediately to Firebase
    try {
      await set(ref(db, sessionKey(course) + '/players/' + pk + '/evaluators/' + encodeEval(profile.name)), newData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch(e) { console.error('Save failed:', e); }
  }

  function handleScore(key, n) {
    if (viewingEval !== profile?.name) return;
    const myD = getMyData();
    const cur = parseInt(myD.scores?.[key]) || 0;
    const newVal = cur === n ? 0 : n;
    const newData = { ...myD, scores: { ...(myD.scores || {}), [key]: newVal } };
    setSessionData(prev => ({
      players: { ...prev.players, [pk]: { ...(prev.players[pk] || {}), evaluators: { ...(prev.players[pk]?.evaluators || {}), [profile.name]: newData } } }
    }));
    schedulePush(newData);
  }

  function handleComment(secId, val) {
    if (viewingEval !== profile?.name) return;
    const myD = getMyData();
    const newData = { ...myD, comments: { ...(myD.comments || {}), [secId]: val } };
    setSessionData(prev => ({
      players: { ...prev.players, [pk]: { ...(prev.players[pk] || {}), evaluators: { ...(prev.players[pk]?.evaluators || {}), [profile.name]: newData } } }
    }));
    schedulePush(newData);
  }

  const pd = sessionData.players[pk] || { evaluators: {} };
  const photo = pd.photo;
  const evNames = Object.keys(pd.evaluators || {});
  if (!evNames.includes(profile?.name)) evNames.unshift(profile?.name);
  const sec = activeSections[currentSection];
  const isMe = viewingEval === profile?.name;
  const evData = isMe ? getMyData() : getViewData();
  const myD = getMyData();

  const SCORE_COLORS = { 1: '#ef4444', 2: '#f59e0b', 3: '#facc15', 4: '#38bdf8', 5: '#22c55e' };
  const SS = { 1: 's1', 2: 's2', 3: 's3', 4: 's4', 5: 's5' };

  // ── NOTES-ONLY SECTION (comm_behaviour / rugby_content) ──
  function renderNotesSection() {
    const isCommBehaviour = sec.id === 'comm_behaviour';
    return (
      <div>
        <div style={{ background: '#111', border: '1.5px solid #222', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ background: '#0f1723', padding: '12px 20px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green)' }}>
            {isCommBehaviour ? 'Coaching Tools Reference Guide' : 'Rugby Knowledge & Content Delivery'}
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>
            {isCommBehaviour ? [
              { color: 'var(--green)', title: '1. The Q → R → Q Questioning Tool', body: 'Ask: "What did you see there?" → Listen → Follow up: "What could you do differently next time?"' },
              { color: '#38bdf8', title: '2. The 3:1 Feedback Ratio', body: '3 positives for every 1 correction. Reinforce what is working before correcting.' },
              { color: '#f59e0b', title: '3. The Freeze–Fix–Play Method', body: 'Freeze the play → Fix (quick explanation or question) → Play immediately again.' },
              { color: 'var(--green)', title: '4. The Less Talk, More Action Rule', body: 'Instructions 30 seconds or less, then get players moving. Players learn more by doing.' },
              { color: '#38bdf8', title: '5. The Observe → Decide → Intervene Model', body: 'Before jumping in: Observe what is happening → Decide if it is worth stopping → Intervene with a question, demo, or let play continue.' },
            ].map(item => (
              <div key={item.title} style={{ borderLeft: `3px solid ${item.color}`, paddingLeft: 16 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                <p style={{ margin: 0 }}>{item.body}</p>
              </div>
            )) : [
              { color: 'var(--green)', title: '1. Accuracy of Rugby Knowledge', body: 'Laws applied correctly, technique cues are biomechanically sound, tactical concepts appropriate for the level.' },
              { color: '#38bdf8', title: '2. Session Design & Structure', body: 'Warm-Up → Skill Focus → Game Application → Review. Progressive loading with clear learning outcomes.' },
              { color: '#f59e0b', title: '3. Drill Selection & Relevance', body: 'Drills directly relate to the learning objective, appropriately challenging, reflect real game scenarios.' },
              { color: 'var(--green)', title: '4. Technical Cue Delivery', body: 'Specific, action-based, timed well, prioritised — one key point at a time.' },
              { color: '#38bdf8', title: '5. Game Understanding & Tactical Awareness', body: 'Identifies what is breaking down and why, spots patterns quickly, connects training to match situations.' },
            ].map(item => (
              <div key={item.title} style={{ borderLeft: `3px solid ${item.color}`, paddingLeft: 16 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                <p style={{ margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 6 }}>
          Notes — {profile?.name} — {sec.label}
        </div>
        <textarea
          disabled={!isMe}
          value={isMe ? (myD.comments?.[sec.id] || '') : (evData.comments?.[sec.id] || '')}
          onChange={e => handleComment(sec.id, e.target.value)}
          placeholder="Add your observations..."
          style={{ width: '100%', background: '#000', border: '1.5px solid #222', borderRadius: 8, padding: '12px 14px', fontSize: 14, color: '#fff', fontFamily: "'Inter', sans-serif", resize: 'vertical', minHeight: 100, outline: 'none', opacity: !isMe ? 0.6 : 1 }}
        />
      </div>
    );
  }

  // ── PLAYBOOK SECTION ──
  function renderPlaybookSection() {
    return (
      <div style={{ background: '#111', border: '1.5px solid #222', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ background: '#0f1723', padding: '12px 20px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green)' }}>
          Coach Playbook — Session Plans, Drills & Notes
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Upload images of session plans, drill diagrams, whiteboard notes, or coaching resources for this coach.</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>Playbook image upload coming soon.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back + player info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={() => navigate('/')}>← {isCoach ? 'Coaches' : 'Players'}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1a1a1a', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 900, color: 'var(--green)', flexShrink: 0, overflow: 'hidden' }}>
            {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ini}
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, textTransform: 'uppercase' }}>{p.first} {p.last}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.primaryPos || ''}</div>
          </div>
        </div>
        <button className="btn btn-orange" style={{ fontSize: 12, padding: '8px 14px' }} onClick={() => navigate('/report/' + pk)}>📊 Report</button>
        {saved && <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ Saved</span>}
      </div>

      {/* Course badge */}
      {isCoach && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: 'var(--green)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, display: 'inline-block' }}>
          🏉 Advanced Coaches Course
        </div>
      )}

      {/* Evaluator switcher */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, scrollbarWidth: 'none' }}>
        {evNames.map((n, i) => {
          const isActive = viewingEval === n;
          const c = getEvalColor(n, i);
          return (
            <button key={n} onClick={() => setViewingEval(n)} style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${isActive ? c : '#1a1a1a'}`, background: isActive ? c + '22' : 'transparent', color: isActive ? c : 'var(--muted)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              ◎ {n}{n === profile?.name ? ' (You)' : ''}
            </button>
          );
        })}
      </div>

      {!isMe && <div style={{ background: '#1a1a00', border: '1px solid var(--amber)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--amber)', marginBottom: 16 }}>👁 Viewing {viewingEval}'s scores — read only</div>}

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
        {activeSections.map((s, i) => {
          const has = s.metrics.some(m => parseInt(myD.scores?.[s.id + '_' + m]) > 0);
          return (
            <button key={s.id} onClick={() => { setCurrentSection(i); window.scrollTo(0, 0); }}
              style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${i === currentSection ? 'var(--green)' : has ? '#22c55e44' : '#1a1a1a'}`, background: i === currentSection ? 'var(--green)' : 'transparent', color: i === currentSection ? '#000' : has ? '#22c55e88' : 'var(--muted)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {s.label}
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>{sec.label}</div>

      {sec.type === 'gym' && (
        <div style={{ background: '#000', border: '1px solid var(--green)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Body Weight</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="text" disabled={!isMe}
              value={isMe ? (myD.scores?.['gym_testing_body_weight'] || '') : (evData.scores?.['gym_testing_body_weight'] || '')}
              onChange={e => handleScore('gym_testing_body_weight', e.target.value)}
              placeholder="e.g. 85"
              style={{ flex: 1, background: '#111', border: '1.5px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 16, color: '#fff', fontFamily: "'Inter', sans-serif", outline: 'none', opacity: !isMe ? 0.6 : 1 }} />
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>kg</div>
          </div>
        </div>
      )}

      {/* Section content */}
      {sec.type === 'notes' ? renderNotesSection() :
       sec.type === 'playbook' ? renderPlaybookSection() : (
        <>
          {sec.metrics.map(m => {
            const key = sec.id + '_' + m;
            const raw = evData.scores?.[key];
            const score = (raw != null && parseInt(raw) > 0) ? parseInt(raw) : null;
            const numericVal = evData.scores?.[key] || '';

            if (sec.type === 'numeric') {
              return (
                <div key={m} style={{ background: '#000', border: '1px solid #222', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{m}</div>
                  <input
                    type="text"
                    disabled={!isMe}
                    value={isMe ? (myD.scores?.[key] || '') : numericVal}
                    onChange={e => handleScore(key, e.target.value)}
                    placeholder="Enter result (e.g. 4:23 or 1.52)"
                    style={{ width: '100%', background: '#111', border: '1.5px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 16, color: '#fff', fontFamily: "'Inter', sans-serif", outline: 'none', opacity: !isMe ? 0.6 : 1, boxSizing: 'border-box' }}
                  />
                </div>
              );
            }

            if (sec.type === 'gym') {
              const kgKey = key + '_kg';
              const repsKey = key + '_reps';
              const kgVal = parseFloat(isMe ? (myD.scores?.[kgKey] || '') : (evData.scores?.[kgKey] || ''));
              const repsVal = parseFloat(isMe ? (myD.scores?.[repsKey] || '') : (evData.scores?.[repsKey] || ''));
              const oneRM = (!isNaN(kgVal) && !isNaN(repsVal) && repsVal > 0)
                ? Math.round(kgVal * (1 + repsVal / 30))
                : null;
              return (
                <div key={m} style={{ background: '#000', border: '1px solid #222', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{m}</div>
                    {oneRM && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>1RM: {oneRM}kg</div>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Kg</div>
                      <input type="text" disabled={!isMe}
                        value={isMe ? (myD.scores?.[kgKey] || '') : (evData.scores?.[kgKey] || '')}
                        onChange={e => handleScore(kgKey, e.target.value)}
                        placeholder="e.g. 80"
                        style={{ width: '100%', background: '#111', border: '1.5px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 16, color: '#fff', fontFamily: "'Inter', sans-serif", outline: 'none', opacity: !isMe ? 0.6 : 1, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Reps</div>
                      <input type="text" disabled={!isMe}
                        value={isMe ? (myD.scores?.[repsKey] || '') : (evData.scores?.[repsKey] || '')}
                        onChange={e => handleScore(repsKey, e.target.value)}
                        placeholder="e.g. 10"
                        style={{ width: '100%', background: '#111', border: '1.5px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 16, color: '#fff', fontFamily: "'Inter', sans-serif", outline: 'none', opacity: !isMe ? 0.6 : 1, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={m} style={{ background: '#000', border: '1px solid #222', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{m}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: score ? SCORE_COLORS[score] : 'var(--muted)' }}>{score || '—'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} className={`score-btn ${score === n ? SS[n] : ''}`} disabled={!isMe} onClick={() => handleScore(key, n)} style={{ opacity: !isMe ? 0.4 : 1 }}>{n}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', padding: '0 2px' }}>
                  <span>Needs Work</span><span>Excellent</span>
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 6, marginTop: 16 }}>
            Comments — {profile?.name} — {sec.label}
          </div>
          <textarea
            disabled={!isMe}
            value={isMe ? (myD.comments?.[sec.id] || '') : (evData.comments?.[sec.id] || '')}
            onChange={e => handleComment(sec.id, e.target.value)}
            placeholder="Add coaching notes..."
            style={{ width: '100%', background: '#000', border: '1.5px solid #222', borderRadius: 8, padding: '12px 14px', fontSize: 14, color: '#fff', fontFamily: "'Inter', sans-serif", resize: 'vertical', minHeight: 80, outline: 'none', opacity: !isMe ? 0.6 : 1 }}
          />
        </>
      )}

      {/* Prev/Next */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => { setCurrentSection(c => c - 1); window.scrollTo(0, 0); }} disabled={currentSection === 0}>← Previous</button>
        <button className="btn btn-primary" onClick={() => {
          if (currentSection < activeSections.length - 1) { setCurrentSection(c => c + 1); window.scrollTo(0, 0); }
          else { navigate('/report/' + pk); }
        }}>
          {currentSection === activeSections.length - 1 ? 'View Report →' : 'Next Section →'}
        </button>
      </div>
    </div>
  );
}
