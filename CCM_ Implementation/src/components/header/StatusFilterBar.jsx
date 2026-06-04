import { MapPin, Target, Utensils } from 'lucide-react';
import { getTimeAgo } from '../../utils/time';

function StatusFilterBar({
  latestReport,
  activeMode,
  latestDietLogs = []
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

    if (activeMode === 'caregiver') {
        return (
            <div className="mt-1 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-slate-700 shadow-sm">
                <div className="mb-1.5 flex items-center gap-1.5 font-black text-amber-700">
                    <Utensils
                        size={14}
                        strokeWidth={2.5}
                        className="shrink-0 text-amber-600"
                    />
                    <span>담당 고양이 급여 기록</span>
                </div>

                {latestDietLogs.length > 0 ? (
                    <div className="space-y-1">
                        {latestDietLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center justify-between gap-2"
                            >
                                <span className="min-w-0 truncate font-bold">
                                    {log.catName || '이름 정보 없음'}
                                </span>
                                <span className="shrink-0 font-semibold text-amber-700">
                                    {getTimeAgo(log.fedAt) || '시간 정보 없음'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="font-semibold text-slate-400">
                        최근 급여 기록 없음
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mt-1 flex gap-3 text-xs text-slate-600">
            <div className="basis-3/5 min-w-0 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                <Target size={14} strokeWidth={2.5} className="shrink-0 text-emerald-500" />
                <span className="truncate">최근 제보 {latestTimeText || '없음'}</span>
            </div>

            <div className="basis-2/5 min-w-0 flex items-center justify-center gap-1 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                <MapPin size={14} strokeWidth={2.5} className="shrink-0 text-indigo-500" />
                <span className="truncate">인기 제보 구역</span>
            </div>
        </div>
    );
}

export default StatusFilterBar;
