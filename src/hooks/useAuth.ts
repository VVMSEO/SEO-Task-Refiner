import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { initializeProfile } from '../lib/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
          try {
              await initializeProfile(u.uid, u.email, u.displayName);
          } catch(err) {
              console.error("Failed to init profile", err);
          }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
