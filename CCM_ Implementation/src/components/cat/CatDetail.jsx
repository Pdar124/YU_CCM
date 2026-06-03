// src/components/cat/CatDetail.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CatCaregiverActions from './CatCaregiverActions';
import CatStudentActions from './CatStudentActions';

function CatDetail({
    cat,
    user,
    isRain,
    predictedLocation,
    reportCount,
    latestReport,
    nearestShelter,
    hasLatestDietLog,
    onClose,
    onReport,
    onWikiEdit,
    onHistoryView
}) {
  const navigate = useNavigate();
  const [showPrediction, setShowPrediction] = useState(false);

  if (!cat) return null;

  const isMyCat =
    user?.caregiverCatIds?.includes(cat.id);
  const isGuest = user?.role === 'guest';

 return (
  <div
    className={`absolute left-4 right-4 z-40 rounded-3xl p-4 shadow-2xl border bg-white border-slate-100 ${
      hasLatestDietLog ? 'bottom-35' : 'bottom-20'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-emerald-50"
          >
            {cat.icon || '🐈'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                {cat.name}
              </h2>
              {user?.activeMode === 'caregiver' && isMyCat && (
                <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-orange-100 text-orange-600">
                  담당 고양이
                </span>
              )}


              {isRain && (
                <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-bold">
                  ☔ 대피 가능성
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              📍 {cat.location || '위치 정보 없음'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold"
        >
          ✕
        </button>
      </div>
      {predictedLocation && (
        <button
          type="button"
          onClick={() => setShowPrediction((prev) => !prev)}
          className="w-full mb-3 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-black"
        >
          📍 동선 분석 {showPrediction ? '접기' : '보기'}
        </button>
      )}

      {showPrediction && predictedLocation && (
        <div className="rounded-2xl p-3 mb-3 border bg-indigo-50 border-indigo-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-black text-indigo-700">
              📍 AI 예측 위치
            </span>
            <span className="text-[10px] text-indigo-500 font-semibold">
              Recency Weight
            </span>
          </div>

          <div className="text-xs text-slate-600">
            위도 {predictedLocation.lat.toFixed(5)} · 경도{' '}
            {predictedLocation.lng.toFixed(5)}
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            최근 {reportCount || 0}건의 제보를 기반으로 예측했습니다.
          </div>
        </div>
      )}

      {isRain && nearestShelter && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-3 text-xs text-blue-700 font-semibold">
          ☔ 비 오는 날이에요. {nearestShelter.name} 근처에 있을 가능성이 높아요.
        </div>
      )}
      {user?.activeMode === 'caregiver' &&
        isMyCat && (
          <CatCaregiverActions
            cat={cat}
            navigate={navigate}
            onWikiEdit={onWikiEdit}
            onHistoryView={onHistoryView}
          />
        )}

      {isGuest && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onHistoryView(cat)}
            className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold"
          >
            상세 정보 보기
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold"
          >
            제보하기
          </button>
        </div>
      )}

      {!isGuest && user?.activeMode !== 'caregiver' && (
        <CatStudentActions
          cat={cat}
          onReport={onReport}
          onDetailView={onHistoryView}
        />
      )}



    </div >
  );
}

export default CatDetail;
