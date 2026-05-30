// src/components/CatDetail.jsx
import React, { useState, useEffect } from 'react';

function CatDetail({ cat, onClose, onUpdateCat, isRain, Shelter, predictedLocation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  // 선택된 고양이가 바뀌면 편집창 텍스트도 동기화
  useEffect(() => {
    if (cat) {
      setEditedBio(cat.bio || '이 고양이에 대한 설명을 적어주세요.');
    }
  }, [cat]);

  if (!cat) return null;

  const handleBioSave = () => {
    onUpdateCat(cat.id, { bio: editedBio });
    setIsEditing(false);
  };

  const toggleFeeding = () => {
    const nextStatus = cat.lastFed === '밥 가득함 🍗' ? '배고픔 🐾' : '밥 가득함 🍗';
    onUpdateCat(cat.id, { lastFed: nextStatus });
  };

  return (
    <div className="w-full md:w-80 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between shrink-0 animate-in slide-in-from-right-5 duration-200">
      <div>
        {/* 상단 닫기 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cat.icon || '🐈'}</span>
            <h2 className="text-xl font-bold text-slate-900">{cat.name}</h2>
          </div>
          {isRain && (
            <div className="mb-4 bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-semibold">
              ☔ 비 피하는 중
            </div>
          )}
          {/* 예측 위치가 있을 때만 보여주는 영역 */}
          {predictedLocation && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
              <div className="font-bold">
                📍 예측 출몰 위치
              </div>
              <div className="text-sm">
                위도: {predictedLocation.lat.toFixed(5)}
              </div>
              <div className="text-sm">
                경도: {predictedLocation.lng.toFixed(5)}
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {/* 🍗 급식 상태 관리 영역 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">현재 식사 상태</div>
          <div className="text-lg font-black text-slate-800 mb-3">{cat.lastFed || '정보 없음 ❓'}</div>
          <button
            onClick={toggleFeeding}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${cat.lastFed === '밥 가득함 🍗'
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
          >
            {cat.catName} {cat.lastFed === '밥 가득함 🍗' ? '🔄 배고픈 상태로 변경' : '🍖 사료 챙겨줬음!'}
          </button>
        </div>

        {/* 📝 냥위키 (상세 설명 및 편집) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">🐾 냥위키 (특징)</label>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-xs font-semibold text-indigo-600 hover:underline">편집</button>
            ) : (
              <button onClick={handleBioSave} className="text-xs font-bold text-emerald-600 hover:underline">저장</button>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          ) : (
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {cat.bio || '아직 등록된 특징이 없습니다. 첫 위키 작성자가 되어보세요!'}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-400 border-t border-slate-100 pt-4 mt-4">
        📍 {cat.location}
      </div>
    </div>
  );
}

export default CatDetail;