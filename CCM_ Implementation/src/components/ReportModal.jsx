// src/components/ReportModal.jsx
import React, { useState } from 'react';

function ReportModal({ isOpen, onClose, onSubmit, lat, lng }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState(''); // 📝 추가
  const [icon, setIcon] = useState('🐈');

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !location) {
      alert('고양이 이름과 출몰 위치를 입력해 주세요!');
      return;
    }
    // bio 정보도 함께 제출
    onSubmit({ name, location, bio, icon, lat, lng });
    
    setName('');
    setLocation('');
    setBio('');
    setIcon('🐈');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">🐾 새로운 고양이 제보하기</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">고양이 아이콘</label>
            <div className="flex gap-2">
              {['🐈', '🦁', '🐱', '🐈‍⬛', '🐯'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all ${icon === emoji ? 'bg-indigo-50 border-2 border-indigo-500 scale-110' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">고양이 이름 (별명)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 치즈, 까망이, 대장냥"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">주요 출몰 위치</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 중앙도서관 벤치 뒤, 공대식당 뒤편"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* 📝 특징 입력칸 추가 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">한 줄 특징 (냥위키 기초)</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="예: 사람을 좋아하고 츄르를 잘 먹음"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex gap-4 text-xs text-slate-400">
            <div><strong>위도:</strong> {lat.toFixed(4)}</div>
            <div><strong>경도:</strong> {lng.toFixed(4)}</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl text-sm transition-colors">취소</button>
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-semibold rounded-2xl text-sm shadow-md shadow-indigo-200 transition-colors">등록하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;