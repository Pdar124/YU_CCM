import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

import CaregiverApplicationPage from '../pages/CaregiverApplicationPage';
import SignupCompletePage from '../pages/SignupCompletePage';
import SignupTermsPage from '../pages/SignupTermsPage';
import SignupProfilePage from '../pages/SignupProfilePage';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(
            doc(db, 'users', firebaseUser.uid)
          );

          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              id: firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              ...userDoc.data()
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              id: firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              role: 'student'
            });
          }
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);

          setUser({
            uid: firebaseUser.uid,
            id: firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'student'
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" /> : <LoginPage setUser={setUser} />
        }
      />

      <Route
        path="/signup"
        element={
          user ? <Navigate to="/" /> : <SignupPage setUser={setUser} />
        }
      />

      <Route
        path="/signup/profile"
        element={<SignupProfilePage />}
      />

      <Route
        path="/signup/terms"
        element={<SignupTermsPage />}
      />

      <Route
        path="/signup/complete"
        element={<SignupCompletePage />}
      />

      <Route
        path="/caregiver/apply"
        element={
          user ? (
            <CaregiverApplicationPage user={user} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/"
        element={
          user ? (
            <DashboardPage user={user} setUser={setUser} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;