import React, { useEffect, useRef } from 'react';

function App() {
  const mapContainer = useRef(null);

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

    script.onerror = () => {
      console.error("카카오 지도 스크립트 로드에 실패했습니다.");
    };

    document.head.appendChild(script);

    function initMap() {
      if (!mapContainer.current) return;
      
      // 영남대 본관 앞 좌표
      const centerPosition = new window.kakao.maps.LatLng(35.8242, 128.7530);
      const mapOptions = {
        center: centerPosition,
        level: 3
      };

      // 1. 지도 객체 생성
      const map = new window.kakao.maps.Map(mapContainer.current, mapOptions);

      // -------------------------------------------------------------
      // 📍 [여기서부터 마커 추가 영역!]
      // -------------------------------------------------------------

      // 2. 임시 고양이 위치 좌표 정의 (본관 바로 옆 공터 느낌)
      const catPosition = new window.kakao.maps.LatLng(35.8245, 128.7535);

      // 3. 마커 객체 생성
      const marker = new window.kakao.maps.Marker({
        position: catPosition,
        map: map // 이 마커를 어떤 지도 위에 띄울지 지정
      });

      // 4. 마커를 클릭했을 때 띄울 말풍선(InfoWindow) 콘텐츠 설정
      // Tailwind v4 클래스를 인라인 스타일에 가볍게 섞어 넣을 수 있는 HTML 문자열입니다.
      const iwContent = `
        <div style="padding:12px; min-width:180px; font-family:sans-serif;">
          <div style="font-weight:bold; font-size:14px; color:#4f46e5; margin-bottom:4px;">🧀 치즈 발견!</div>
          <div style="font-size:12px; color:#64748b;">방금 전 중앙도서관 근처에서 밥 먹는 중</div>
        </div>
      `;
      const iwRemoveable = true; // x 버튼을 눌러 닫을 수 있게 설정

      // 5. 인포윈도우 객체 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: iwContent,
        removable: iwRemoveable
      });

      // 6. 마커에 클릭 이벤트 등록하기
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 마커 위에 인포윈도우를 표시합니다
        infowindow.open(map, marker);
      });
      
      // -------------------------------------------------------------
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* 상단 내비바 (기존 코드 동일) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐈</span>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            CampusCatMate
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full border border-indigo-100">
            영남대학교 캠퍼스
          </span>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (기존 코드 동일) */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-73px)]">
        <section className="w-full md:w-80 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">🐾 우리 동네 고양이들</h2>
            <p className="text-sm text-slate-400 mb-6">캠퍼스를 누비는 길냥이들의 실시간 위치와 위키 정보를 확인해 보세요.</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg">🦁</div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">치즈</h3>
                  <p className="text-xs text-amber-600 font-medium">중앙도서관 부근 출몰</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-lg">🦨</div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">카오스</h3>
                  <p className="text-xs text-slate-500 font-medium">공대식당 뒤편</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 border-t border-slate-100 pt-4 mt-4">
            © 2026 CampusCatMate. All rights reserved.
          </div>
        </section>

        <section className="flex-1 relative bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div ref={mapContainer} className="w-full h-full"></div>
          <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            지도 실시간 연동 중
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;