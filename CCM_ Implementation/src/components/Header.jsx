import React from 'react';

function Header({ user, onLogout, weather, weatherLoading, isRain }) {
  return (
    <header className="p-4 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl">🐾</span>
        <span className="font-bold text-slate-800 text-lg tracking-tight">Campus Cat Mate</span>
      </div>
      
      <div className="flex items-center gap-6">
        {/* 🌤️ OpenWeather API 연동 날씨 영역 */}
        <div className="text-xs bg-yellow-50 border border-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-slate-600">
          {weatherLoading ? (
            <span className="animate-pulse">날씨 로딩 중...</span>
          ) : weather ? (
            <>
              {/* OpenWeather 공식 날씨 아이콘 (예: ☀️, ☁️ 대신 공식 이미지 적용) */}
              <img 
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} 
                alt={weather.weather[0].description}
                className="w-5 h-5 object-contain -my-1" 
              />
              <span className="font-semibold text-slate-800">{weather.main.temp.toFixed(1)}°C</span>
              <span className="text-slate-400">|</span>
              <span>{weather.name}</span>

              {isRain && (
                <>
                  <span className="text-slate-400">|</span>
                  <span className="text-amber-600 font-bold">비 오는 날이에요 🌧️</span>
                </>
              )}
            </>
          ) : (
            <span>날씨 정보 없음</span>
          )}
        </div>

        {/* 사용자 정보 및 로그아웃 */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-xl text-sm">
              <strong className="text-slate-800 font-semibold">{user.id}</strong>님 
              ({user.role === 'member' ? '회원' : '방문자'})
            </span>
            <button 
              onClick={onLogout} 
              className="text-xs font-medium bg-green-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl transition"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;