// src/components/MapContainer.jsx
import React from 'react';

const MapContainer = React.forwardRef(({ isReady = false }, ref) => {
  return (
    <section className="absolute inset-0 z-0 bg-[#dfe7dc] overflow-hidden">
      <div ref={ref} className="relative w-full h-full" />
      {!isReady && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.35)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute left-[12%] top-[18%] h-24 w-44 rotate-[-8deg] rounded-xl bg-emerald-100/80 border border-emerald-200" />
          <div className="absolute right-[14%] top-[22%] h-28 w-36 rotate-[10deg] rounded-xl bg-slate-100/90 border border-slate-200" />
          <div className="absolute left-[20%] bottom-[22%] h-32 w-40 rotate-[6deg] rounded-xl bg-amber-100/80 border border-amber-200" />
          <div className="absolute right-[18%] bottom-[18%] h-24 w-48 rotate-[-5deg] rounded-xl bg-sky-100/80 border border-sky-200" />
          <div className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 rotate-[18deg] bg-white/60" />
          <div className="absolute left-0 top-[46%] h-10 w-full bg-white/60" />
          <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-3 shadow-sm border border-white text-xs text-slate-500">
            <div className="font-black text-slate-700">영남대학교 지도</div>
            <div>지도를 불러오는 중입니다.</div>
          </div>
        </div>
      )}
    </section>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;
