import {
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const createWikiHistory = ({
  catId,
  user,
  formData
}) =>
  addDoc(collection(db, 'wikiHistories'), {
    catId,
    editorUid: user.uid,
    editorName:
      user.studentId ||
      user.nickname,
    ...formData,
    editedAt: serverTimestamp()
  });
