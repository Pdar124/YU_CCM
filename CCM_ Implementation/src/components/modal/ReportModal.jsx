// src/components/modal/ReportModal.jsx

import { useMemo, useState } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  cats,
  clickedCoords,
  selectedCatId,
  user
}) {
  const getCurrentInputTime = () => new Date().toISOString().slice(0, 16);

  const [showNewCatForm, setShowNewCatForm] = useState(false);

  const [tempName, setTempName] = useState('');
  const [gender, setGender] = useState('unknown');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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

        return {
          ...cat,
          matchScore: Math.max(0, Math.round((1 - distance * 1000) * 100))
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }, [cats, clickedCoords]);

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
    if (!imageUrl.trim()) {
      alert('사진 URL을 입력해 주세요.');
      return;
    }

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
          imageUrl: imageUrl.trim(),
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
      setImageUrl('');

      onClose();
    } catch (error) {
      console.error(error);
      alert('신규 고양이 등록 요청에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-slide-up fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            고양이 조우 기록 제보
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {recommendedCats.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                활동 영역 기반 추천 후보
              </label>

              <div className="grid grid-cols-3 gap-2">
                {recommendedCats.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedReportCatId(cat.id)}
                    className={`min-h-20 rounded-2xl border px-2 py-3 text-center text-xs transition-colors ${
                      selectedReportCatId === cat.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon || '🐈'}</div>
                    <div className="truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-400">
                      영역 매칭도 {cat.matchScore || 0}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              제보할 고양이
            </label>

            <select
              value={selectedReportCatId || selectedCatId || ''}
              onChange={(e) => setSelectedReportCatId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">고양이를 선택해 주세요</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon || '🐈'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              발견 시간
            </label>
            <input
              type="datetime-local"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              사진 URL
            </label>
            <input
              type="url"
              value={reportImageUrl}
              onChange={(e) => setReportImageUrl(e.target.value)}
              placeholder="예: https://..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              제보 메모
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 도서관 앞 벤치 아래에 있었음"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex gap-4 text-xs text-slate-400">
            <div>
              <strong>위도:</strong>{' '}
              {clickedCoords?.lat?.toFixed(4)}
            </div>
            <div>
              <strong>경도:</strong>{' '}
              {clickedCoords?.lng?.toFixed(4)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewCatForm(!showNewCatForm)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-300 text-violet-700 font-bold text-sm"
          >
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
                <div className="font-black text-slate-900 mb-3">
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

                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="사진 URL (임시)"
                  className="w-full px-4 py-3 rounded-2xl border border-violet-100 mb-3 text-sm"
                />

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="외형 특징을 입력해 주세요"
                  className="w-full px-4 py-3 rounded-2xl border border-violet-100 mb-3 text-sm resize-none"
                />

                <button
                  type="button"
                  onClick={handleRequestCatRegistration}
                  className="w-full py-3 rounded-2xl bg-violet-600 text-white font-bold text-sm"
                >
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
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-semibold rounded-2xl text-sm shadow-md shadow-indigo-200 transition-colors"
            >
              제보 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
