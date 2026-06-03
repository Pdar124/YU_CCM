function StatusFilterBar({
  weather,
  weatherLoading,
  isRain,
  latestReport,
  activeMode
}) {
    const formatReportTime = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return null;

        return timestamp.toDate().toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const latestTimeText = formatReportTime(latestReport?.createdAt);

    return (
        <div className="mt-3 ml-0 flex items-center gap-3 overflow-x-auto text-xs text-slate-600 pb-1">
            <div className="flex ml-0 items-center">
                {activeMode === 'caregiver' ? (
                    <>
                        <div className="shrink-0 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                            🎯 최근 급여
                        </div>

                        <div className="shrink-0 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                            📍 나의 담당 고양이
                        </div>

    
                    </>
                ) : (
                    <>
                        <div className="shrink-0 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                            🎯 최근 제보 {latestTimeText || '없음'}
                        </div>

                        <div className="shrink-0 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                            📍 인기 제보 구역
                        </div>
                    </>
                )}
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                {weatherLoading ? (
                    <span>날씨 불러오는 중...</span>
                ) : weather ? (
                    <>
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                            alt={weather.weather[0].description}
                            className="w-5 h-5 object-contain"
                        />

                        <span className="font-semibold text-slate-800">
                            {weather.main.temp.toFixed(1)}°C
                        </span>

                        <span className="text-slate-400">|</span>

                        <span className="text-slate-600">
                            {weather.name === "Gyeongsan-si" && <span>영남대학교</span>}
                        </span>

                        {isRain && (
                            <>
                                <span className="text-slate-400">|</span>

                                <span className="text-amber-600 font-bold">
                                    비 오는 날 🌧️
                                </span>
                            </>
                        )}
                    </>
                ) : (
                    <span>날씨 정보 없음</span>
                )}
            </div>
        </div>
    );
}

export default StatusFilterBar;
