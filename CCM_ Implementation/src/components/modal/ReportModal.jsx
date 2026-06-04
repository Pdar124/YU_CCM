// src/components/modal/ReportModal.jsx

import { useMemo, useState } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  CalendarClock,
  Cat,
  ChevronDown,
  CirclePlus,
  Image,
  MapPin,
  MessageSquareText,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { getCatImageUrl } from '../../utils/catImage';
import { getPredictedLocation } from '../../utils/prediction';

const getTimestampMillis = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (value.toDate) return value.toDate().getTime();

  return null;
};

const getDistanceScore = (distance) =>
  Math.max(0, Math.round((1 - distance * 1000) * 100));

const getTimeZoneScore = (catId, reports, observedAt) => {
  const observedDate = observedAt ? new Date(observedAt) : new Date();
  const observedHour = observedDate.getHours();
  const catReports = reports.filter((report) => report.catId === catId);

  if (catReports.length === 0) return 50;

  const bestHourDistance = catReports.reduce((best, report) => {
    const reportMillis =
      getTimestampMillis(report.observedAt) ||
      getTimestampMillis(report.createdAt);

    if (!reportMillis) return best;

    const reportHour = new Date(reportMillis).getHours();
    const hourDiff = Math.abs(reportHour - observedHour);
    const circularHourDiff = Math.min(hourDiff, 24 - hourDiff);

    return Math.min(best, circularHourDiff);
  }, 12);

  return Math.max(0, Math.round((1 - bestHourDistance / 12) * 100));
};

function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  cats,
  reports = [],
  shelters = [],
  clickedCoords,
  selectedCatId,
  isRain,
  user
}) {
  const getCurrentInputTime = () => new Date().toISOString().slice(0, 16);

  const [showNewCatForm, setShowNewCatForm] = useState(false);

  const [tempName, setTempName] = useState('');
  const [gender, setGender] = useState('unknown');
  const [description, setDescription] = useState('');

  const [selectedReportCatId, setSelectedReportCatId] = useState(selectedCatId || '');
  const [memo, setMemo] = useState('');
  const [reportImageUrl, setReportImageUrl] = useState('');
  const [observedAt, setObservedAt] = useState(getCurrentInputTime);

  const recommendedCats = useMemo(() => {
    if (!clickedCoords?.lat || !clickedCoords?.lng) return cats.slice(0, 3);

    return [...cats]
      .map((cat) => {
        const latDiff = Number(cat.lat || 0) - clickedCoords.lat;
        const lngDiff = Number(cat.lng || 0) - clickedCoords.lng;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        const territoryScore = getDistanceScore(distance);
        const predictedLocation = getPredictedLocation({
          catId: cat.id,
          reports,
          shelters,
          isRain
        });
        const predictionScore = predictedLocation
          ? getDistanceScore(
              Math.sqrt(
                Math.pow(predictedLocation.lat - clickedCoords.lat, 2) +
                Math.pow(predictedLocation.lng - clickedCoords.lng, 2)
              )
            )
          : territoryScore;
        const timeZoneScore = getTimeZoneScore(cat.id, reports, observedAt);
        const matchScore = Math.round(
          territoryScore * 0.4 +
          predictionScore * 0.45 +
          timeZoneScore * 0.15
        );

        return {
          ...cat,
          matchScore,
          predictionScore
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }, [cats, clickedCoords, isRain, observedAt, reports, shelters]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const reportCatId = selectedReportCatId || selectedCatId;

    if (!reportCatId) {
      alert('제보할 고양이를 선택해 주세요!');
      return;
    }

    onSubmit({
      catId: reportCatId,
      memo,
      imageUrl: reportImageUrl.trim(),
      observedAt: observedAt ? new Date(observedAt) : new Date()
    });

    setSelectedReportCatId('');
    setMemo('');
    setReportImageUrl('');
    setObservedAt(getCurrentInputTime());
  };

  const handleRequestCatRegistration = async () => {
    if (!description.trim()) {
      alert('외형 특징을 입력해 주세요.');
      return;
    }

    try {
      await addDoc(
        collection(db, 'catRegistrationRequests'),
        {
          tempName: tempName.trim() || '이름 미정',
          gender,
          description: description.trim(),
          requesterUid: user?.uid || '',
          requesterName:
            user?.nickname ||
            user?.studentId ||
            user?.id ||
            '익명 사용자',
          lat: clickedCoords?.lat,
          lng: clickedCoords?.lng,
          observedAt: observedAt ? new Date(observedAt) : new Date(),
          status: 'pending',
          createdAt: serverTimestamp()
        }
      );

      alert('신규 고양이 등록 요청이 접수되었습니다.');

      setShowNewCatForm(false);
      setTempName('');
      setGender('unknown');
      setDescription('');

      onClose();
    } catch (error) {
      console.error(error);
      alert('신규 고양이 등록 요청에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-5 w-full max-w-md max-h-[86vh] overflow-y-auto shadow-2xl border border-slate-100 animate-slide-up fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin size={22} strokeWidth={2.5} />
            </div>

            <div>
              <h2 className="text-xl font-semibold px-1 text-slate-900">
                고양이 조우 기록 제보
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 px-1">
                발견 위치와 시간을 기록해 주세요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="제보 모달 닫기"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {recommendedCats.length > 0 && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                <Sparkles size={14} strokeWidth={2.5} className="text-indigo-500" />
                활동 영역 기반 추천 후보
              </label>

              <div className="grid grid-cols-3 gap-2">
                {recommendedCats.map((cat) => {
                  const catImageUrl = getCatImageUrl(cat);

                  return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedReportCatId(cat.id)}
                    className={`min-h-24 rounded-3xl border px-2 py-3 text-center text-xs transition-all ${
                      selectedReportCatId === cat.id
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-bold shadow-sm scale-[1.02]'
                        : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white mx-auto mb-1 flex items-center justify-center text-orange-500">
                      {catImageUrl ? (
                        <img
                          src={catImageUrl}
                          alt={cat.name || '고양이'}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : cat.icon ? (
                        <span className="text-2xl leading-none">{cat.icon}</span>
                      ) : (
                        <Cat size={23} strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-400">
                      영역 매칭도 {cat.matchScore || 0}%
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <Cat size={14} strokeWidth={2.5} className="text-orange-500" />
              제보할 고양이
            </label>

            <div className="relative">
              <select
                value={selectedReportCatId || selectedCatId || ''}
                onChange={(e) => setSelectedReportCatId(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-200 focus:bg-white focus:shadow-sm transition-all"
              >
                <option value="">고양이를 선택해 주세요</option>
                {cats.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                strokeWidth={2.5}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <CalendarClock size={14} strokeWidth={2.5} className="text-emerald-500" />
              발견 시간
            </label>
            <input
              type="datetime-local"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-200 focus:bg-white focus:shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <Image size={14} strokeWidth={2.5} className="text-violet-500" />
              사진 URL
            </label>
            <input
              type="url"
              value={reportImageUrl}
              onChange={(e) => setReportImageUrl(e.target.value)}
              placeholder="예: https://..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-200 focus:bg-white focus:shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <MessageSquareText size={14} strokeWidth={2.5} className="text-slate-500" />
              제보 메모
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 도서관 앞 벤치 아래에 있었음"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-200 focus:bg-white focus:shadow-sm transition-all"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-white text-indigo-500 flex items-center justify-center shrink-0">
              <MapPin size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div>
                <strong>위도:</strong>{' '}
                {clickedCoords?.lat?.toFixed(4)}
              </div>
              <div>
                <strong>경도:</strong>{' '}
                {clickedCoords?.lng?.toFixed(4)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewCatForm(!showNewCatForm)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 text-violet-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-violet-50 transition-all"
          >
            <CirclePlus size={17} strokeWidth={2.5} />
            새로운 고양이인가요?
          </button>

          <div
            className={`grid transition-all duration-300 ease-out ${showNewCatForm
                ? 'grid-rows-[1fr] opacity-100 mt-3'
                : 'grid-rows-[0fr] opacity-0 mt-0'
              }`}
          >
            <div className="overflow-hidden">
              <div className="p-4 bg-violet-50 rounded-3xl border border-violet-100">
                <div className="flex items-center gap-2 font-black text-slate-900 mb-3">
                  <Cat size={18} strokeWidth={2.5} className="text-violet-600" />
                  신규 고양이 등록 요청
                </div>

                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="이름 (선택)"
                  className="w-full px-4 py-3 rounded-2xl border border-violet-100 mb-3 text-sm"
                />

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-violet-100 mb-3 text-sm bg-white"
                >
                  <option value="male">수컷</option>
                  <option value="female">암컷</option>
                  <option value="unknown">모름</option>
                </select>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="외형 특징을 입력해 주세요"
                  className="w-full px-4 py-3 rounded-2xl border border-violet-100 mb-3 text-sm resize-none"
                />

                <button
                  type="button"
                  onClick={handleRequestCatRegistration}
                  className="w-full py-3 rounded-2xl bg-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-violet-700 transition-all"
                >
                  <Send size={16} strokeWidth={2.5} />
                  등록 요청
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl text-sm transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-bold rounded-2xl text-sm shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} strokeWidth={2.5} />
              제보 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
