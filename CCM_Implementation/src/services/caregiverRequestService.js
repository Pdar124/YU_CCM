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

export const subscribePendingCaregiverRequests = (callback) => {
  const pendingQuery = query(
    collection(db, 'caregiverRequests'),
    where('status', '==', 'pending')
  );

  return onSnapshot(pendingQuery, (snapshot) => {
    callback(mapSnapshotDocs(snapshot));
  });
};

export const createCaregiverRequest = ({
  user,
  catIds,
  reason,
  authCode
}) =>
  addDoc(collection(db, 'caregiverRequests'), {
    uid: user.uid,
    studentId: user.studentId || user.id,
    nickname: user.nickname || user.id,
    catIds,
    reason: reason.trim(),
    authCode: authCode.trim(),
    status: 'pending',
    createdAt: serverTimestamp()
  });

export const approveCaregiverRequest = (requestId) =>
  updateDoc(doc(db, 'caregiverRequests', requestId), {
    status: 'approved',
    approvedAt: serverTimestamp()
  });

export const rejectCaregiverRequest = (requestId) =>
  updateDoc(doc(db, 'caregiverRequests', requestId), {
    status: 'rejected',
    rejectedAt: serverTimestamp()
  });
