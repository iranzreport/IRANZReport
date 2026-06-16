import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAZslwxBsOSjdCou-n-swXJivlkdbm6VNM",
  authDomain: "iranz-southwest-usa-skill-camp.firebaseapp.com",
  databaseURL: "https://iranz-southwest-usa-skill-camp-default-rtdb.firebaseio.com",
  projectId: "iranz-southwest-usa-skill-camp",
  storageBucket: "iranz-southwest-usa-skill-camp.firebasestorage.app",
  messagingSenderId: "336847346889",
  appId: "1:336847346889:web:aa8ef32a6558531ba50118"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
