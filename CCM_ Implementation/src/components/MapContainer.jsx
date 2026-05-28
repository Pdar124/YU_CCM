// src/components/MapContainer.jsx
import React from 'react';

const MapContainer = React.forwardRef((props, ref) => {
  return (
    <section className="flex-1 relative bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      {/* 실제 카카오 지도가 그려질 DOM */}
      <div ref={ref} className="w-full h-full"></div>
      
      {/* 안내 뱃지 */}
      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 text-xs font-semibold text-indigo-600 flex items-center gap-2">
        📍 지도 위의 원하는 곳을 클릭하면 고양이를 제보할 수 있어요!
      </div>

      <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 text-xs font-medium text-slate-600 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        파이어베이스 실시간 연동 중
      </div>
    </section>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;