import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapSnapshotDocs } from './snapshot';

export const subscribePendingCatRegistrationRequests = (callback) => {
  const pendingQuery = query(
    collection(db, 'catRegistrationRequests'),
    where('status', '==', 'pending')
  );

  return onSnapshot(pendingQuery, (snapshot) => {
    callback(mapSnapshotDocs(snapshot));
  });
};

export const createCatRegistrationRequest = ({
  tempName,
  gender,
  description,
  user,
  clickedCoords,
  observedAt
}) =>
  addDoc(collection(db, 'catRegistrationRequests'), {
    tempName: tempName.trim() || '이름 미정',
    gender,
    description: description.trim(),
    requesterUid: user?.uid || '',
    requesterName:
      user?.nickname ||
      user?.studentId ||
      user?.id ||
      '익명 사용자',
    lat: clickedCoords?.lat,
    lng: clickedCoords?.lng,
    observedAt: observedAt ? new Date(observedAt) : new Date(),
    status: 'pending',
    createdAt: serverTimestamp()
  });

export const approveCatRegistrationRequest = (requestId) =>
  updateDoc(doc(db, 'catRegistrationRequests', requestId), {
    status: 'approved',
    approvedAt: serverTimestamp()
  });

export const rejectCatRegistrationRequest = (requestId) =>
  updateDoc(doc(db, 'catRegistrationRequests', requestId), {
    status: 'rejected',
    rejectedAt: serverTimestamp()
  });
