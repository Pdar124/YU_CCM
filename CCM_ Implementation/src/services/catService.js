import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapSnapshotDocs } from './snapshot';

export const subscribeCats = (callback) =>
  onSnapshot(collection(db, 'cats'), (snapshot) => {
    callback(mapSnapshotDocs(snapshot));
  });

export const getCat = async (catId) => {
  const snapshot = await getDoc(doc(db, 'cats', catId));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
};

export const updateCat = (catId, data) =>
  updateDoc(doc(db, 'cats', catId), data);

export const updateCatWiki = (catId, formData) =>
  updateCat(catId, {
    origin: formData.origin,
    feature: formData.feature,
    healthStatus: formData.healthStatus,
    territory: formData.territory
  });

export const createCatFromRegistrationRequest = (request) =>
  addDoc(collection(db, 'cats'), {
    name: request.tempName || '이름 미정',
    gender: request.gender || 'unknown',
    description: request.description || '',
    feature: request.description || '',
    origin: '사용자 신규 등록 요청',
    healthStatus: '정보 없음',
    territory: request.location || '',
    lat: request.lat || null,
    lng: request.lng || null,
    location: request.location || '',
    status: 'active',
    registeredByRequestId: request.id,
    requesterUid: request.requesterUid || '',
    requesterName: request.requesterName || '',
    createdAt: serverTimestamp()
  });
