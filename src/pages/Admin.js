import React, { useState } from 'react';
import { EVAL_COLORS, sessionKey, getRosterForCourse, playerKey, isCoachCourse, COACH_ROSTER } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { course } = useAuth();
  const navigate = useNavigate();
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  function downloadAllReports() {
    const isCoach = isCoachCourse(course);
    const roster = isCoach ? COACH_ROSTER : getRosterForCourse(course);
    if (roster.length === 0) return;
    const queue = roster.map(p => playerKey(p));
    sessionStorage.setItem('pdfQueue', JSON.stringify(queue));
    sessionStorage.setItem('pdfQueueIndex', '0');
    navigate('/report/' + queue[0] + '?auto=1');
  }

  async function handleBulkGalleryUpload(files) {
    if (!files || files.length === 0) return;
    setUploadingBulk(true);
    setBulkStatus('Uploading...');
    const isCoach = isCoachCourse(course);
    const roster = isCoach ? COACH_ROSTER : getRosterForCourse(course);

    const newImgs = [];
    for (const file of Array.from(files)) {
      const dataUrl = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxW = 1200;
            const scale = img.width > maxW ? maxW / img.width : 1;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            res(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.src = e.target.result;
        };
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      newImgs.push(dataUrl);
    }

    let done = 0;
    for (const player of roster) {
      const pk = playerKey(player);
      const snap = await get(ref(db, sessionKey(course) + '/players/' + pk + '/gallery'));
      const existing = snap.exists() ? (snap.val() || []) : [];
      await set(ref(db, sessionKey(course) + '/players/' + pk + '/gallery'), [...existing, ...newImgs]);
      done++;
      setBulkStatus('Added to ' + done + ' of ' + roster.length + ' players...');
    }
    setBulkStatus('Done! Image added to all ' + roster.length + ' players.');
    setUploadingBulk(false);
  }

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
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Upload Image to All Players</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Upload one or more images and they will be added to the Game & Training Images gallery for every player in the current course.</div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green)', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '10px 18px', borderRadius: 8, cursor: uploadingBulk ? 'not-allowed' : 'pointer', opacity: uploadingBulk ? 0.6 : 1 }}>
          📸 {uploadingBulk ? 'Uploading...' : 'Choose Images'}
          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleBulkGalleryUpload(e.target.files)} disabled={uploadingBulk} />
        </label>
        {bulkStatus && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--green)' }}>{bulkStatus}</div>}
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Download All Reports</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Automatically download a PDF report for every player in the current course one by one. The screen will cycle through each report — this may take 2-3 minutes.</div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={downloadAllReports}>
          ⬇ Download All Reports
        </button>
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
