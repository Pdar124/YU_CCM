// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 고양이 데이터를 저장할 데이터베이스
import { getAuth } from "firebase/auth"; // 유저 인증을 위한 모듈 (향후 로그인 기능 확장 시 사용)

const firebaseConfig = {
  apiKey: "AIzaSyCYG7QwkVGsQFlB78H4eRis7hzBfA1j5xI",
  authDomain: "campus-cat-mate.firebaseapp.com",
  projectId: "campus-cat-mate",
  storageBucket: "campus-cat-mate.firebasestorage.app",
  messagingSenderId: "529988872889",
  appId: "1:529988872889:web:848076f9aff6709bcd4968"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// 다른 파일에서 쓸 수 있도록 Firestore 데이터베이스 내보내기
const db = getFirestore(app);
const auth = getAuth(app);

export {db,auth}