import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

import AdminCatManagementPage from '../pages/admin/AdminCatManagementPage';
import AdminUserManagementPage from '../pages/admin/AdminUserManagementPage';
import DietHealthRecordPage from '../pages/caregiver/DietHealthRecordPage';
import ProfilePage from '../pages/caregiver/ProfilePage';
import AdminPage from '../pages/admin/AdminPage';
import CaregiverApplicationPage from '../pages/caregiver/CaregiverApplicationPage';
import SignupCompletePage from '../pages/auth/SignupCompletePage';
import SignupTermsPage from '../pages/auth/SignupTermsPage';
import SignupProfilePage from '../pages/auth/SignupProfilePage';
import SignupPage from '../pages/common/SignupPage';
import LoginPage from '../pages/common/LoginPage';
import DashboardPage from '../pages/student/DashboardPage';

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticatedUser = user && user.role !== 'guest';

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
          isAuthenticatedUser ? <Navigate to="/" /> : <LoginPage setUser={setUser} />
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticatedUser ? <Navigate to="/" /> : <SignupPage setUser={setUser} />
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
          isAuthenticatedUser ? (
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
            <DashboardPage
              key={user.uid || user.role}
              user={user}
              setUser={setUser}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/admin"
        element={
          user?.role === 'admin' ? (
            <AdminPage />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/diet-health/:catId"
        element={
          isAuthenticatedUser ? <DietHealthRecordPage user={user} /> : <Navigate to="/login" />
        }
      />

      <Route
        path="/profile"
        element={
          isAuthenticatedUser ? <ProfilePage user={user} setUser={setUser} /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/admin/users"
        element={
          user?.role === 'admin' ? (
            <AdminUserManagementPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/cats"
        element={<AdminCatManagementPage />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;
