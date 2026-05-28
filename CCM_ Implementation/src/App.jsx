// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';

import Header from './components/Header';
import CatList from './components/CatList';
import MapContainer from './components/MapContainer';
import ReportModal from './components/ReportModal';
import CatDetail from './components/CatDetail';

function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  
  const [cats, setCats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
  
  // 💡 selectedCat 상태에는 객체 전체를 담는 대신, 고양이의 고유 'id'만 기억하게 합니다.
  const [selectedCatId, setSelectedCatId] = useState(null);

  // 1. 카카오 지도 초기화 (기존 코드 유지)
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
      return;
    }

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

    function initMap() {
      if (!mapContainer.current) return;
      
      const centerPosition = new window.kakao.maps.LatLng(35.8242, 128.7530);
      const mapOptions = { center: centerPosition, level: 3 };

      const map = new window.kakao.maps.Map(mapContainer.current, mapOptions);
      mapRef.current = map;

      window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        setClickedCoords({ lat: latlng.getLat(), lng: latlng.getLng() });
        setIsModalOpen(true);
      });
    }
  }, []);

  // 2. 🔥 파이어베이스 실시간 감시 (의존성 배열을 완전히 비워서 무한 루프 해결!)
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

  // 3. 고양이 변경 시 마커 업데이트 (기존 유지)
  useEffect(() => {
    if (!mapRef.current || cats.length === 0) return;

    cats.forEach((cat) => {
      const markerPosition = new window.kakao.maps.LatLng(cat.lat, cat.lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapRef.current
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedCatId(cat.id); // 💡 마커 클릭 시 ID 저장
        mapRef.current.panTo(markerPosition);
      });
    });
  }, [cats]);

  // 리스트나 마커 클릭 핸들러
  const handleCatClick = (cat) => {
    if (mapRef.current) {
      const newCenter = new window.kakao.maps.LatLng(cat.lat, cat.lng);
      mapRef.current.panTo(newCenter);
    }
    setSelectedCatId(cat.id); // 💡 ID 저장
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

  // 💡 [핵심] 실시간으로 받아온 cats 배열에서, 현재 선택된 ID를 가진 고양이를 실시간으로 매칭해 줍니다!
  const currentSelectedCat = cats.find(c => c.id === selectedCatId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-73px)]">
        <CatList 
          cats={cats} 
          onCatClick={(cat) => handleCatClick(cat)} 
        />
        
        <MapContainer ref={mapContainer} />

        {/* 🧩 찾은 고양이 객체를 그대로 넘겨줍니다. */}
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