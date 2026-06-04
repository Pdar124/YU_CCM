import {
  collection,
  doc,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapSnapshotDocs } from './snapshot';

export const subscribeUsers = (callback) =>
  onSnapshot(collection(db, 'users'), (snapshot) => {
    callback(mapSnapshotDocs(snapshot));
  });

export const approveCaregiverUser = (uid, catIds = []) =>
  updateDoc(doc(db, 'users', uid), {
    role: 'caregiver',
    activeMode: 'student',
    caregiverCatIds: catIds
  });
