function CatCaregiverActions({
  cat,
  onWikiEdit,
  onHistoryView,
  navigate
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() =>
          navigate(`/diet-health/${cat.id}`)
        }
        className="py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
      >
        🍽️<br />
        급여 기록 작성
      </button>

      <button
        onClick={() => onWikiEdit(cat)}
        className="py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
      >
        ✏️<br />
        위키 편집
      </button>

      <button
        onClick={() => onHistoryView(cat)}
        className="py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
      >
        📋<br />
        히스토리 보기
      </button>
    </div>
  );
}

export default CatCaregiverActions;