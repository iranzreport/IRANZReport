import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const COURSES = [
  { id: 'intermediate_players', label: 'Intermediate Players Course' },
  { id: 'advanced_players',     label: 'Advanced Players Course' },
  { id: 'advanced_coaches',     label: 'Advanced Coaches Course' },
  { id: 'iranz_usa',            label: 'IRANZ USA' },
  { id: 'iranz_uk',             label: 'IRANZ UK' },
  { id: 'nzpa',                  label: 'New Zealand Performance Academy (NZPAA)' },
];

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [course, setCourse]   = useState(() => localStorage.getItem('iranz_course') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await get(ref(db, 'users/' + firebaseUser.uid));
          if (snap.exists()) {
            setProfile(snap.val());
          } else {
            const name = firebaseUser.email.split('@')[0]
              .replace(/\./g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            const p = { name, role: 'evaluator', email: firebaseUser.email };
            await set(ref(db, 'users/' + firebaseUser.uid), p);
            setProfile(p);
          }
        } catch (e) {
          setProfile({ name: firebaseUser.email, role: 'evaluator', email: firebaseUser.email });
        }
      } else {
        setUser(null);
        setProfile(null);
        setCourse(null);
      }
      setLoading(false);
    });
  }, []);

  function selectCourse(courseId) {
    setCourse(courseId);
    localStorage.setItem('iranz_course', courseId);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, course, selectCourse, COURSES }}>
      {children}
    </AuthContext.Provider>
  );
}
