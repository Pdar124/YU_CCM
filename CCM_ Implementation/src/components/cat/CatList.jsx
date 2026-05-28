import React from 'react';

function CatList({ cats, onCatClick }) {
  return (
    <section className="w-full md:w-80 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between shrink-0">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">🐾 우리 동네 고양이들</h2>
        <p className="text-sm text-slate-400 mb-6">캠퍼스를 누비는 길냥이들의 실시간 위치와 위키 정보를 확인해 보세요.</p>

        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
          {cats.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer"
              onClick={() => onCatClick(cat)}
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg">
                {cat.icon || '🐈'}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-800">{cat.name}</h3>
                <p className="text-xs text-indigo-600 font-medium">{cat.location}</p>
              </div>
            </div>
          ))}
          {cats.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">고양이 데이터를 불러오는 중입니다...</p>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-400 border-t border-slate-100 pt-4 mt-4">
        © 2026 CampusCatMate. All rights reserved.
      </div>
    </section>
  );
}

export default CatList;