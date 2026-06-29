const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.cert(serviceAccount),
  databaseURL: 'https://iranz-southwest-usa-skill-camp-default-rtdb.firebaseio.com'
});

const { getDatabase } = require('firebase-admin/database');
const db = getDatabase();

const SESSION_KEY = 'session_iranz_usa';
const RENAMES = {
  'Halfback9': 'Dave_Ellis',
  'Wayne': 'Wayne_Taylor'
};

async function run() {
  const playersRef = db.ref(`${SESSION_KEY}/players`);
  const snap = await playersRef.once('value');
  if (!snap.exists()) {
    console.error('NO PLAYERS FOUND at', SESSION_KEY);
    process.exit(1);
  }
  const players = snap.val();
  let changedCount = 0;

  for (const playerKey of Object.keys(players)) {
    const evaluators = players[playerKey].evaluators || {};
    let changed = false;
    const updates = {};

    for (const [oldKey, newKey] of Object.entries(RENAMES)) {
      if (evaluators[oldKey]) {
        const oldData = evaluators[oldKey];
        const existingNew = evaluators[newKey] || {};
        // Merge: prefer existing new-key data if present, fall back to old data
        const merged = {
          scores: Object.assign({}, oldData.scores || {}, existingNew.scores || {}),
          comments: Object.assign({}, oldData.comments || {}, existingNew.comments || {}),
          overallComment: existingNew.overallComment || oldData.overallComment || ''
        };
        updates[`evaluators/${newKey}`] = merged;
        updates[`evaluators/${oldKey}`] = null; // delete old key
        changed = true;
        console.log(`Player ${playerKey}: ${oldKey} -> ${newKey}`);
      }
    }

    if (changed) {
      await playersRef.child(playerKey).update(updates);
      changedCount++;
    }
  }

  console.log(`\nDone. Updated ${changedCount} player(s).`);
  process.exit(0);
}

run().catch(e => { console.error('ERROR:', e); process.exit(1); });
