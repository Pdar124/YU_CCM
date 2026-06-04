import {
  collection,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapSnapshotDocs } from './snapshot';

export const subscribeShelters = (callback) =>
  onSnapshot(collection(db, 'shelters'), (snapshot) => {
    callback(mapSnapshotDocs(snapshot));
  });
