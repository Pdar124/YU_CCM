// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from './config/firebase'; // auth 추가
import { onAuthStateChanged } from 'firebase/auth'; // onAuthStateChanged 추가
import { signOut } from 'firebase/auth'; // signOut 추가
import { collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';

import Header from './components/Header';
import CatList from './components/cat/CatList';
import MapContainer from './components/map/MapContainer';
import ReportModal from './components/modal/ReportModal';
import CatDetail from './components/cat/CatDetail';
import Login from './components/auth/Login';

function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [cats, setCats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
  const [selectedCatId, setSelectedCatId] = useState(null);

  // 인증된 유저 상태를 관리할 state 추가
  const [user, setUser] = useState(null);

  // 1. 카카오 지도 초기화 스크립트 로드
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=8309e0e8095058bb527deb1918011c3c&autoload=false';
      script.async = true;

      script.onload = () => {
        window.kakao.maps.load(() => {
          initMap();
        });
      };
      document.head.appendChild(script);
    }

    function initMap() {
      if (!mapContainer.current) return;
      const centerPosition = new window.kakao.maps.LatLng(35.8242, 128.7530);
      const mapOptions = { center: centerPosition, level: 3 };

      const map = new window.kakao.maps.Map(mapContainer.current, mapOptions);
      mapRef.current = map;

      // 지도 클릭 이벤트 등록
      window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        setClickedCoords({ lat: latlng.getLat(), lng: latlng.getLng() });
        setIsModalOpen(true);
      });
    }
  }, []);

  // 2. 파이어베이스 인증 상태 감시
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const studentIdOnly = firebaseUser.email ? firebaseUser.email.split('@')[0] : '';
        setUser({ id: studentIdOnly, role: 'member', uid: firebaseUser.uid });
      } else {
        setUser((currentUser) => (currentUser?.role === 'guest' ? currentUser : null));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 3. 파이어베이스 실시간 데이터(cats) 감시
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'cats'), (snapshot) => {
      const catList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCats(catList);
    });

    return () => unsubscribe();
  }, []);

  // 4. 고양이 데이터 변경 시 지도 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || cats.length === 0) return;

    cats.forEach((cat) => {
      const markerPosition = new window.kakao.maps.LatLng(cat.lat, cat.lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapRef.current
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedCatId(cat.id);
        mapRef.current.panTo(markerPosition);
      });
    });
  }, [cats]);
  // 로그아웃 핸들러
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 리스트나 마커 클릭 핸들러
  const handleCatClick = (cat) => {
    if (mapRef.current) {
      const newCenter = new window.kakao.maps.LatLng(cat.lat, cat.lng);
      mapRef.current.panTo(newCenter);
    }
    setSelectedCatId(cat.id);
  };

  // 고양이 신규 제보
  const handleReportSubmit = async (newCatData) => {
    try {
      await addDoc(collection(db, 'cats'), {
        name: newCatData.name,
        location: newCatData.location,
        bio: newCatData.bio || '사람을 좋아해요.',
        lastFed: '배고픔 🐾',
        icon: newCatData.icon,
        lat: Number(newCatData.lat),
        lng: Number(newCatData.lng)
      });
    } catch (error) {
      console.error("제보 중 오류: ", error);
    }
  };

  // 파이어베이스 정보 업데이트
  const handleUpdateCat = async (catId, updatedFields) => {
    try {
      const catDocRef = doc(db, 'cats', catId);
      await updateDoc(catDocRef, updatedFields);
      console.log("데이터베이스 업데이트 성공!");
    } catch (error) {
      console.error("업데이트 중 오류: ", error);
    }
  };

  // 실시간 선택된 고양이 객체 매칭
  const currentSelectedCat = cats.find(c => c.id === selectedCatId);
  if (!user) {
  return (
    <Login
      onLoginSuccess={(userData) => setUser(userData)}
      onGuestLogin={() =>
        setUser({ id: 'guest', role: 'guest', uid: null })
      }
    />
  );
}
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <Header user={user} onLogout={handleLogout}  /> {/* 필요 시 user 정보를 Header 등에 전달 가능 */}

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-73px)]">
        <CatList
          cats={cats}
          onCatClick={(cat) => handleCatClick(cat)}
        />

        <MapContainer ref={mapContainer} />

        <CatDetail
          cat={currentSelectedCat}
          onClose={() => setSelectedCatId(null)}
          onUpdateCat={handleUpdateCat}
        />
      </main>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReportSubmit}
        lat={clickedCoords.lat}
        lng={clickedCoords.lng}
      />
    </div>
  );
}

export default App;