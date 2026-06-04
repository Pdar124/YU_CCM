import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const createDietLog = ({
  catId,
  cat,
  user,
  foodType,
  amount,
  symptoms,
  memo
}) =>
  addDoc(collection(db, 'dietLogs'), {
    catId,
    catName: cat?.name || '',
    caregiverUid: user.uid,
    caregiverName: user.nickname || user.studentId || user.id,
    foodType,
    amount,
    symptoms,
    memo,
    fedAt: serverTimestamp()
  });

export const subscribeLatestDietLog = (callback) => {
  const latestQuery = query(
    collection(db, 'dietLogs'),
    orderBy('fedAt', 'desc'),
    limit(1)
  );

  return onSnapshot(latestQuery, (snapshot) => {
    if (!snapshot.empty) {
      callback({
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      });
    }
  });
};
