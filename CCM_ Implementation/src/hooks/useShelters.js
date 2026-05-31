// src/hooks/useShelters.js

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function useShelters() {
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'shelters'),
      (snapshot) => {
        setShelters(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    return () => unsub();
  }, []);

  return { shelters };
}