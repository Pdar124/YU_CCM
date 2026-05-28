import React from 'react';

function Header() {
  return (
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
  );
}

export default Header;