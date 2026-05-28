import React from 'react';

function App() {
  return (
    <div className="bg-slate-50 flex flex-col items-center justify-center min-h-screen">
      {/* Tailwind v4 폰트 및 컬러 스타일링 */}
      <h1 className="text-3xl font-extrabold text-indigo-600 mb-6">
        🐈 Campus Cat Mate
      </h1>
      
      {/* 지도가 들어갈 임시 박스 */}
      <div id="map" className="w-full max-w-2xl h-[400px] bg-white rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center text-gray-400">
        여기에 카카오 지도가 뜰 예정입니다.
      </div>
    </div>
  );
}

export default App;