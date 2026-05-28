// src/App.jsx 내부 첫 번째 useEffect 수정 버전
useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // 💡 이메일 주소에서 @ 앞부분(학번)만 쪼개서 가져옵니다.
      const studentIdOnly = firebaseUser.email ? firebaseUser.email.split('@')[0] : '';
      
      setUser({ id: studentIdOnly, role: 'member', uid: firebaseUser.uid });
    } else {
      setUser((currentUser) => (currentUser?.role === 'guest' ? currentUser : null));
    }
  });

  return () => unsubscribeAuth();
}, []);