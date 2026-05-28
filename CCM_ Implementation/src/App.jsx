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

      new window.kakao.maps.Map(mapContainer.current, mapOptions);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      
      {/* 🔝 상단 내비게이션 바 */}
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

      {/* 🗂️ 메인 콘텐츠 영역 (사이드바 + 지도 레이아웃) */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-73px)]">
        
        {/* 📑 왼쪽 사이드바 (고양이 목록 및 위키 들어설 자리) */}
        <section className="w-full md:w-80 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">🐾 우리 동네 고양이들</h2>
            <p className="text-sm text-slate-400 mb-6">캠퍼스를 누비는 길냥이들의 실시간 위치와 위키 정보를 확인해 보세요.</p>
            
            {/* 임시 목록 아이템들 (나중에 동적으로 띄울 곳) */}
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

          {/* 하단 프로젝트 정보 가벼운 영역 */}
          <div className="text-xs text-slate-400 border-t border-slate-100 pt-4 mt-4">
            © 2026 CampusCatMate. All rights reserved.
          </div>
        </section>

        {/* 🗺️ 오른쪽 지도 영역 */}
        <section className="flex-1 relative bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* 실제 지도가 그려지는 DOM 엘리먼트 */}
          <div ref={mapContainer} className="w-full h-full"></div>
          
          {/* 지도 위에 둥둥 떠 있는 플로팅 카드 조작 버튼용 안내 (원하면 지우셔도 됩니다) */}
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