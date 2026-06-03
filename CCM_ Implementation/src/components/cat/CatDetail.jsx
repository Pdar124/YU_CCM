// src/components/cat/CatDetail.jsx
import { Cat, CloudRain, MapPin, X } from 'lucide-react';
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

  if (!cat) return null;

  const isMyCat =
    user?.caregiverCatIds?.includes(cat.id);
  const isGuest = user?.role === 'guest';

 return (
  <div
    className={`absolute left-4 right-4 z-40 rounded-3xl p-4 shadow-sm border bg-white border-slate-100 ${
      hasLatestDietLog ? 'bottom-[130px]' : 'bottom-20'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-emerald-50 text-emerald-600"
          >
            {cat.icon ? (
              <span className="text-3xl">{cat.icon}</span>
            ) : (
              <Cat size={28} strokeWidth={2.5} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {cat.name}
              </h2>
              {user?.activeMode === 'caregiver' && isMyCat && (
                <span className="text-[10px] px-2 py-1 rounded-full font-semibold bg-orange-100 text-orange-600">
                  담당 고양이
                </span>
              )}


              {isRain && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-bold">
                  <CloudRain size={12} strokeWidth={2.5} />
                  대피 가능성
                </span>
              )}
            </div>

            <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin size={12} strokeWidth={2.5} className="shrink-0" />
              <span>{cat.location || '위치 정보 없음'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="고양이 상세 닫기"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>


      {isRain && nearestShelter && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-3 text-xs text-blue-700 font-semibold flex items-start gap-2">
          <CloudRain size={16} strokeWidth={2.5} className="shrink-0 mt-0.5" />
          <span>
            비 오는 날이에요. {nearestShelter.name} 근처에 있을 가능성이 높아요.
          </span>
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
            onClick={() => alert('로그인 후 이용 가능합니다.')}
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
