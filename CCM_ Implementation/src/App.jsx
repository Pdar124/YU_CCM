import React, { useEffect, useRef, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// 📦 분리한 컴포넌트들 불러오기
import Header from './components/Header';
import CatList from './components/CatList';
import MapContainer from './components/MapContainer';

function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [cats, setCats] = useState([]);

  // 1. 카카오 지도 초기화
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

      mapRef.current = new window.kakao.maps.Map(mapContainer.current, mapOptions);
    }
  }, []);

  // 2. 파이어베이스 실시간 감시
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

  // 3. 고양이 변경 시 마커 업데이트
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
          <div style="font-weight:bold; font-size:14px; color:#4f46e5; margin-bottom:4px;">${cat.icon} ${cat.name}</div>
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

  // 🎯 사이드바에서 고양이를 클릭했을 때 지도를 이동시키는 핸들러 함수
  const handleCatClick = (lat, lng) => {
    if (mapRef.current) {
      const newCenter = new window.kakao.maps.LatLng(lat, lng);
      mapRef.current.panTo(newCenter);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* 조립된 컴포넌트들 🧩 */}
      <Header />

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-73px)]">
        {/* 데이터를 props로 넘겨줍니다 */}
        <CatList cats={cats} onCatClick={handleCatClick} />
        
        {/* DOM 레퍼런스를 ref로 넘겨줍니다 */}
        <MapContainer ref={mapContainer} />
      </main>
    </div>
  );
}

export default App;