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
        <div className="mt-3 flex gap-3 text-xs text-slate-600">
            {activeMode === 'caregiver' ? (
                <>
                    <div className="flex-1 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        🎯 최근 급여
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        📍 나의 담당 고양이
                    </div>
                </>
            ) : (
                <>
                    <div className="basis-3/5 min-w-0 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        <span className="shrink-0">🎯</span>
                        <span className="truncate">최근 제보 {latestTimeText || '없음'}</span>
                    </div>

                    <div className="basis-2/5 min-w-0 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        <span className="truncate">📍 인기 제보 구역</span>
                    </div>
                </>
            )}
        </div>
    );
}

export default StatusFilterBar;
