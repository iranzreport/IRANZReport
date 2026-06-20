const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.cert(serviceAccount),
  databaseURL: 'https://iranz-southwest-usa-skill-camp-default-rtdb.firebaseio.com'
});

const db = getDatabase();

async function migrate() {
  const defaultSnap = await db.ref('session_default/players').once('value');
  const usaSnap = await db.ref('session_iranz_usa/players').once('value');

  const defaultPlayers = defaultSnap.val() || {};
  const usaPlayers = usaSnap.val() || {};

  let merged = 0;
  let copied = 0;

  for (const [playerKey, defaultData] of Object.entries(defaultPlayers)) {
    const existing = usaPlayers[playerKey];

    if (existing) {
      const mergedEvaluators = {
        ...(existing.evaluators || {}),
        ...(defaultData.evaluators || {})
      };
      const mergedPlayer = {
        ...existing,
        ...defaultData,
        evaluators: mergedEvaluators
      };
      await db.ref(`session_iranz_usa/players/${playerKey}`).set(mergedPlayer);
      console.log(`Merged: ${playerKey}`);
      merged++;
    } else {
      await db.ref(`session_iranz_usa/players/${playerKey}`).set(defaultData);
      console.log(`Copied: ${playerKey}`);
      copied++;
    }
  }

  console.log(`\nDone! Merged ${merged} players, copied ${copied} new players.`);
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
