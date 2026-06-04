import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapSnapshotDocs } from './snapshot';

export const subscribeReports = (callback) =>
  onSnapshot(collection(db, 'reports'), (snapshot) => {
    callback(mapSnapshotDocs(snapshot));
  });

export const createReport = ({
  reportData,
  clickedCoords,
  user
}) =>
  addDoc(collection(db, 'reports'), {
    catId: reportData.catId,
    lat: clickedCoords.lat,
    lng: clickedCoords.lng,
    memo: reportData.memo || '',
    imageUrl: reportData.imageUrl || '',
    reporterUid: user?.uid || '',
    reporterName:
      user?.nickname ||
      user?.studentId ||
      user?.id ||
      '익명 사용자',
    observedAt: reportData.observedAt
      ? Timestamp.fromDate(reportData.observedAt)
      : serverTimestamp(),
    createdAt: serverTimestamp()
  });
