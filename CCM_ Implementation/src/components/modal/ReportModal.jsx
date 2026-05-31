// src/components/modal/ReportModal.jsx

import React, { useState, useEffect } from 'react';

function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  cats,
  clickedCoords,
  selectedCatId
}) {
  const [selectedReportCatId, setSelectedReportCatId] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    setSelectedReportCatId(selectedCatId || '');
  }, [selectedCatId, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!selectedReportCatId) {
      alert('제보할 고양이를 선택해 주세요!');
      return;
    }

    onSubmit({
      catId: selectedReportCatId,
      memo
    });

    setSelectedReportCatId('');
    setMemo('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            🐾 고양이 조우 기록 제보
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              제보할 고양이
            </label>

            <select
              value={selectedReportCatId}
              onChange={(e)=> setSelectedReportCatId(e.target.value)}
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