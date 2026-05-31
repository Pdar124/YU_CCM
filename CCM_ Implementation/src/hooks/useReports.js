// src/hooks/useReports.js

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function useReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'reports'),
      (snapshot) => {
        setReports(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    return () => unsub();
  }, []);

  return { reports };
}