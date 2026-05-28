// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

// 컴포넌트 불러오기
import Header from './components/Header';
import CatList from './components/CatList';
import MapContainer from './components/MapContainer';
import ReportModal from './components/ReportModal'; // 모달 추가

function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [cats, setCats] = useState([]);

  // 🚨 제보 모달 관련 상태 상태관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });

  // 1. 카카오 지도 초기화 및 클릭 이벤트 등록
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
      
      const centerPosition = new window.kakao.maps.LatLng(35.8242, 128.7530); // 영남대 본관
      const mapOptions = {
        center: centerPosition,
        level: 3
      };

      const map = new window.kakao.maps.Map(mapContainer.current, mapOptions);
      mapRef.current = map;

      // 📍 [지도 클릭 이벤트 추가!]
      window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        // 클릭한 위치의 위도경도 좌표를 가져옵니다.
        const latlng = mouseEvent.latLng;
        
        // 모달창을 열고 좌표를 상태에 임시 저장합니다.
        setClickedCoords({
          lat: latlng.getLat(),
          lng: latlng.getLng()
        });
        setIsModalOpen(true);
      });
    }
  }, []);

  // 2. 파이어베이스 실시간 감시 (기존 동일)
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

  // 3. 고양이 변경 시 마커 업데이트 (기존 동일)
  useEffect(() => {
    if (!mapRef.current || cats.length === 0) return;

    cats.forEach((cat) => {
      const markerPosition = new window.kakao.maps.LatLng(cat.lat, cat.lng);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapRef.current
      });

      const iwContent = `
        <div style="padding:12px; min-width:180px; font-family:sans-serif;">
          <div style="font-weight:bold; font-size:14px; color:#4f46e5; margin-bottom:4px;">${cat.icon || '🐈'} ${cat.name}</div>
          <div style="font-size:12px; color:#64748b;">${cat.location}</div>
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: iwContent,
        removable: true
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(mapRef.current, marker);
      });
    });
  }, [cats]);

  const handleCatClick = (lat, lng) => {
    if (mapRef.current) {
      const newCenter = new window.kakao.maps.LatLng(lat, lng);
      mapRef.current.panTo(newCenter);
    }
  };

  // 🔥 4. 모달에서 등록을 눌렀을 때 Firestore에 진짜 데이터를 집어넣는 함수
  const handleReportSubmit = async (newCatData) => {
    try {
      // db객체를 통해 'cats' 컬렉션에 새 문서 추가하기
      await addDoc(collection(db, 'cats'), {
        name: newCatData.name,
        location: newCatData.location,
        icon: newCatData.icon,
        lat: Number(newCatData.lat), // 숫자로 안전하게 형변환
        lng: Number(newCatData.lng)
      });
      console.log("새 고양이가 성공적으로 제보되었습니다!");
    } catch (error) {
      console.error("고양이 제보 중 에러 발생: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-73px)]">
        <CatList cats={cats} onCatClick={handleCatClick} />
        <MapContainer ref={mapContainer} />
      </main>

      {/* 🧩 제보 모달 팝업 조립 */}
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