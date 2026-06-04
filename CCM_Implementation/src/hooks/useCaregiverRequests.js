import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

function useCaregiverRequests(uid) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'caregiverRequests'),
      where('uid', '==', uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRequests(data);
    });

    return () => unsub();
  }, [uid]);

  return { requests };
}

export default useCaregiverRequests;