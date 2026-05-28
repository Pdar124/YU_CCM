import React from 'react';

// forwardRef를 사용하면 App.jsx에 있는 mapContainer 레퍼런스를 이 컴포넌트 안의 <div>로 안전하게 전달할 수 있습니다.
const MapContainer = React.forwardRef((props, ref) => {
  return (
    <section className="flex-1 relative bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      {/* 실제 카카오 지도가 그려질 DOM */}
      <div ref={ref} className="w-full h-full"></div>
      
      <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        파이어베이스 실시간 연동 중
      </div>
    </section>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;