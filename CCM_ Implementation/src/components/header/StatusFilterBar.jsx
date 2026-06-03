import { Cat, MapPin, Target, Utensils } from 'lucide-react';

function StatusFilterBar({
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
        <div className="mt-1 flex gap-3 text-xs text-slate-600">
            {activeMode === 'caregiver' ? (
                <>
                    <div className="flex-1 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        <Utensils size={14} strokeWidth={2.5} className="shrink-0 text-amber-500" />
                        <span className="truncate">최근 급여</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        <Cat size={14} strokeWidth={2.5} className="shrink-0 text-orange-500" />
                        <span className="truncate">나의 담당 고양이</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="basis-3/5 min-w-0 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        <Target size={14} strokeWidth={2.5} className="shrink-0 text-emerald-500" />
                        <span className="truncate">최근 제보 {latestTimeText || '없음'}</span>
                    </div>

                    <div className="basis-2/5 min-w-0 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                        <MapPin size={14} strokeWidth={2.5} className="shrink-0 text-indigo-500" />
                        <span className="truncate">인기 제보 구역</span>
                    </div>
                </>
            )}
        </div>
    );
}

export default StatusFilterBar;
