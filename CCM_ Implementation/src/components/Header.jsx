import React from 'react';

function Header({ user, onLogout }) {
  return (
    <header className="p-4 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl">🐾</span>
        <span className="font-bold text-slate-800 text-lg tracking-tight">Campus Cat Mate</span>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            <strong className="text-slate-800 font-semibold">{user.id}</strong>님 
            ({user.role === 'member' ? '회원' : '방문자'})
          </span>
          <button 
            onClick={onLogout} 
            className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl transition"
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;