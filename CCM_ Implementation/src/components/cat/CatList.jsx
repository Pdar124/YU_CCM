import React from 'react';

function CatList({ cats, onCatClick, selectedCatId }) {
  return (
    <section className="mt-3 relative z-50 -mx-4 px-4 overflow-visible">
      <div className="flex gap-4 overflow-x-auto overflow-y-visible py-2 pb-3">
        {cats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCatClick(cat)}
          >
            <div
              className={`
    w-14 h-14 rounded-full bg-white shadow-lg
    flex items-center justify-center text-2xl
    transition-all duration-200
    ${selectedCatId === cat.id
                  ? 'border-4 border-orange-400 scale-105 shadow-orange-200'
                  : 'border border-slate-100'
                }
  `}
            >
              {cat.icon || '🐈'}
            </div>

            <span
              className={`text-[11px] font-bold ${selectedCatId === cat.id
                ? 'text-orange-500'
                : 'text-slate-700'
                }`}
            >
              {cat.name}
            </span>
          </button>
        ))}

        {cats.length === 0 && (
          <div className="text-xs text-slate-400 bg-white/80 px-3 py-2 rounded-full shadow-sm">
            고양이 데이터를 불러오는 중...
          </div>
        )}
      </div>
    </section>
  );
}

export default CatList;