import { Cat, CheckCircle2, List } from 'lucide-react';
import { getCatImageUrl } from '../../utils/catImage';

function CatList({
  cats,
  onCatClick,
  selectedCatId,
  user
}) {
  const isCaregiverMode = user?.activeMode === 'caregiver';

  return (
    <section className="relative z-50 -mx-10 px-4 overflow-visible">
      <div className="flex gap-3 overflow-x-auto overflow-y-visible py-3 pb-2 scrollbar-hide">
        <button
          type="button"
          onClick={() => onCatClick(null)}
          className="shrink-0 group"
        >
          <div
            className={`
              w-[72px] h-[72px] rounded-3xl bg-white shadow-sm border
              flex flex-col items-center justify-center gap-1.5
              transition-all duration-200
              ${
                !selectedCatId
                  ? 'border-emerald-400 scale-105 shadow-emerald-100 text-emerald-600 bg-emerald-50'
                  : 'border-slate-100 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/60'
              }
            `}
          >
            <div
              className={`
                w-10 h-10 rounded-2xl flex items-center justify-center
                ${!selectedCatId ? 'bg-white' : 'bg-slate-50'}
              `}
            >
              <List size={22} strokeWidth={2.5} />
            </div>

            <span
              className={`text-[11px] font-black ${
                !selectedCatId ? 'text-emerald-600' : 'text-slate-600'
              }`}
            >
              전체
            </span>
          </div>
        </button>

        {cats.map((cat) => {
          const isMyCat =
            user?.caregiverCatIds?.includes(cat.id);

          const isSelected = selectedCatId === cat.id;
          const isDimmed = isCaregiverMode && !isMyCat;
          const catImageUrl = getCatImageUrl(cat);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCatClick(cat)}
              className={`shrink-0 group transition-all duration-200 ${
                isDimmed ? 'opacity-45' : 'opacity-100'
              }`}
            >
              <div
                className={`
                  relative w-[72px] h-[72px] rounded-3xl bg-white shadow-sm border
                  flex flex-col items-center justify-center gap-1.5
                  transition-all duration-200
                  ${
                    isSelected
                      ? 'border-orange-400 scale-105 shadow-orange-100 bg-orange-50'
                      : isCaregiverMode && isMyCat
                        ? 'border-orange-200 hover:bg-orange-50/70'
                        : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/50'
                  }
                `}
              >
                {isCaregiverMode && isMyCat && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={13} strokeWidth={3} />
                  </span>
                )}

                <div
                  className={`
                    w-11 h-11 rounded-2xl flex items-center justify-center
                    ${
                      isSelected
                        ? 'bg-white text-orange-500'
                        : 'bg-slate-50 text-orange-400 group-hover:bg-white'
                    }
                  `}
                >
                  {catImageUrl ? (
                    <img
                      src={catImageUrl}
                      alt={cat.name || '고양이'}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : cat.icon ? (
                    <span className="text-2xl leading-none">{cat.icon}</span>
                  ) : (
                    <Cat size={26} strokeWidth={2.5} />
                  )}
                </div>

                <span
                  className={`max-w-[58px] truncate text-[11px] font-black ${
                    isSelected || (isCaregiverMode && isMyCat)
                      ? 'text-orange-500'
                      : 'text-slate-600'
                  }`}
                >
                  {cat.name}
                </span>
              </div>
            </button>
          );
        })}

        {cats.length === 0 && (
          <div className="shrink-0 w-full min-h-[86px] rounded-3xl border border-dashed border-slate-200 bg-white/80 px-4 py-4 text-xs text-slate-400 shadow-sm flex items-center justify-center">
            고양이 데이터를 불러오는 중...
          </div>
        )}
      </div>
    </section>
  );
}

export default CatList;
