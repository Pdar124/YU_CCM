import { Pencil, Utensils } from 'lucide-react';

function CatCaregiverActions({
  cat,
  onWikiEdit,
  navigate
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() =>
          navigate(`/diet-health/${cat.id}`)
        }
        className="py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100"
      >
        <Utensils size={18} strokeWidth={2.5} />
        <span>급여 기록 작성</span>
      </button>

      <button
        type="button"
        onClick={() => onWikiEdit(cat)}
        className="py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100"
      >
        <Pencil size={18} strokeWidth={2.5} />
        <span>위키 편집</span>
      </button>
    </div>
  );
}

export default CatCaregiverActions;